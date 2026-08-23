"use client";

import { useActionState, useState } from "react";
import { submitEnrollment, type EnrollFormState } from "@/lib/enrollment/actions";
import TurnstileWidget from "@/components/turnstile-widget";
import { AdminButton } from "@/components/admin/admin-ui";

type Field = {
  id: string;
  label: string;
  field_key: string;
  field_type: "text" | "email" | "tel" | "textarea" | "select";
  options: string[] | null;
  required: boolean;
};

const initialState: EnrollFormState = { status: "idle", message: "" };

export default function EnrollmentForm({
  fields,
  programCode,
  programName,
  track,
}: {
  fields: Field[];
  programCode: string | null;
  programName: string | null;
  track: string | null;
}) {
  const [state, formAction, pending] = useActionState(submitEnrollment, initialState);
  const [honeypot, setHoneypot] = useState("");

  if (state.status === "success") {
    return (
      <div className="border border-ink/15 bg-paper p-8 text-center">
        <p className="text-sm leading-6 text-charcoal/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 border border-ink/15 bg-paper p-6 sm:p-8">
      {state.status === "error" && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      {programCode && <input type="hidden" name="program_code" value={programCode} />}
      {programName && <input type="hidden" name="program_name" value={programName} />}
      {track && <input type="hidden" name="track" value={track} />}

      {programName && (
        <div className="border border-brass/30 bg-brass/5 px-3 py-2 text-sm text-ink">
          Applying for <span className="font-semibold">{programName}</span>
        </div>
      )}

      {fields.map((field) => (
        <div key={field.id}>
          <label
            htmlFor={field.field_key}
            className="text-xs font-semibold uppercase tracking-wide text-ink/70"
          >
            {field.label}
            {field.required && <span className="text-brass"> *</span>}
          </label>

          {field.field_type === "textarea" ? (
            <textarea
              id={field.field_key}
              name={field.field_key}
              rows={4}
              required={field.required}
              className="mt-1.5 w-full resize-none border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
            />
          ) : field.field_type === "select" ? (
            <select
              id={field.field_key}
              name={field.field_key}
              required={field.required}
              defaultValue=""
              className="mt-1.5 w-full border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
            >
              <option value="" disabled>
                Select…
              </option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.field_key}
              name={field.field_key}
              type={field.field_type}
              required={field.required}
              className="mt-1.5 w-full border border-ink/20 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brass"
            />
          )}
        </div>
      ))}

      {/* Honeypot */}
      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <TurnstileWidget />

      <AdminButton type="submit" disabled={pending} className="mt-2 justify-center">
        {pending ? "Submitting…" : "Submit Application"}
      </AdminButton>
    </form>
  );
}