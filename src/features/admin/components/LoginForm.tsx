"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import { controlClass } from "@/components/ui/control-class";
import { signIn, type SignInState } from "../auth/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          <Icon name="info" className="size-4 shrink-0" />
          {state.error}
        </p>
      )}
      <Field label="ईमेल" required>
        {(control) => (
          <input
            {...control}
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            defaultValue={state.email}
            placeholder="admin@example.com"
            className={controlClass(state.error)}
          />
        )}
      </Field>
      <Field label="पासवर्ड" required>
        {(control) => (
          <input
            {...control}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={controlClass(state.error)}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full">
        {pending ? "लॉग इन हो रहा है…" : "लॉग इन करें"}
      </Button>
    </form>
  );
}
