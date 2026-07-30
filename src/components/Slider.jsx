"use client";

export default function Slider({ label, value, onChange, min, max, step, className }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={className || ""}>
      {label && (
        <label className="block text-sm font-normal text-white/75 mb-2">
          {label}
        </label>
      )}
      <div className="relative h-10 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-[4px] rounded-full appearance-none cursor-pointer bg-[rgba(69,69,69,0.8)] outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-[18px]
            [&::-webkit-slider-thumb]:h-[18px]
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#A64D79]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[#A64D79]
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(166,77,121,0.4)]
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-200
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-[18px]
            [&::-moz-range-thumb]:h-[18px]
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#A64D79]
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-[#A64D79]
            [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(166,77,121,0.4)]"
          style={{
            background: `linear-gradient(to right, #A64D79 ${pct}%, rgba(69,69,69,0.8) ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40 mt-1">
        <span>{min}</span>
        <span className="text-sm text-white/75">
          Temperature: <span className="text-[#A64D79] font-medium">{value.toFixed(1)}</span>
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}
