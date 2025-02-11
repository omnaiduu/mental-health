import { memo } from "react";
import { motion } from "motion/react";
import type { MessagesStored } from "backend/ai";

import { TextTypingLoadingIndicator } from "./input";
import Markdown from "react-markdown";
import { Microphone } from "~/Icons";
// Animation constants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Message Header Component
const MessageHeader = ({ role }: { role: string }) => (
  <motion.div
    className="font-semibold"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {role === "user" ? "You" : "Assistant"}
  </motion.div>
);

// Message Content Component
const MessageContent = ({ content }: { content: string }) => {
  return (
    <>
      {content === "" ? (
        <TextTypingLoadingIndicator />
      ) : (
        <Markdown
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold mb-2" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-bold mb-2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-bold mb-2" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-base font-bold mb-2" {...props} />
            ),
            h5: ({ node, ...props }) => (
              <h5 className="text-sm font-bold mb-2" {...props} />
            ),
            h6: ({ node, ...props }) => (
              <h6 className="text-xs font-bold mb-2" {...props} />
            ),
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            strong: ({ node, ...props }) => (
              <strong className="font-bold" {...props} />
            ),
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside mb-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside mb-4" {...props} />
            ),
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-blue-500 hover:underline" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-300 pl-4 italic mb-4"
                {...props}
              />
            ),
          }}
        >
          {content}
        </Markdown>
      )}
    </>
  );
};

// Main Message Component
interface MessageProps {
  message: MessagesStored;
}

function MessageComponent({ message }: MessageProps) {
  const content =
    typeof message.content === "string" ? message.content : "NOT STRING";
  const isText = typeof message.content === "string";
  const isAudio =
    Array.isArray(message.content) && message.content[0].type === "file";
  

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={
        "flex" + (message.role === "user" ? " justify-end" : " justify-start")
      }
    >
      <div
        className={`p-6 rounded-lg pb-2  space-y-2 shadow-md shadow-gray-300/50 ${
          message.role === "user"
            ? "bg-primary text-white"
            : "bg-secondary text-text-base"
        }`}
      >
        <MessageHeader role={message.role} />
        {isText && (
          <div className="text-wrap ">
            <MessageContent content={content} />
          </div>
        )}
        {isAudio && (
          <div className="text-white pb-6 gap-2 font-medium italic flex">
            <Microphone />
            <p>Audio message</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const Message = memo(MessageComponent);
