"use client";

interface HeaderProps {
  onImport: () => void;
  onSuggest: () => void;
}

export default function Header({ onImport, onSuggest }: HeaderProps) {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0 relative z-20">
      <h1 className="text-lg font-bold text-gray-900">오덕로드</h1>
      <div className="flex gap-3">
        <button
          onClick={onImport}
          className="text-xs text-[#03c75a] font-medium hover:text-[#02b350]"
        >
          URL 추가
        </button>
        <button
          onClick={onSuggest}
          className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
        >
          + 매장 추가
        </button>
      </div>
    </header>
  );
}
