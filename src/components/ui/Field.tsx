"use client";

import { useId, type ReactNode } from "react";
import Icon from "./Icon";

/** Accessibility wiring a control receives so its label, hint and error are announced. */
export type ControlProps = {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

type FieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Pass a render function to have the control linked to the label and messages. */
  children: ReactNode | ((control: ControlProps) => ReactNode);
};

export default function Field({ label, required, error, hint, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || hint;
  const control: ControlProps = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": message ? messageId : undefined,
    "aria-required": required || undefined,
  };
  const linked = typeof children === "function";

  return (
    <div className="space-y-1.5">
      <label htmlFor={linked ? id : undefined} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {linked ? children(control) : children}
      {error ? (
        <p id={messageId} className="flex items-center gap-1 text-xs font-medium text-red-600">
          <Icon name="info" className="size-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
