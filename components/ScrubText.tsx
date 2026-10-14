import type { CSSProperties } from "react";

export type ScrubWord = {
  text: string;
  /** Render in the emphasis style (white, serif), matching the phrases called out in the copy. */
  emphasis: boolean;
};

type ScrubTextProps = {
  words: ScrubWord[];
  className?: string;
};

/**
 * Splits a sentence into words, marking every word that belongs to one of the emphasised phrases.
 * Punctuation stays attached to its word, so each word can light up as one unit.
 */
export function scrubWordsFrom(text: string, emphasised: string[] = []): ScrubWord[] {
  const ranges = emphasised
    .map((phrase) => {
      const start = text.indexOf(phrase);
      return start < 0 ? null : { start, end: start + phrase.length };
    })
    .filter((range): range is { start: number; end: number } => range !== null);

  const words: ScrubWord[] = [];
  let offset = 0;
  for (const token of text.split(/(\s+)/)) {
    if (token.length > 0 && token.trim().length > 0) {
      const end = offset + token.length;
      const emphasis = ranges.some((range) => offset < range.end && end > range.start);
      words.push({ text: token, emphasis });
    }
    offset += token.length;
  }

  return words;
}

/**
 * A paragraph whose words light up as the paragraph scrolls through the viewport. The server renders every word
 * fully visible; `startScrollLinks` sets `--p`, and the CSS dims words that have not been reached yet.
 */
export function ScrubText({ words, className }: ScrubTextProps) {
  return (
    <p className={className} data-scroll-link="" style={{ "--n": words.length } as CSSProperties}>
      {words.map((word, index) => (
        <span key={index}>
          {index > 0 && " "}
          <span
            className={word.emphasis ? "scrub-word scrub-emphasis" : "scrub-word"}
            style={{ "--i": index } as CSSProperties}
          >
            {word.text}
          </span>
        </span>
      ))}
    </p>
  );
}
