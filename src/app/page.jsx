export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
        <span className="font-extrabold">GOOD MORNING,</span>{" "}
        <span className="font-extralight">ZIIXRY</span>
      </h1>
      <p className="mt-1 text-sm sm:text-base md:text-lg font-extralight text-white/60">
        What would you like to build today? Type a command or a task
      </p>

      <div className="mt-6 sm:mt-8 relative w-full max-w-[850px]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 66 66"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
        >
          <path d="M22.2517 13.2C16.7507 13.2 12.2754 17.678 12.2754 23.1822C12.2754 23.9468 12.8949 24.5666 13.6589 24.5666C14.4231 24.5666 15.0425 23.9468 15.0425 23.1822C15.0425 19.2046 18.2765 15.9687 22.2517 15.9687C23.0158 15.9687 23.6352 15.3489 23.6352 14.5843C23.6352 13.8197 23.0158 13.2 22.2517 13.2Z" fill="currentColor" />
          <path d="M46.6197 38.8665C49.1207 34.9432 50.57 30.2884 50.57 25.3C50.57 11.3484 39.2284 0 25.285 0C20.2995 0 15.6474 1.45019 11.7264 3.95264C8.6024 5.94553 5.94385 8.60563 3.95212 11.7315C1.45109 15.6548 0 20.3114 0 25.3C0 39.2498 11.3435 50.5998 25.285 50.5998C30.2706 50.5998 34.9245 49.1478 38.8455 46.6454C41.9694 44.6525 44.628 41.9924 46.6197 38.8665ZM33.4843 41.2811C31.0254 42.5498 28.2368 43.2666 25.285 43.2666C15.3854 43.2666 7.32894 35.2055 7.32894 25.3C7.32894 22.3465 8.0454 19.5562 9.31332 17.0959C11.0301 13.7629 13.7584 11.0349 17.0893 9.31886C19.5482 8.05017 22.335 7.33333 25.2849 7.33333C35.1864 7.33333 43.241 15.3927 43.241 25.3C43.241 28.2517 42.5245 31.0401 41.2566 33.5004C39.5417 36.8334 36.8153 39.5633 33.4843 41.2811Z" fill="currentColor" />
          <path d="M64.3911 56.6095L49.7937 42.04C47.7159 45.076 45.0537 47.7379 42.0195 49.8189L56.617 64.3883C57.6906 65.4626 59.0979 65.9998 60.5032 65.9998C61.9104 65.9998 63.3176 65.4626 64.3913 64.3883C66.5368 62.2396 66.5368 58.7581 64.3911 56.6095Z" fill="currentColor" />
        </svg>
        <input
          type="text"
          placeholder="Ask aethra or type /command"
          className="w-full h-[52px] sm:h-[60px] rounded-[10px] border bg-[rgba(69,69,69,0.25)] border-[rgba(69,69,69,0.8)] pl-10 sm:pl-14 pr-[56px] sm:pr-[72px] text-sm sm:text-base text-white font-light placeholder:text-white/70 outline-none transition-all duration-500 focus:border-[#A64D79]"
        />
        <button
          className="absolute right-[5px] sm:right-[6px] top-1/2 -translate-y-1/2 flex cursor-pointer items-center justify-center w-[32px] h-[32px] sm:w-[37px] sm:h-[37px] rounded-[6px] bg-[rgba(69,69,69,0.25)] border-[0.6px] border-[rgba(69,69,69,0.8)] transition-all duration-500 hover:scale-105 hover:border-[#A64D79] hover:shadow-[0_0_10px_rgba(166,77,121,0.12)]"
        >
          <svg width="20" height="18" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.2646 11.9164H3.94157M3.70566 13.0074L2.33058 17.115C1.57746 19.3647 1.2009 20.4895 1.47114 21.1821C1.7058 21.7837 2.20983 22.2397 2.83178 22.4134C3.54796 22.6132 4.62967 22.1264 6.7931 21.153L20.6627 14.9116C22.7744 13.9613 23.8302 13.4863 24.1565 12.8262C24.44 12.2528 24.44 11.5799 24.1565 11.0064C23.8302 10.3465 22.7744 9.87135 20.6627 8.92109L6.76918 2.66905C4.61226 1.69845 3.53382 1.21315 2.81835 1.41223C2.197 1.58512 1.69302 2.03996 1.45753 2.64039C1.18637 3.33178 1.5589 4.45418 2.30399 6.69898L3.70833 10.9301C3.83629 11.3156 3.90028 11.5084 3.92553 11.7055C3.94795 11.8805 3.94772 12.0576 3.92486 12.2325C3.89909 12.4296 3.83462 12.6222 3.70566 13.0074Z" stroke="white" strokeWidth="2.73713" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mt-4 w-full max-w-[850px] grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="h-[72px] sm:h-[80px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] shadow-[inset_0px_-5px_4px_rgba(0,0,0,0.25)] px-3 sm:px-4 pb-2 sm:pb-3 flex flex-col justify-end text-left transition-all duration-500 cursor-pointer hover:scale-[1.015] hover:border-[#A64D79] hover:shadow-[0_0_14px_rgba(166,77,121,0.12),inset_0px_-5px_4px_rgba(0,0,0,0.25)]">
          <p className="text-xs sm:text-sm font-normal text-white truncate">Brainstorm ideas</p>
          <p className="text-[10px] sm:text-xs font-extralight text-white/60 truncate">Architecture &amp; UI design</p>
        </div>
        <div className="h-[72px] sm:h-[80px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] shadow-[inset_0px_-5px_4px_rgba(0,0,0,0.25)] px-3 sm:px-4 pb-2 sm:pb-3 flex flex-col justify-end text-left transition-all duration-500 cursor-pointer hover:scale-[1.015] hover:border-[#A64D79] hover:shadow-[0_0_14px_rgba(166,77,121,0.12),inset_0px_-5px_4px_rgba(0,0,0,0.25)]">
          <p className="text-xs sm:text-sm font-normal text-white truncate">Design system</p>
          <p className="text-[10px] sm:text-xs font-extralight text-white/60 truncate">Components &amp; tokens</p>
        </div>
        <div className="h-[72px] sm:h-[80px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] shadow-[inset_0px_-5px_4px_rgba(0,0,0,0.25)] px-3 sm:px-4 pb-2 sm:pb-3 flex flex-col justify-end text-left transition-all duration-500 cursor-pointer hover:scale-[1.015] hover:border-[#A64D79] hover:shadow-[0_0_14px_rgba(166,77,121,0.12),inset_0px_-5px_4px_rgba(0,0,0,0.25)]">
          <p className="text-xs sm:text-sm font-normal text-white truncate">Generate code</p>
          <p className="text-[10px] sm:text-xs font-extralight text-white/60 truncate">Full-stack features</p>
        </div>
        <div className="h-[72px] sm:h-[80px] rounded-[10px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] shadow-[inset_0px_-5px_4px_rgba(0,0,0,0.25)] px-3 sm:px-4 pb-2 sm:pb-3 flex flex-col justify-end text-left transition-all duration-500 cursor-pointer hover:scale-[1.015] hover:border-[#A64D79] hover:shadow-[0_0_14px_rgba(166,77,121,0.12),inset_0px_-5px_4px_rgba(0,0,0,0.25)]">
          <p className="text-xs sm:text-sm font-normal text-white truncate">Debug &amp; test</p>
          <p className="text-[10px] sm:text-xs font-extralight text-white/60 truncate">Performance &amp; QA</p>
        </div>
      </div>
    </div>
  );
}
