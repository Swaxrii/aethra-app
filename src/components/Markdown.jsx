"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const raw = String(children || "").replace(/\n$/, "");
    navigator.clipboard?.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-2 overflow-hidden rounded-xl bg-black/40 border border-white/10">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 border-b border-white/10 bg-white/[0.03]">
        <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">Code</span>
        <button
          type="button"
          onClick={copy}
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer ${copied ? "bg-[#A64D79] text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy code
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed">{children}</pre>
    </div>
  );
}

function extractText(node) {
  const flatten = (n) => {
    if (n == null) return "";
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(flatten).join("");
    if (n.props?.children) return flatten(n.props.children);
    return "";
  };
  return flatten(node?.children ?? node ?? "");
}

const isEmptyCode = (text) => !text || text.trim() === "";

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
  code: ({ children, className }) => {
    const text = extractText(children);
    const isBlock = isEmptyCode(text) ? false : /[\r\n]/.test(text) || text.length > 60 || /</.test(text);
    if (isBlock) return <CodeBlock className={className}>{text}</CodeBlock>;
    return <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-[13px] text-[#f4a3c7] font-mono">{children}</code>;
  },
  pre: ({ children }) => <CodeBlock>{extractText(children)}</CodeBlock>,
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
