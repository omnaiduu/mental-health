import type { Route } from "./+types/route";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { hcWithType } from "@backend-api/om";
import { useSecureFetcher } from "~/hooks/redirect";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = parseInt(params["id"]);
  if (isNaN(id)) {
    throw new Error("Invalid note ID");
  }
  const client = hcWithType(import.meta.env.VITE_BACKEND).api.note.note;
  const data = await client.$post(
    {
      json: {
        action: "get",
        noteID: id,
      },
    },
    {
      init: {
        credentials: "include",
      },
    }
  );
  if (!data.ok) {
    throw new Error("Failed to fetch note");
  }
  if (data.status === 200) {
    const note = (await data.json()).data;
    if (note.length === 0) {
      throw new Error("Note not found");
    }
    return { note: note[0] };
  }
  throw new Error("Failed to fetch note");
}

export async function clientAction({
  params,
  request,
}: Route.ClientActionArgs) {
  const id = parseInt(params["id"]);
  const formdata = await request.formData();
  const content = formdata.get("content")?.toString();
  const title = formdata.get("title")?.toString();
  const action = formdata.get("action")?.toString();

  console.log("action", action);
  if (!content) {
    throw new Error("Invalid content");
  }

  if (isNaN(id)) {
    throw new Error("Invalid note ID");
  }
  if (action === "save") {
    if (!title) {
      throw new Error("Invalid title");
    }
    const client = hcWithType(import.meta.env.VITE_BACKEND).api.note.note;

    const data = await client.$post(
      {
        json: {
          action: "save",
          noteID: id,
          content: content,
          title: title,
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );

    if (!data.ok) {
      throw new Error("Failed to fetch note");
    }
    if (data.status === 200) {
      const note = (await data.json()).data;
      if (note.length === 0) {
        throw new Error("Note not found");
      }
      return { note: note[0] };
    }
    throw new Error("Failed to fetch note");
  }
  if (action === "remember") {
    const client = hcWithType(import.meta.env.VITE_BACKEND).api.chat.create;
    const res = await client.$post(
      {
        json: {
          action: "remember",
          contentToRemember: content,
          noteID: id,
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );
    if (!res.ok) {
      throw new Error("Failed to remember");
    }
    console.log("res");
    return await res.json();
  }
}

export default function Editor({ loaderData }: Route.ComponentProps) {
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const [content, setContent] = useState<string>(loaderData.note.content);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
  }, []);

  return (
    <div
     
      className="h-full flex flex-col relative overflow-hidden"
    >
      <div className="flex-1  h-full max-h-full">
        <textarea
          ref={textRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          placeholder="Enter Your Thoughts"
          className=" overflow-y-auto scrollbar-none h-full w-full bg-inherit p-6 focus:outline-none text-text-base resize-none"
        >
          {loaderData.note.content}
        </textarea>
      </div>

      <div className="z-10 sticky bottom-0 flex-0  flex justify-center  ">
        <ButtomNav content={content} />
      </div>
    </div>
  );
}

function ButtomNav({ content }: { content: string | undefined }) {
  const f = useSecureFetcher<typeof clientAction>();
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-3 p-4 overflow-x-auto scrollbar-thin scrollbar-track-primary/25 scrollbar-thumb-primary/90  rounded-2xl shadow-sm bg-secondary"
    >
      <Item
        disabled={!content}
        onClick={() => {
          f.submit(
            {
              action: "save",
              content: content as string,
              title: content?.slice(0, 30) as string,
            },
            {
              method: "POST",
            }
          );
        }}
      >
        Remember This
      </Item>
      <Item
        disabled={!content}
        onClick={() => [
          f.submit(
            {
              action: "remember",
              content: content as string,
            },
            {
              method: "POST",
            }
          ),
        ]}
      >
        Let's Chat About This
      </Item>
    </motion.div>
  );
}

function Item({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode | string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <button
        className={`bg-primary p-4 shadow-md hover:bg-success/80  rounded-2xl  whitespace-nowrap disabled:bg-primary/40 disabled:text-text-base/40 transition-colors  ${
          active ? "bg-success" : ""
        }`}
        disabled={disabled}
      >
        {children}
      </button>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};
