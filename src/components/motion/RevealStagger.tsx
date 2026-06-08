import { motion, useReducedMotion } from "framer-motion";
import { Children, type ReactNode } from "react";

interface RevealStaggerProps {
  children: ReactNode;
  staggerMs?: number;
  className?: string;
}

export function RevealStagger({ children, staggerMs = 80, className }: RevealStaggerProps) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerMs / 1000 } },
      }}
      className={className}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={
            reduce
              ? {}
              : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }
          }
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
