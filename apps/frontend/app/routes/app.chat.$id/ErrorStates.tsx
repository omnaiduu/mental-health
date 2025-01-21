import { motion } from "motion/react";

export const ConnectAndDisconnect = ({
  isConnecting,
  isDisconnected,
  error,
  connect,
  children,
}: {
  isConnecting: boolean;
  isDisconnected: boolean;
  error: string | null;
  connect: () => void;
  children: React.ReactNode;
}) => {
  if (isConnecting) {
    return (
      <FallbackLayout content="Almost ready for you to start chatting..." />
    );
  } else if (isDisconnected) {
    <FallbackLayout content={error || "Oops, you've been disconnected"}>
      <motion.button
        onClick={connect}
        whileTap={{ scale: 0.9 }}
        className="bg-primary text-white px-4 py-4 hover:bg-opacity-80 rounded-2xl shadow-md shadow-gray-300/50 font-medium text-2xl"
      >
        Try Reconnecting
      </motion.button>
    </FallbackLayout>;
  }
  return <>{children}</>;
};

export function FallbackLayout({
  content,
  children,
}: {
  content: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-center h-full font-extrabold text-5xl gap-4">
      <p>{content}</p>
      {children}
    </div>
  );
}
