export default function Header() {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
      <h1 className="text-lg font-bold text-gray-900">오덕로드</h1>
      <div className="flex gap-3">
        <a
          href="#import"
          className="text-xs text-[#03c75a] font-medium hover:text-[#02b350]"
        >
          URL 추가
        </a>
        <a
          href="#suggest"
          className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
        >
          + 매장 추가
        </a>
      </div>
    </header>
  );
}
