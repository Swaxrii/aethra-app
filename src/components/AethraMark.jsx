import Image from "next/image";

export default function AethraMark({ size = 40, className = "" }) {
  return (
    <Image
      src="/logo.svg"
      width={size}
      height={Math.round((size * 207) / 314)}
      className={className}
      alt=""
      aria-hidden="true"
    />
  );
}
