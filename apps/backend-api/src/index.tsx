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
  type FilePart,
  type MessagesStored,
} from "backend/ai";
import { and, db, eq } from "backend/db";
import { chats, chatsNotes, userChats } from "backend/schema";
import { chat } from "./chat";
import type {
  WebsocketError,
  GeneratingStatus,
  textStream,
  StartTextStream,
  WsMsg,
  receiveMessage,
  RedirectData,
} from "./wsTypes";
import { tools } from "./tools";

import { getSystemPrompt } from "./getSystemPromt";
//@ts-ignore
import { frontend } from "frontend";
import { migrateProductionDB } from "backend/migrate";
import { upload } from "./upload";
import { FileState, GoogleAIFileManager } from "@google/generative-ai/server";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

// todo should only run in production
if (import.meta.env.NODE_ENV === "production") {
  console.log("Running miagration");
  migrateProductionDB();
}

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
          location: "/app",
        } as RedirectData);
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
  .post("")
  .route("/api/note", note)
  .route("/api/chat", chat)
  .route("/api/upload", upload)
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

          const recivedData = JSON.parse(
            event.data.toString()
          ) as receiveMessage;

          const StoredChat = await db
            .select()
            .from(chats)
            .where(eq(chats.chatID, chatID));

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
          const Messages = [SystemMessage, ...onlyMessages];
          const name: string[] = [];
          if (recivedData.type === "audio") {
            const fileManager = new GoogleAIFileManager(Bun.env.AI_TOKEN);
            const file = recivedData.audio;

            const filePart2: FilePart[] = [];
            const originalExt = file.fileName.split(".").pop() || "";
            const path = `uploads/${file.id}.${originalExt}`;
            const uploaded = await fileManager.uploadFile(path, {
              mimeType: file.mimeType,
              displayName: file.id,
            });

            name.push(uploaded.file.name);

            filePart2.push({
              type: "file",
              mimeType: uploaded.file.mimeType,
              data: uploaded.file.uri,
            });

            for (let i = 0; i < name.length; i++) {
              const fileName = name[i];
              // const originalExt = file.fileName.split(".").pop() || "";
              // const path = `uploads/${file.id}.${originalExt}`;
              let fileG = await fileManager.getFile(fileName);
              while (fileG.state === FileState.PROCESSING) {
                console.log(`File ${fileG.displayName} is still processing...`);
                // Sleep for 10 seconds
                await new Promise((resolve) => setTimeout(resolve, 10_000));
                // Fetch the file from the API again
                fileG = await fileManager.getFile(fileName);
              }
              if (fileG.state === FileState.FAILED) {
                console.error(`File ${fileG.displayName} failed to process`);
                return c.json(
                  {
                    error: `File ${fileG.displayName} failed to process`,
                  },
                  401
                );
              }
              console.log(`File ${fileG.displayName} is ready for analysis`);

              const userMessage: CoreUserMessage = {
                role: "user",
                content: filePart2,
              };
              Messages.push(userMessage);
            }
          } else if (recivedData.type === "message") {
            const userMessage: CoreUserMessage = {
              role: "user",
              content: recivedData.message,
            };
            Messages.push(userMessage);
          } else {
            const error: WebsocketError = {
              error: "Invalid request INPUT",
            };
            ws.close(4001, JSON.stringify(error));
          }

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

            // add user audio message
            if (recivedData.type === "message") {
              const userMessage: CoreUserMessage = {
                role: "user",
                content: recivedData.message,
              };
              MessageToInsert.push(userMessage);
            }

            MessageToInsert.push(assistantMessage);

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

            if (recivedData.type === "audio") {
              const file = recivedData.audio;

              const originalExt = file.fileName.split(".").pop() || "";
              const path = `uploads/${file.id}.${originalExt}`;
              const fileExist = Bun.file(path);

              if (await fileExist.exists()) {
                console.log("File Exist");
                await fileExist.delete();
              }
              for (let i = 0; i < name.length; i++) {
                const fileName = name[i];
                const fileManager = new GoogleAIFileManager(Bun.env.AI_TOKEN);
                await fileManager.deleteFile(fileName);
              }
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
  );

app.use("*", (c, next) => {
  const mode = import.meta.env.NODE_ENV;
  if (mode === "development") {
    next();
  }
  return frontend(c, next);
});

export type AppRoute = typeof app;

export default {
  port: 3001,
  fetch: app.fetch,
  websocket,
} as Serve;
