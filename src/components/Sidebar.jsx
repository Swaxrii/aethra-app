import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="h-full w-[200px] flex-shrink-0 flex flex-col bg-[#3B1C32] rounded-none shadow-[-1px_0px_0px_rgba(255,255,255,0.15)]">
      <div className="flex items-center gap-3 px-4 pt-6">
        <Image
          src="/logo.svg"
          alt="AethraCore"
          width={50}
          height={50}
          className="flex-shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-bold text-xl leading-tight text-white">
            AETHRA AI
          </span>
          <span className="font-extralight text-[11px] leading-tight text-white/50">
            Artificial Intelligence
          </span>
        </div>
      </div>

      <button className="mx-4 mt-6 flex items-center justify-center gap-2 rounded-[3px] bg-[#A64D79] px-3 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-[#A64D79]/90 hover:shadow-md active:scale-[0.97] active:shadow-none">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.666016 4.66663H8.66602M4.66602 0.666626V8.66663" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        New Chat
      </button>
    </aside>
  );
}
