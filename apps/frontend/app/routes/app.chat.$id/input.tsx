import React, { useEffect, useRef, useState } from "react";
import { Microphone, MicrophoneOff, Round, Send, Stop } from "~/Icons";
import { AnimatePresence, motion } from "motion/react";
import { useMic } from "~/hooks/useMic";

interface InputProps {
  placeholder: string;
  onSend: (value: string) => void;
  isGenrating: boolean;
  onRecordComplete?: (blob: Blob) => void;
  onError?: (error: string) => void;
}
export function Input({
  placeholder,
  onSend,
  isGenrating,
  onError,
  onRecordComplete,
}: InputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { micStatus, startRecording, stopRecording, timer } = useMic({
    AudioSize: 2000,
    onComplete: (blob) => {
      console.log("blob", blob);
      onRecordComplete?.(blob);
    },
  });

 

  console.log(micStatus);
  useEffect(() => {
    if (micStatus.type === "error") {
      onError?.(micStatus.message);
    }
  }, [micStatus]);

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
      className="flex flex-col  mb-2 max-h-[300px] flex-1 bg-primary/10 rounded-2xl p-4"
      onSubmit={handleSubmit}
    >
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className=" text-text-base outline-none ring-0  px-4 pt-4 pb-3 0 w-full mr-2 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-primary/80 scrollbar-track-primary/20 min-h-[56px] max-h-[300px] bg-transparent"
        rows={1}
      />
      <div className="flex justify-between space-x-2 mt-2">
        <motion.button
          type="submit"
          disabled={isGenrating || micStatus.type === "error"}
          onClick={() => {
            if (micStatus.type === "status" && micStatus.message === "idle") {
              startRecording();
            }
            if (
              micStatus.type === "status" &&
              micStatus.message === "recording"
            ) {
              stopRecording();
            }
          }}
          whileTap={{ scale: 0.9 }}
          className="bg-primary text-white px-4 py-3 hover:bg-opacity-80 rounded-2xl shadow-md shadow-gray-300/50 disabled:bg-opacity-50 h-[52px] flex items-center justify-center"
        >
          {micStatus.type === "status" && micStatus.message === "recording" && (
            <Stop />
          )}
          {micStatus.type === "status" && micStatus.message === "idle" && (
            <Microphone />
          )}
          {micStatus.type === "error" && (
            <>
              <MicrophoneOff />
            </>
          )}
        </motion.button>
        <AnimatePresence>
        {micStatus.type === "status" && micStatus.message === "recording" && (
          
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, transition: { duration: 0.4 } }}
                
                className="text-white  flex items-center justify-center text-sm rounded-xl bg-red-500 px-4 py-1 animate-pulse"
              >
                <div className="font-bold">
                  {timer.hours.toString().padStart(2, "0")}:
                  {timer.minutes.toString().padStart(2, "0")}:
                  {timer.seconds.toString().padStart(2, "0")}
                </div>
              </motion.div>
          
        )}
        </AnimatePresence>
        <motion.button
          type="submit"
          disabled={isGenrating}
          whileTap={{ scale: 0.9 }}
          className="bg-primary text-white px-4 py-3 hover:bg-opacity-80 rounded-2xl shadow-md shadow-gray-300/50 disabled:bg-opacity-50 h-[52px] flex items-center justify-center"
        >
          {isGenrating ? <Round /> : <Send />}
        </motion.button>
      </div>
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
      className={`inline-flex items-center space-x-1 pb-6 ${className}`}
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
