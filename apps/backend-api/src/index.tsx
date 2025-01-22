import type { Serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Auth, commitSession } from "backend/auth";
import { Resend } from "resend";
import { EmailOtp } from "email-template";
import { note } from "./notes";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import {
	createGoogleGenerativeAI,
	streamText,
	type CoreAssistantMessage,
	type CoreUserMessage,
	type MessagesStored,
} from "backend/ai";
import { and, db, eq } from "backend/db";
import { chats, chatsNotes, userChats } from "backend/schema";
import { chat } from "./chat";
import type {
	SendMessage,
	WebsocketError,
	GeneratingStatus,
	textStream,
	StartTextStream,
	WsMsg,
} from "./wsTypes";
import { tools } from "./tools";

import { getSystemPrompt } from "./getSystemPromt";
import { frontend } from "frontend"

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

declare module "bun" {
	interface Env {
		FRONTEND: string;
		DB_PATH: string;
		RESEND: string;
		AI_TOKEN: string;
		VITE_BACKEND: string;
		VITE_WS: string;
		COOKIE: string;
	}
}

export type Variables = {
	userID: number;
};

const app = new Hono<{
  Variables: Variables;
}>()
  .use(
    "*",
    cors({
      origin: `https://${Bun.env.FRONTEND}`,
      allowMethods: ["POST", "GET"],
      credentials: true,
      allowHeaders: ["Origin", "Content-Type", "Accept"],
    })
  )
  .use("/api/*", async (c, next) => {
    const header = c.req.header("Cookie");
    const auth = new Auth();
    const session = await auth.init(header);
    if (!session) {
      return c.json(
        {
          error: "Session not initialized",
        },
        401
      );
    }
    c.header("Set-Cookie", await commitSession(session));
    const userID = session.get("userID");
    console.log("USER ID (MD)", userID);
    if (userID === undefined) {
      console.log("User not logged in");
      return c.json({
        error: "User not logged in (MD)",
        redirect: true,
      });
    }
    c.set("userID", userID);
    return next();
  })
  .post(
    "/auth",
    zValidator(
      "json",
      z.object({
        action: z.enum(["verify", "request", "logout"]),
        email: z.string().email().optional(),
        otp: z.string().length(4).optional(),
      }),
      (result, c) => {
        if (!result.success) {
          return c.json(
            {
              error: "Invalid request",
            },
            401
          );
        }
      }
    ),
    async (c) => {
      const data = c.req.valid("json");
      const auth = new Auth();

      const session = await auth.init(c.req.header("Cookie"));
      if (session === false) {
        return c.json(
          {
            error: "Session not initialized",
          },
          401
        );
      }
      const userID = session.get("userID");
      console.log("USER ID (VF)", userID);
      if (userID) {
        console.log("User is already logged in");
        return c.json({
          error: "User is already logged in",
          redirect: true,
          loacton: "/",
        });
      }
      if (data.action === "request") {
        try {
          if (!data.email) {
            return c.json(
              {
                error: "Email not provided in request",
              },
              401
            );
          }

          const otp = auth.setOtpRequest(data.email);
          const resend = new Resend(Bun.env.RESEND);

          await resend.emails.send({
            from: "auth@mysoulwise.com",
            to: data.email,
            subject: `Your OTP is ${otp.otp}`,
            react: <EmailOtp otp={otp.otp} />,
          });
          console.log("OTP", otp.otp);

          c.header("Set-Cookie", await commitSession(session));
          return c.json(
            {
              otpRequested: otp.otpRequested,
            },
            200
          );
        } catch (e) {
          const status = auth.abortOTP();
          return c.json(
            {
              error: status.error,
            },
            401,
            {
              "Set-Cookie": await commitSession(session),
            }
          );
        }
      }
      if (data.action === "verify") {
        const otpID = auth.isOTPRequested();
        const email = session.get("email");
        console.log("EMAIL VERIDYF", email);
        if (!email) {
          return c.json(
            {
              error: "Email not found in cookie",
            },
            401
          );
        }
        if (!otpID.otpRequested) {
          return c.json(
            {
              error: "OTP not requested",
            },
            401
          );
        }
        if (!data.otp) {
          return c.json(
            {
              error: "OTP not provided",
            },
            401
          );
        }
        const otpMatch = await auth.verifyOTP(data.otp);
        if (otpMatch === true) {
          c.header("Set-Cookie", await commitSession(session));
          return c.json({
            redirect: true,
            location: "/",
          });
        }
        return c.json(
          {
            error: otpMatch.error,
          },
          401
        );
      }
      if (data.action === "logout") {
        auth.logout();
        c.header("Set-Cookie", await commitSession(session));
        return c.json({
          redirect: true,
        });
      }
      return c.json(
        {
          error: "Invalid action",
        },
        401
      );
    }
  )
  .get("/api", async (c) => {
    const auth = new Auth();
    const session = await auth.init(c.req.header("Cookie"));
    if (session === false) {
      return c.json(
        {
          error: "Session not initialized",
        },
        401
      );
    }
    const userID = session.get("userID");
    if (!userID) {
      session.set("userID", 1234);
      c.header("Set-Cookie", await commitSession(session));
      return c.json(
        {
          error: "User not logged in bro",
          rediect: true,
        },
        401
      );
    }
    console.log("USER ID", userID);

    return c.json({ userID }, 200);
  })
  .route("/api/note", note)
  .route("/api/chat", chat)
  .get(
    "/api/chat/ws/:chatID",
    upgradeWebSocket((c) => {
      const userID = c.get("userID");
      const chatID = parseInt(c.req.param("chatID"));

      const roomName = `user:${userID}chat:${chatID}`;
      return {
        onOpen: async (_, ws) => {
          // Check if chat exists
          const chatExist = await db
            .select()
            .from(userChats)
            .where(
              and(eq(userChats.chatID, chatID), eq(userChats.userID, userID))
            );
          if (chatExist.length === 0) {
            const error: WebsocketError = {
              error:
                "Start a new chat session to begin your journey of reflection.",
            };
            ws.close(4001, JSON.stringify(error));
          } else {
            ws.raw?.subscribe(roomName);
          }
        },
        onMessage: async (event, ws) => {
          let GeneratingStatus: GeneratingStatus = {
            type: "status",
            isGenerating: true,
          };
          ws.send(JSON.stringify(GeneratingStatus));

          const recivedData = JSON.parse(event.data.toString()) as SendMessage;
          ws.raw?.publishText(roomName, recivedData.message);

          const StoredChat = await db
            .select()
            .from(chats)
            .where(eq(chats.chatID, chatID));

          const userMessage: CoreUserMessage = {
            role: "user",
            content: recivedData.message,
          };

          const noteText = await db
            .select({
              text: chatsNotes.note,
            })
            .from(chatsNotes)
            .where(eq(chatsNotes.chatID, chatID));

          const systemPrompt =
            noteText.length > 0
              ? getSystemPrompt(noteText[0].text)
              : getSystemPrompt();

          const SystemMessage: MessagesStored = {
            role: "system",
            content: systemPrompt,
          };
          const onlyMessages = StoredChat.map((m) => m.message);
          const Messages = [SystemMessage, ...onlyMessages, userMessage];
          const google = createGoogleGenerativeAI({
            apiKey: Bun.env.AI_TOKEN,
          });

          const startStream: StartTextStream = {
            type: "stream-start",
          };
          ws.send(JSON.stringify(startStream));

          console.log("Messages", Messages);

          try {
            const { textStream, text, toolCalls } = streamText({
              model: google("gemini-1.5-flash-latest"),
              messages: Messages,
              tools: tools,
            });
            for await (const message of textStream) {
              const textstream: textStream = {
                type: "stream",
                message,
              };
              console.log("Message", message);
              ws.send(JSON.stringify(textstream));
              ws.raw?.publishText(roomName, JSON.stringify(message));
            }

            const MessageToInsert = [];

            const assistantMessage: CoreAssistantMessage = {
              role: "assistant",
              content: await text,
            };
            MessageToInsert.push(userMessage, assistantMessage);

            const toolCalls2 = await toolCalls;
            if (toolCalls2.length > 0) {
              const ast = {
                role: "assistant",
                content: await toolCalls,
              } as CoreAssistantMessage;
              console.log("Assistant Message", ast);
              const wsmsg: WsMsg = {
                type: "core",
                message: ast,
              };

              ws.send(JSON.stringify(wsmsg));
              MessageToInsert.push(ast);
            }
            await db
              .insert(chats)
              .values(MessageToInsert.map((m) => ({ chatID, message: m })));
          } catch (e) {
            console.log(e);

            const ast = {
              role: "assistant",
              content: "I'm Sorry, try again",
            } as CoreAssistantMessage;

            const wsmsg: WsMsg = {
              type: "core",
              message: ast,
            };
            ws.send(JSON.stringify(wsmsg));
          } finally {
            GeneratingStatus = {
              type: "status",
              isGenerating: false,
            };
            ws.send(JSON.stringify(GeneratingStatus));
          }
        },
        onClose: (_, ws) => {
          ws.raw?.unsubscribe(roomName);
        },
      };
    })
  )
  .get("test", async (c) => {
    console.log("Test");
    return c.json({
      message: "Test",
    });
  })
  .use("*", (c, next) => {
    const mode = import.meta.env.NODE_ENV;
    if (mode === "development") {
      next();
    }
    return frontend(c, next);
  });
	

export type AppRoute = typeof app;

console.log("ENV", import.meta.env.NODE_ENV);

export default {
	port: 3001,
	fetch: app.fetch,
	websocket,
} as Serve;
