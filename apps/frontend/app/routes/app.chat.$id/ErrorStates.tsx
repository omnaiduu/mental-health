import { motion } from "motion/react";



export function FallbackLayout({
  content,
  children,
  isloading,
}: {
  content: string;
  children?: React.ReactNode;
  isloading?: boolean;
}) {
  return (
    <div className="flex flex-col items-start justify-center h-full font-extrabold text-5xl text-text-base gap-4">
      <p className={isloading ? "animate-pulse" : ""}>{content}</p>
      {children}
    </div>
  );
}


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
  }
  if (isDisconnected) {
    return (
      <FallbackLayout content={error || "Oops, you've been disconnected"}>
        <motion.button
          onClick={connect}
          whileTap={{ scale: 0.9 }}
          className="bg-primary text-white  px-4 py-4 hover:bg-opacity-80 rounded-2xl  font-medium text-2xl"
        >
          Try Reconnecting
        </motion.button>
      </FallbackLayout>
    );
  }
  return <>{children}</>;
};
