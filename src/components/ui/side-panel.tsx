"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SidePanelSize = "small" | "medium" | "large";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: SidePanelSize;
  title?: string;
  className?: string;
}

export function SidePanel({
  isOpen,
  onClose,
  children,
  size = "medium",
  title,
  className,
}: SidePanelProps) {
  // Width class based on size prop
  const sizeClasses = {
    small: "w-full md:w-[380px]",
    medium: "w-full md:w-[480px]",
    large: "w-full md:w-[640px]",
  };

  // Overlay animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // Panel animation variants
  const panelVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    },
    exit: { x: "100%", transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 bg-white shadow-xl flex flex-col",
              sizeClasses[size],
              className
            )}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
