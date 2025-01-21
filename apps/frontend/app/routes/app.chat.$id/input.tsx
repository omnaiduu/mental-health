import React, { useEffect, useRef, useState } from "react";
import { Round, Send } from "~/Icons";
import { motion } from "motion/react";

interface InputProps {
  placeholder: string;
  onSend: (value: string) => void;
  isGenrating: boolean;
}
export function Input({ placeholder, onSend, isGenrating }: InputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isGenrating) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      className="flex items-end mb-2 max-h-[300px] flex-1"
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-gray-50 text-text-base border border-gray-300 rounded-2xl px-4 pt-4 pb-3 focus:outline-primary focus:ring-2 focus:ring-primary/20 w-full mr-2 shadow-md shadow-gray-300/50 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-primary/80 scrollbar-track-primary/20 min-h-[56px] max-h-[300px]"
        rows={1}
      />
      <motion.button
        type="submit"
        disabled={isGenrating}
        whileTap={{ scale: 0.9 }}
        className="bg-primary text-white px-4 py-3 hover:bg-opacity-80 rounded-2xl shadow-md shadow-gray-300/50 disabled:bg-opacity-50 h-[52px] flex items-center justify-center"
      >
        {isGenrating ? (
          <Round  />
        ) : (
          <Send  />
        )}
      </motion.button>
    </form>
  );
}

interface TextTypingLoadingIndicatorProps {
  className?: string;
  dotClassName?: string;
}

export const TextTypingLoadingIndicator: React.FC<
  TextTypingLoadingIndicatorProps
> = ({ className = "", dotClassName = "" }) => {
  const dotVariants = {
    animate: (i: number) => ({
      opacity: [0.2, 1, 0.2],
      y: ["0%", "-15%", "0%"],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.2,
      },
    }),
  };

  return (
    <div
      className={`inline-flex items-center space-x-1 ${className}`}
      aria-label="Assistant is typing"
      role="status"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          custom={index}
          variants={dotVariants}
          animate="animate"
          className={`w-2 h-2 bg-primary/90 shadow-md rounded-full ${dotClassName}`}
        />
      ))}
    </div>
  );
};
