import Link from "next/link";
import React from "react";

interface MarkdownTagAProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

export default function MarkdownTagA({
  children,
  ...props
}: MarkdownTagAProps): JSX.Element {
  const href: string = (props.href as string) ?? "";

  const isExternalLink =
    href.startsWith("http") && !href.startsWith("https://ebtt.ru");

  const rel = isExternalLink ? "nofollow" : "";
  const target = isExternalLink ? "_blank" : "";

  return (
    <Link
      {...props}
      href={href}
      className="text-l cursor-pointer text-link-base hover:opacity-80"
      rel={rel}
      target={target}
    >
      {children}
    </Link>
  );
}
