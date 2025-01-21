import { hcWithType } from "@backend-api/om";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Load, Trash } from "~/Icons";
import { useSecureFetcher } from "~/hooks/redirect";
import type { Route } from "../app.notes/+types/route";
import { Plus } from "../app/Icons";

import { forwardRef } from "react";

import { Link } from "react-router";
import { ActionButton } from "~/common/ActionButtons";
import { OuterLayer } from "~/common/Outer";
import { Pagination } from "~/common/Pagination";
import { FallbackLayout } from "../app.chat.$id/ErrorStates";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const search = new URL(request.url).searchParams;

  const client = hcWithType(import.meta.env.VITE_BACKEND).api.note;

  const action = search.get("action") as "next" | "prev" | null;
  const id = search.get("id");

  console.log(action, id);
  if (action !== null && id !== null) {
    const res = await client.get.$post(
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
      throw new Error("Failed to fetch notes");
    }
    const data = await res.json();
    return data;
  }
  const getNote = await client.get.$post(
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
  const res = getNote;
  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }
  const data = await res.json();
  return data;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const client = hcWithType(import.meta.env.VITE_BACKEND);
  const formData = await request.formData();
  const action = formData.get("action")?.toString();
  const NoteID = formData.get("noteID")?.toString();

  if (action === "insert") {
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
  if (action === "delete") {
    if (!NoteID) {
      throw new Error("NoteID is required");
    }
    const res = await client.api.note.insert.$post(
      {
        json: {
          action: "delete",
          noteID: parseInt(NoteID),
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
      throw new Error("Failed to delete note");
    }
    return data;
  }
  throw new Error("Invalid action");
}

export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center h-full font-extrabold text-5xl">
      <p>Loading up all your thoughts...</p>
    </div>
  );
}

export default function home({ loaderData }: Route.ComponentProps) {
  const { notes, firstItemFromData, lastItemFromData } = loaderData;

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
      {notes.length === 0 ? (
        <>
          <FallbackLayout content="Time to create your first note! Tap the '+' icon to begin." />
        </>
      ) : (
        <div className=" flex-1  overflow-y-auto scrollbar-none ">
          <div className="grid sm:grid-cols-3 grid-cols-1 sm:gap-4 sm:p-4">
            {notes.map((note, i) => {
              return (
                <motion.div
                  key={i}
                  variants={variant}
                  custom={i}
                  initial="initial"
                  animate="animate"
                >
                  <NoteCard
                    content={note.title ?? "Enter your thoughts here"}
                    id={note.noteID.toString()}
                    onclick={() => {
                      f.submit(
                        {
                          action: "delete",
                          noteID: note.noteID,
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
        </div>
      )}

      <div className="flex fixed bottom-4 right-4 ">
        {notes.length > 0 && (
          <Pagination
            firstItemData={firstItemFromData}
            lastItemData={lastItemFromData}
            firstItemOfPage={notes[0].noteID}
            lastItemOfPage={notes[notes.length - 1].noteID}
          />
        )}
        <InsertNote />
      </div>
    </OuterLayer>
  );
}

function InsertNote() {
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

const NoteCard = forwardRef<
  HTMLDivElement,
  {
    content: string;
    onclick: () => void;
    id: string;
  }
>(({ content, onclick, id }, ref) => {
  return (
    <div ref={ref} className="bg-secondary p-6 rounded-xl mb-4 shadow-md">
      <Link to={`/app/note/${id}`}>
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
