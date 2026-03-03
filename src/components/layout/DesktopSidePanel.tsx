"use client";

import type { ReactNode } from "react";

interface DesktopSidePanelProps {
  children: ReactNode;
}

export default function DesktopSidePanel({ children }: DesktopSidePanelProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-[360px] shrink-0 border-r border-gray-200 bg-white overflow-hidden">
      {children}
    </aside>
  );
}
