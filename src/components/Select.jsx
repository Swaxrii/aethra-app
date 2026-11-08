"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export default function Select({ value, options, onChange, label, className = "" }) {
  const id = useId();
  const trigger = useRef(null);
  const list = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({});
  const [active, setActive] = useState(0);
  const place = () => {
    const rect = trigger.current.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 200), window.innerWidth - 24);
    const height = options.length * 44 + 12;
    setPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      width,
      ...(rect.bottom + height + 8 < window.innerHeight
        ? { top: rect.bottom + 8 }
        : { bottom: window.innerHeight - rect.top + 8 }),
    });
  };
  const show = (index = Math.max(0, options.indexOf(value))) => {
    place();
    setActive(index);
    setOpen(true);
  };
  const dismiss = (restore = true) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  };
  const choose = (option) => {
    onChange(option);
    dismiss();
  };
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => list.current?.focus(), 0);
    const outside = (event) => {
      if (!trigger.current?.contains(event.target) && !list.current?.contains(event.target))
        setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={`custom-select ${className}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? dismiss() : show())}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            show(
              event.key === "End"
                ? options.length - 1
                : event.key === "Home"
                  ? 0
                  : Math.max(0, options.indexOf(value)),
            );
          }
        }}
      >
        <span>{value}</span>
        <ChevronDown size={16} />
      </button>
      {open &&
        createPortal(
          <div
            ref={list}
            id={id}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            aria-activedescendant={`${id}-${active}`}
            className="select-menu"
            style={position}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                dismiss();
              } else if (event.key === "Tab") {
                dismiss();
              } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                setActive((index) =>
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? options.length - 1
                      : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) %
                        options.length,
                );
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                choose(options[active]);
              } else if (event.key.length === 1) {
                const match = options.findIndex((option) =>
                  option.toLowerCase().startsWith(event.key.toLowerCase()),
                );
                if (match >= 0) setActive(match);
              }
            }}
          >
            {options.map((option, index) => (
              <div
                key={option}
                id={`${id}-${index}`}
                role="option"
                aria-selected={value === option}
                className={active === index ? "is-focused" : ""}
                onPointerMove={() => setActive(index)}
                onClick={() => choose(option)}
              >
                <span className="select-check" aria-hidden="true">
                  {value === option && <Check size={16} />}
                </span>
                <span>{option}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
