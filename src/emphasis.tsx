import { EMPHASIS_COLOR } from "./constants";

/**
 * Renders `**word**`-wrapped substrings (as written by generate_content.py's
 * prompt) as bold, accent-colored spans. Highlighting the number/keyword a
 * viewer's eye lands on is a standard short-form-video retention technique —
 * it speeds up parsing and gives static text some visual punch.
 */
export const renderEmphasized = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={index} style={{ color: EMPHASIS_COLOR, fontWeight: 900 }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
};
