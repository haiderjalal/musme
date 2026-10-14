import { Fragment, type CSSProperties } from "react";

export type SplitWord = {
  text: string;
  /** Start a new line before this word. */
  lineBreak?: boolean;
  /** Render this word in the brand accent colour. */
  accent?: boolean;
};

type SplitTextProps = {
  as: "h1" | "h2";
  words: SplitWord[];
  className?: string;
  /** Milliseconds before the first word starts rising. */
  delay?: number;
};

/**
 * Server-rendered heading whose words rise out of a mask when the page loads (pure CSS, no JavaScript).
 * The full sentence stays in the HTML and is exposed through `aria-label`; the split spans are hidden from assistive tech.
 */
export function SplitText({ as: Component, words, className, delay = 0 }: SplitTextProps) {
  const label = words.map((word) => word.text).join(" ");

  return (
    <Component className={className} aria-label={label} data-split="load" style={{ "--d": `${delay}ms` } as CSSProperties}>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Fragment key={index}>
            {word.lineBreak && index > 0 && <br />}
            <span className="split-word split-mask">
              <span
                className={word.accent ? "split-unit accent" : "split-unit"}
                style={{ "--i": index } as CSSProperties}
              >
                {word.text}
              </span>
            </span>
            {index < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Component>
  );
}
