"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  PaperPlaneTilt,
  Sparkle,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FormEvent, useState } from "react";

const services = [
  "AI automation",
  "Website",
  "Custom software",
  "AI video & images",
  "Social media",
  "AI restaurant menu",
  "Mobile app",
  "Not sure yet",
];

const steps = ["Scope", "About you", "Investment", "The brief"];

type FormState = {
  services: string[];
  name: string;
  company: string;
  email: string;
  phone: string;
  budget: string;
  timeline: string;
  details: string;
  website: string;
};

const initialForm: FormState = {
  services: [],
  name: "",
  company: "",
  email: "",
  phone: "",
  budget: "",
  timeline: "",
  details: "",
  website: "",
};

export function QuoteForm() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const update = (field: keyof FormState, value: string | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const toggleService = (service: string) => {
    const selected = form.services.includes(service)
      ? form.services.filter((item) => item !== service)
      : [...form.services, service];
    update("services", selected);
  };

  const validateStep = () => {
    if (step === 0 && form.services.length === 0) return "Choose at least one area to explore.";
    if (step === 1 && (!form.name.trim() || !form.email.trim())) return "Add your name and email to continue.";
    if (step === 1 && !/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address.";
    if (step === 2 && (!form.budget || !form.timeline)) return "Choose a budget and timeline.";
    if (step === 3 && form.details.trim().length < 20) return "Give us a little more context—at least 20 characters.";
    return "";
  };

  const goTo = (next: number) => {
    if (next > step) {
      const error = validateStep();
      if (error) {
        setMessage(error);
        return;
      }
    }
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setMessage("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateStep();
    if (error) {
      setMessage(error);
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        cache: "no-store",
        credentials: "same-origin",
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string; requestId?: string };
      if (!response.ok) throw new Error(result.message || "Could not send your brief.");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  const motionState = (offset: number) => ({
    opacity: offset === 0 ? 1 : 0,
    transform: reduce ? "translate3d(0, 0, 0)" : `translate3d(${offset * 28}px, 0, 0)`,
  });

  if (status === "success") {
    return (
      <div className="quote-success" role="status">
        <motion.div
          className="quote-success-mark"
          initial={{ opacity: 0, transform: reduce ? "scale(1)" : "scale(0.94)" }}
          animate={{ opacity: 1, transform: "scale(1)" }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        >
          <CheckCircle size={44} weight="light" aria-hidden="true" />
        </motion.div>
        <p className="eyebrow">Brief received</p>
        <h3>Good ideas need a first conversation.</h3>
        <p>Your project brief is on its way to Haider. Expect a personal reply within one business day.</p>
        <button
          className="quote-reset"
          type="button"
          onClick={() => {
            setForm(initialForm);
            setStep(0);
            setStatus("idle");
          }}
        >
          Send another brief
        </button>
      </div>
    );
  }

  return (
    <form className="quote-form" onSubmit={submit} noValidate>
      <div className="quote-progress" aria-label={`Step ${step + 1} of ${steps.length}: ${steps[step]}`}>
        <span>{String(step + 1).padStart(2, "0")}</span>
        <div className="quote-progress-track" aria-hidden="true">
          <motion.i
            animate={{ transform: `scaleX(${(step + 1) / steps.length})` }}
            transition={{ duration: 0.24, ease: [0.77, 0, 0.175, 1] }}
          />
        </div>
        <span>{String(steps.length).padStart(2, "0")}</span>
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          className="quote-step"
          key={step}
          custom={direction}
          initial={motionState(direction)}
          animate={motionState(0)}
          exit={motionState(-direction)}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="quote-step-label">{steps[step]}</p>

          {step === 0 && (
            <fieldset className="quote-fieldset">
              <legend>What should we build or improve?</legend>
              <div className="service-selector">
                {services.map((service) => {
                  const selected = form.services.includes(service);
                  return (
                    <button
                      className={selected ? "service-choice is-selected" : "service-choice"}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleService(service)}
                      key={service}
                    >
                      <span>{service}</span>
                      <i aria-hidden="true">{selected ? <Check size={15} weight="bold" /> : <span />}</i>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <div className="quote-fields">
              <h3>Who are we building with?</h3>
              <label>
                <span>Your name *</span>
                <input autoFocus name="name" value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" required />
              </label>
              <label>
                <span>Work email *</span>
                <input name="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required />
              </label>
              <label>
                <span>Company</span>
                <input name="company" value={form.company} onChange={(event) => update("company", event.target.value)} autoComplete="organization" />
              </label>
              <label>
                <span>Phone / WhatsApp</span>
                <input name="phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="quote-fields">
              <h3>Give the project a shape.</h3>
              <fieldset className="quote-fieldset compact">
                <legend>Estimated investment *</legend>
                <div className="choice-grid">
                  {["Under $2k", "$2k–$5k", "$5k–$10k", "$10k+", "Let’s discuss"].map((budget) => (
                    <button className={form.budget === budget ? "quote-choice is-selected" : "quote-choice"} type="button" onClick={() => update("budget", budget)} key={budget}>{budget}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="quote-fieldset compact">
                <legend>Ideal start *</legend>
                <div className="choice-grid">
                  {["Immediately", "Within a month", "1–3 months", "Just exploring"].map((timeline) => (
                    <button className={form.timeline === timeline ? "quote-choice is-selected" : "quote-choice"} type="button" onClick={() => update("timeline", timeline)} key={timeline}>{timeline}</button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="quote-fields quote-brief">
              <h3>What would success look like?</h3>
              <label>
                <span>Tell us about the challenge, the repetitive work, or the idea *</span>
                <textarea
                  autoFocus
                  name="details"
                  rows={7}
                  value={form.details}
                  onChange={(event) => update("details", event.target.value)}
                  placeholder="Right now our team spends..."
                  required
                />
              </label>
              <label className="quote-honeypot" aria-hidden="true">
                Website
                <input name="website" value={form.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" />
              </label>
              <div className="brief-summary">
                <Sparkle size={18} weight="light" aria-hidden="true" />
                <span>{form.services.join(" · ")}</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="quote-message" aria-live="polite">{message}</p>

      <div className="quote-controls">
        <button className="quote-back" type="button" onClick={() => goTo(step - 1)} disabled={step === 0 || status === "sending"}>
          <ArrowLeft size={17} weight="bold" aria-hidden="true" /> Back
        </button>
        {step < steps.length - 1 ? (
          <button className="quote-next" type="button" onClick={() => goTo(step + 1)}>
            Continue <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </button>
        ) : (
          <button className="quote-next" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending brief…" : "Send my brief"}
            <PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
