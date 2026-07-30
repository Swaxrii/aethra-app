"use client";

export default function SegmentedControl({ label, options, value, onChange, className }) {
  return (
    <div className={className || ""}>
      {label && (
        <label className="block text-sm font-normal text-white/75 mb-2">
          {label}
        </label>
      )}
      <div className="flex rounded-[8px] bg-[rgba(69,69,69,0.25)] border border-[rgba(69,69,69,0.8)] p-1 gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 px-3 py-2 text-sm rounded-[6px] transition-all duration-300 ${
              value === opt
                ? "bg-[#A64D79] text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-[rgba(166,77,121,0.15)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
