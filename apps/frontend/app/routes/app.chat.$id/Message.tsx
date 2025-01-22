import { memo } from "react";
import { motion } from "motion/react";
import type { MessagesStored } from "backend/ai";
import { TextTypingLoadingIndicator } from "./input";
import Markdown from "react-markdown";
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
const MessageContent = ({
  content,
  isLatest,
  role,
}: {
  content: string;
  isLatest: boolean;
  role: string;
}) => {
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
            )
          
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
  isLatest: boolean;
}

function MessageComponent({ message, isLatest }: MessageProps) {
  const content =
    typeof message.content === "string" ? message.content : "NOT STRING";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={
        "flex" + (message.role === "user" ? " justify-end" : " justify-start")
      }
    >
      <motion.div
        layout
        className={`p-4 rounded-lg shadow-md shadow-gray-300/50 ${
          message.role === "user"
            ? "bg-primary text-white"
            : "bg-secondary text-text-base"
        }`}
        transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
      >
        <MessageHeader role={message.role} />
        <div className="text-wrap break-all">
          <MessageContent
            content={content}
            isLatest={isLatest}
            role={message.role}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export const Message = memo(MessageComponent);
