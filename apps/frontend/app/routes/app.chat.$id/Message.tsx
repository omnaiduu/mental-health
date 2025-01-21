import { memo } from "react";
import { motion } from "motion/react";
import type { MessagesStored } from "backend/ai";
import { TextTypingLoadingIndicator } from "./input";

// Animation constants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const textVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
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
const MessageContent = ({ content, isLatest, role }: { 
  content: string;
  isLatest: boolean;
  role: string;
}) => {
  const words = content.split(" ");
  
  if (role === "assistant" && content === "") {
    return <TextTypingLoadingIndicator />;
  }

  if (isLatest && role === "assistant") {
    return words.map((word, i) => (
      <motion.span
        key={i}
        custom={i}
        variants={textVariants}
        initial="hidden"
        animate="visible"
        className="inline-block mr-1"
      >
        {word}
      </motion.span>
    ));
  }

  return <>{content}</>;
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