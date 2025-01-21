import { Input } from "../app.chat.$id/input";
import type { Route } from "../app._index/+types/route";
import { hcWithType } from "@backend-api/om";
import { AnimatePresence } from "motion/react";
import { Message } from "../app.chat.$id/Message";
import { useSecureFetcher } from "~/hooks/redirect";
import { FallbackLayout } from "../app.chat.$id/ErrorStates";
import type { CoreAssistantMessage } from "backend/ai";

export function HydrateFallback() {
  return <FallbackLayout content="The AI is waking up... almost ready..." />;
}
export async function clientLoader() {
  const client = hcWithType(import.meta.env.VITE_BACKEND).api.chat.home;
  const res = await client.$get(
    {},
    {
      init: {
        credentials: "include",
      },
    }
  );
  if (!res.ok) {
    throw new Error("try again");
  }

  return await res.json();
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
 
    const assistantMessage = JSON.parse(
      form.get("assistantMessage") as string
    ) as { content: string; role: "assistant" };
    const userMessage = form.get("userMessage") as string;
    const client = hcWithType(import.meta.env.VITE_BACKEND).api.chat.create;
    const res = await client.$post(
      {
        json: {
          action: "create",
          messages: [assistantMessage, { content: userMessage, role: "user" }],
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );
    if (!res.ok) {
      throw new Error("try again");
    }

  return await res.json();
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  const f = useSecureFetcher<typeof clientAction>();
  
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-6 overflow-y-auto scrollbar-none  h-dvh">
        <AnimatePresence>
          <Message message={loaderData} isLatest={true} />
        </AnimatePresence>
      </div>

      <Input
        placeholder="Tell me more about your thoughts"
        isGenrating={f.state === "submitting" || f.state === "loading"}
        onSend={(value) => {
          f.submit(
            {
              userMessage: value,
              assistantMessage: JSON.stringify(loaderData)
            },
            {
              method: "POST",
            }
          );
        }}
      />
    </div>
  );
}
