import type { Route } from ".react-router/types/app/routes/app.chat.$id/+types/route";

import { hcWithType } from "@backend-api/om";
import type { SendMessage, WsMsg } from "@backend-api/om/ws/types";
import type { CoreAssistantMessage, MessagesStored } from "backend/ai";
import { useRef, useState } from "react";
import { useWebSocket } from "~/hooks/useWebSocket";
import { Input } from "./input";
import { AnimatePresence, motion } from "motion/react";
import { Message } from "./Message";
import { ConnectAndDisconnect, FallbackLayout } from "./ErrorStates";
import { useScrollToBottom } from "./scrollButtom";
import type { ListParam, ShowResultParam } from "@backend-api/om/tools";
import { ShowResult } from "./result";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const client = hcWithType(import.meta.env.VITE_BACKEND).api.chat;
  const res = await client.get[":id"].$get(
    {
      param: {
        id: params.id,
      },
    },
    {
      init: {
        credentials: "include",
      },
    }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
  const data = await res.json();
  return {
    data: data.data,
    id: params.id,
    error: data.error,
    redirect: data.redirect,
  };
}

export function HydrateFallback() {
  return <FallbackLayout content="The AI is waking up... almost ready..." />;
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  const backend = import.meta.env.VITE_WS;
  const { data, id } = loaderData;
  const [isGenrating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessagesStored[]>(
    data as unknown as MessagesStored[]
  );

  const { isConnecting, isDisconnected, error, connect, sendMessage } =
    useWebSocket({
      url: backend + "/api/chat/ws/" + id,
      onMessage: (data) => {
        const msgData = JSON.parse(data) as WsMsg;
        if (msgData.type === "status") {
          setIsGenerating(msgData.isGenerating);
        }
        if (msgData.type === "stream-start") {
          const assistantMessage: CoreAssistantMessage = {
            role: "assistant",
            content: "",
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
        if (msgData.type === "stream") {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + msgData.message,
            } as MessagesStored;
            return newMessages;
          });
        }
        if (msgData.type === "core") {
          const message = msgData.message;
          setMessages((prev) => [...prev, message]);
        }
      },
    });

  useScrollToBottom(scrollRef, [messages, isConnecting, isDisconnected]);

  return (
    <div className="flex flex-col h-full justify-between">
      <ConnectAndDisconnect
        isConnecting={isConnecting}
        isDisconnected={isDisconnected}
        error={error}
        connect={connect}
      >
        <div className="flex flex-col gap-6 overflow-y-auto scrollbar-none  h-dvh">
          <AnimatePresence>
            {messages.map((msg, index) => {
              const content = msg.content;
              if (msg.role === "assistant" && Array.isArray(content)) {
                return content.map((parts) => {
                  if (parts.type === "tool-call") {
                    if (parts.toolName === "List") {
                      const parameters = parts.args as ListParam;

                      return (
                        <List
                          title={parameters.title}
                          items={parameters.items}
                        />
                      );
                    }
                    if (parts.toolName === "showResult") {
                      const parameters = parts.args as ShowResultParam;
                      return <ShowResult result={parameters.result} />;
                    }
                  }
                });
              }

              return (
                <Message
                  key={index}
                  message={msg}
                  isLatest={index === messages.length - 1}
                />
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} className="h-0" />
        </div>

        <Input
          placeholder="Tell me more about your thoughts"
          isGenrating={isGenrating}
          onSend={(value) => {
            const sendData: SendMessage = {
              message: value,
            };
            const userMessage: MessagesStored = {
              role: "user",
              content: value,
            };
            setMessages((prev) => [...prev, userMessage]);
            sendMessage(JSON.stringify(sendData));
          }}
        />
      </ConnectAndDisconnect>
    </div>
  );
}

function List({ title, items }: ListParam) {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 0.99 }}
    >
      <div className="bg-secondary/20 p-4 rounded-lg shadow-md shadow-gray-300/50  border border-primary border-dotted">
        <h1 className="font-semibold">{title}</h1>
        <ul className="list-disc list-inside italic">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
