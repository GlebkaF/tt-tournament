"use client";
import { useState } from "react";

const DEFAULT = "/image/profile/default.jpg";

/** Круглый аватар с фолбэком на дефолт при ошибке загрузки. */
export function Avatar({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={errored ? DEFAULT : src}
      alt={alt}
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
}
