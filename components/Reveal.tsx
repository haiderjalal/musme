import type { CSSProperties } from "react";

type RevealDirection = "up" | "left" | "right" | "scale";

type RevealOptions = {
  /** Seconds to wait after the element is revealed. */
  delay?: number;
  direction?: RevealDirection;
  /** Share of the element that must be visible before it reveals. */
  amount?: number;
};

type RevealProps = RevealOptions & {
  children: React.ReactNode;
  className?: string;
  /** Extra inline custom properties, for example `--i` for list stagger. */
  style?: CSSProperties;
  as?: "div" | "li" | "article" | "footer";
};

/**
 * Data attributes that drive the CSS reveal. Spread them onto an element when it needs its own ref or tag.
 * The hidden state is applied by CSS only when JavaScript is running (see `html.js` in globals.css).
 */
export function getRevealProps({ delay = 0, direction = "up", amount = 0.18 }: RevealOptions = {}) {
  return {
    "data-reveal": direction,
    "data-reveal-amount": amount,
    style: { "--d": `${Math.round(delay * 1000)}ms` } as CSSProperties,
  };
}

/** Server-rendered reveal wrapper: its content is in the first HTML, so it is readable without JavaScript. */
export function Reveal({ children, className, style, as = "div", ...options }: RevealProps) {
  const Component = as as "div";
  const { style: revealStyle, ...revealAttributes } = getRevealProps(options);

  return (
    <Component className={className} {...revealAttributes} style={{ ...revealStyle, ...style }}>
      {children}
    </Component>
  );
}
