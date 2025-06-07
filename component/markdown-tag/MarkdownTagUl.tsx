import React from "react";

interface MarkdownTagUlProps {
  children: React.ReactNode;
  [key: string]: unknown;
  setShowRelevanceInfo: (arg: boolean) => void;
}

export default function MarkdownTagUl({
  children,
  ...props
}: MarkdownTagUlProps): React.JSX.Element {
  return (
    // pl-*, а не list-inside, потому что list-inside не работает вместе с <p> внутри <li> списка, верстка ломается
    <ul {...props} className="text-l list-disc pl-20">
      {children}
    </ul>
  );
}
