"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  p: ({ children }) => <p className="my-1.5 last:mb-0">{children}</p>,
  h1: ({ children }) => <h1 className="mt-4 mb-2 text-lg font-semibold text-white first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-4 mb-2 text-base font-semibold text-white first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-3 mb-1.5 text-[15px] font-semibold text-white first:mt-0">{children}</h3>,
  ul: ({ children }) => <ul className="my-2 pl-5 space-y-1 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 pl-5 space-y-1 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-[13px] text-[#f4a3c7] font-mono">{children}</code>,
  pre: ({ children }) => <pre className="my-2 p-3 rounded-xl bg-black/40 border border-white/10 overflow-x-auto text-[13px] font-mono leading-relaxed">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="my-2 pl-3 border-l-2 border-[#A64D79] text-white/75 italic">{children}</blockquote>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#f4a3c7] underline underline-offset-2 hover:text-[#A64D79] transition-colors">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-white/15 bg-white/5 px-3 py-1.5 text-left font-semibold text-white">{children}</th>,
  td: ({ children }) => <td className="border border-white/15 px-3 py-1.5 text-white/85">{children}</td>,
  hr: () => <hr className="my-3 border-white/10" />,
};

export default function Markdown({ text, className = "" }) {
  return (
    <div className={`text-sm sm:text-[15px] leading-relaxed text-white/90 font-light break-words ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
