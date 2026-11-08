export default function AethraMark({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path d="M24 4 44 39H33L24 23 15 39H4L24 4Z" fill="currentColor" />
      <path d="M18 38h12l-6 6-6-6Z" fill="currentColor" opacity=".45" />
      <path d="m24 4 4 18-4-6-4 6 4-18Z" fill="#fff" opacity=".5" />
    </svg>
  );
}
