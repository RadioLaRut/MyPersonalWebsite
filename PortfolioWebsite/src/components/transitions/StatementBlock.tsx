"use client";

import React from "react";
import { motion } from "framer-motion";
import Typography from "@/components/common/Typography";

interface StatementBlockProps {
  content: string;
  align?: "left" | "center" | "right";
  backgroundColor?: "black" | "dark-gray";
  minHeight?: "small" | "medium" | "large";
  editMode?: boolean;
}

export default function StatementBlock({
  content,
  align = "center",
  backgroundColor = "black",
  minHeight = "medium",
  editMode = false,
}: StatementBlockProps) {
  const alignClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[align];

  const bgClass = {
    black: "bg-black",
    "dark-gray": "bg-[#0a0a0a]",
  }[backgroundColor];

  const heightClass = {
    small: "min-h-[20vh]",
    medium: "min-h-[35vh]",
    large: "min-h-[50vh]",
  }[minHeight];

  return (
    <section
      className={`w-full ${heightClass} ${bgClass} flex flex-col justify-center relative z-20`}
    >
      <div className="grid-container w-full">
        <motion.div
          className={`col-start-3 col-span-8 flex flex-col ${alignClass} ${editMode ? "pointer-events-auto" : ""}`}
          initial={editMode ? false : { opacity: 0, y: 20 }}
          whileInView={editMode ? undefined : { opacity: 1, y: 0 }}
          viewport={editMode ? undefined : { once: true, margin: "-100px" }}
          transition={editMode ? undefined : { duration: 0.8, ease: "easeOut" }}
        >
          <Typography
            as="p"
            preset="sans-body"
            size="body-lg"
            weight="light"
            wrapPolicy="prose"
            className="max-w-4xl text-textPrimary"
            align={align}
          >
            {content}
          </Typography>
        </motion.div>
      </div>
    </section>
  );
}
