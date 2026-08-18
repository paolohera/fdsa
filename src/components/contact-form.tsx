"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactFormState } from "@/app/(site)/contact/actions";

const initialState: ContactFormState = { status: "idle", message: "" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm leading-6 text-charcoal/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.message}
        </p>
      )}

      <div>
        <label
          htmlFor="name"
          className="text-xs font-semibold uppercase tracking-wide text-ink/70"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1.5 w-full border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-wide text-ink/70"
        >
          Your Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="text-xs font-semibold uppercase tracking-wide text-ink/70"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="mt-1.5 w-full resize-none border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-parchment transition hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}