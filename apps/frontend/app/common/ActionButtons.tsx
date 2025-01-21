import { motion } from "motion/react";


export function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{
        scale: 0.95,
      }}
      className="bg-primary text-white text-center p-4 rounded-md hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed "
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}




