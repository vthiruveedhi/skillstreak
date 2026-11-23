"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-[256px] z-50 bg-white dark:bg-slate-900">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-500"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
            <Sidebar />
          </div>
        </>
      )}
    </>
  );
};
