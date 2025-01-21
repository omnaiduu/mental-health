import type { Route } from ".react-router/types/app/routes/app.chats/+types/route";
import { motion } from "motion/react";
import { Plus } from "../app/Icons";
import { Load, Trash } from "~/Icons";
import { hcWithType } from "@backend-api/om";
import { useSecureFetcher } from "~/hooks/redirect";

import { forwardRef } from "react";

import { Link } from "react-router";
import { OuterLayer } from "~/common/Outer";
import { Pagination } from "~/common/Pagination";
import { ActionButton } from "~/common/ActionButtons";

import { FallbackLayout } from "../app.chat.$id/ErrorStates";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const search = new URL(request.url).searchParams;

  const client = hcWithType(import.meta.env.VITE_BACKEND).api.chat;

  const action = search.get("action") as "next" | "prev" | null;
  const id = search.get("id");

  if (action !== null && id !== null) {
    const res = await client.list.$post(
      {
        json: {
          action,
          id: parseInt(id),
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch chats");
    }
    const data = await res.json();
    return data;
  }
  const getchat = await client.list.$post(
    {
      json: {
        action: "get",
      },
    },
    {
      init: {
        credentials: "include",
      },
    }
  );
  const res = getchat;
  if (!res.ok) {
    throw new Error("Failed to fetch chats");
  }
  const data = await res.json();
  return data;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const client = hcWithType(import.meta.env.VITE_BACKEND);
  const formData = await request.formData();
  const action = formData.get("action")?.toString();
  const chatID = formData.get("chatID")?.toString();

  if (action === "insert") {
    const res = await client.api.chat.create.$post(
      {
        json: {
          action: "create",
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );
    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      throw new Error("Failed to insert chat");
    }
    return data;
  }
  if (action === "delete") {
    if (!chatID) {
      throw new Error("chatID is required");
    }
    const res = await client.api.chat.create.$post(
      {
        json: {
          action: "delete",
          chatID: parseInt(chatID),
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error("Failed to delete chat");
    }
    return data;
  }
  throw new Error("Invalid action");
}

export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center h-full font-extrabold text-5xl">
      <p>Bringing back your previous discussions...</p>
    </div>
  );
}

export default function home({ loaderData }: Route.ComponentProps) {
  const { chats, firstItemFromData, lastItemFromData } = loaderData;

  const f = useSecureFetcher<typeof clientAction>();
  const variant = {
    initial: { opacity: 0 },
    animate: (index: number) => ({
      opacity: 1,
      transition: { delay: index * 0.1, ease: "easeOut" },
    }),
  };

  return (
    <OuterLayer>
      <div className=" flex-1  overflow-y-auto scrollbar-none ">
        {chats.length === 0 ? (
          <>
            <FallbackLayout content="Looks like you don't have any chat history yet. Let's start a conversation!" />
          </>
        ) : (
          <div className="grid sm:grid-cols-3 grid-cols-1 sm:gap-4 sm:p-4">
            {chats.map((chat, i) => {
              return (
                <motion.div
                  key={i}
                  variants={variant}
                  custom={i}
                  initial="initial"
                  animate="animate"
                >
                  <ChatCard
                    content={chat.title ?? "Enter your thoughts here"}
                    id={chat.chatID.toString()}
                    onclick={() => {
                      f.submit(
                        {
                          action: "delete",
                          chatID: chat.chatID,
                        },
                        {
                          method: "POST",
                        }
                      );
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex fixed bottom-4 right-4 ">
        {chats.length > 0 && (
          <Pagination
            firstItemData={firstItemFromData}
            lastItemData={lastItemFromData}
            firstItemOfPage={chats[0].chatID}
            lastItemOfPage={chats[chats.length - 1].chatID}
          />
        )}
        <Insertchat />
      </div>
    </OuterLayer>
  );
}

function Insertchat() {
  const f = useSecureFetcher<typeof clientAction>();
  const isSubmitting = f.state === "submitting" || f.state === "loading";

  return (
    <ActionButton
      onClick={() => {
        f.submit(
          {
            action: "insert",
          },
          {
            method: "POST",
          }
        );
      }}
    >
      {isSubmitting ? <Load /> : <Plus />}
    </ActionButton>
  );
}

const ChatCard = forwardRef<
  HTMLDivElement,
  {
    content: string;
    onclick: () => void;
    id: string;
  }
>(({ content, onclick, id }, ref) => {
  return (
    <div ref={ref} className="bg-secondary p-6 rounded-xl mb-4 shadow-md">
    
      <Link to={`/app/chat/${id}`}>
        <p className="break-words whitespace-pre-wrap overflow-hidden text-wrap max-w-full">
          {content}
        </p>
      </Link>
      <div className="flex justify-end pt-3">
        <motion.button
          onClick={onclick}
          whileTap={{
            scale: 0.95,
          }}
        >
          <Trash />
        </motion.button>
      </div>
    </div>
  );
});
