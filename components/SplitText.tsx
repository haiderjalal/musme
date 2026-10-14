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
  /**
   * `load` plays as soon as the page renders (for the hero). `view` plays when the heading scrolls into view,
   * driven by the shared reveal observer.
   */
  trigger?: "load" | "view";
  /** Milliseconds before the first word starts rising. */
  delay?: number;
};

/** Turns a plain title into words, one per space-separated token. */
export function wordsFrom(text: string): SplitWord[] {
  return text.split(" ").filter((word) => word.length > 0).map((word) => ({ text: word }));
}

/**
 * Server-rendered heading whose words rise out of a mask (pure CSS, no JavaScript needed to show the text).
 * The full sentence stays in the HTML and is exposed through `aria-label`; the split spans are hidden from assistive tech.
 */
export function SplitText({ as: Component, words, className, trigger = "load", delay = 0 }: SplitTextProps) {
  const label = words.map((word) => word.text).join(" ");

  return (
    <Component
      className={className}
      aria-label={label}
      data-split={trigger}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
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
