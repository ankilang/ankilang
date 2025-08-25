import { motion } from "framer-motion";

interface AnimatedTitleProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedTitle = ({ children, className = "" }: AnimatedTitleProps) => {
  return (
    <motion.h1
      className={className}
      animate={{
        textShadow: [
          "0 0 0px rgba(210, 180, 222, 0)",
          "0 0 20px rgba(210, 180, 222, 0.3)",
          "0 0 0px rgba(210, 180, 222, 0)"
        ]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.h1>
  );
};

export default AnimatedTitle;
