import React from "react";

interface TextAtomProps {
  text: string;
  className?: string; // optional for extending styles
}

export const TextAtom: React.FC<TextAtomProps> = ({ text, className }) => {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 400,
        fontStyle: "normal",
        fontSize: "12px",
        lineHeight: "16px",
        letterSpacing: "0",
        whiteSpace: "nowrap", // prevents text from wrapping
        overflow: "hidden",   // optional, hides overflow
        textOverflow: "ellipsis", // optional, shows ... for overflow
        display: "inline-block",
        opacity: 1,
      }}
    >
      {text}
    </span>
  );
};


