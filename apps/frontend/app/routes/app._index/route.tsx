import type { Route } from "../app._index/+types/route";
import { hcWithType } from "@backend-api/om";

import { useSecureFetcher } from "~/hooks/redirect";
import { FallbackLayout } from "../app.chat.$id/ErrorStates";
import { Plus } from "../app/Icons";
import { Load, Pencil } from "~/Icons";
import { motion } from "motion/react";

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
  const client = hcWithType(import.meta.env.VITE_BACKEND);
  const formData = await request.formData();
  const action = formData.get("action")?.toString();

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

    if (!res.ok) {
      throw new Error("Failed to insert chat");
    }
    return data;
  }
  if (action === "note-insert") {
    const res = await client.api.note.insert.$post(
      {
        json: {
          action: "insert",
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
      throw new Error("Failed to insert note");
    }
    return data;
  }
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  const f = useSecureFetcher<typeof clientAction>();
  const { affimation, createChat, createJournal } = loaderData;

  const handleAction = (action: string) => {
    f.submit(
      { action },
      {
        method: "POST",
      }
    );
  };

  const isSub = (action: string) => {
    return f.state === "submitting" && f.formData?.get("action") === action;
  };

  return (
    <div className="flex flex-col h-full justify-center items-center text-text-base">
      <div className="space-y-8">
        <div className="font-extrabold text-5xl text-wrap tracking-wider ">
          <div>{affimation}</div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <CreateAction
            text={createChat}
            isloading={isSub("insert")}
            onClick={() => handleAction("insert")}
          >
            <Plus />
          </CreateAction>

          <CreateAction
            text={createJournal}
            isloading={isSub("note-insert")}
            onClick={() => handleAction("note-insert")}
          >
            <Pencil />
          </CreateAction>
        </div>
      </div>
    </div>
  );
}

function CreateAction({
  text,
  children,
  isloading,
  onClick,
}: {
  text: string;
  children: React.ReactNode;
  isloading?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center space-x-2 p-6 rounded-lg bg-primary/15 border-2 shadow-md disabled:bg-primary/10 disabled:border-primary/10 disabled:text-text-base/70"
      disabled={isloading}
      whileTap={{ scale: 0.9 }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {isloading ? (
        <>
          <Load />
        </>
      ) : (
        <>{children}</>
      )}
      <div className="text-lg font-bold text-wrap">{text}</div>
    </motion.button>
  );
}
