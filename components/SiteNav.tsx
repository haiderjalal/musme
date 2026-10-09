"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const audiences = ["clinics", "restaurants", "owner-led businesses", "ambitious teams"];

function Typewriter() {
  const reduce = useReducedMotion();
  const [word, setWord] = useState(0);
  const [length, setLength] = useState(audiences[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const full = audiences[word];
    const done = !deleting && length === full.length;
    const empty = deleting && length === 0;
    const timer = setTimeout(
      () => {
        if (done) setDeleting(true);
        else if (empty) {
          setDeleting(false);
          setWord((word + 1) % audiences.length);
        } else setLength(length + (deleting ? -1 : 1));
      },
      done ? 1800 : deleting ? 40 : 90,
    );
    return () => clearTimeout(timer);
  }, [reduce, word, length, deleting]);

  return (
    <span className="nav-tagline" aria-hidden="true">
      AI systems for {audiences[word].slice(0, reduce ? undefined : length)}
      <i className="nav-caret" />
    </span>
  );
}

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <a className="brand" href="#top" aria-label="Musme home">
        <Image className="brand-mark" src="/images/musme-logo-mark.png" alt="" width={40} height={29} priority />
        <span className="brand-name">musme</span>
      </a>
      <Typewriter />
      <div className="nav-links">
        <Link href="/about">About</Link>
        <Link href="/services/ai-automation">Services</Link>
        <Link href="/case-studies">Work</Link>
        <Link href="/#products">Products</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </nav>
  );
}
