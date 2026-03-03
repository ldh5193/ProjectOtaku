"use client";

import { type ReactNode } from "react";

interface MobileBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function MobileBottomSheet({
  open,
  onClose,
  children,
}: MobileBottomSheetProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-2xl shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ height: "55vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex flex-col h-[calc(100%-28px)] overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}
