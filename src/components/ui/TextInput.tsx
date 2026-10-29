"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

type FieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  icon?: IconName;
  /** Static text shown before the value, e.g. "+976". */
  prefix?: string;
  trailing?: ReactNode;
  className?: string;
};

function Field({ id, label, required, hint, error, className, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cx("at-field", className)}>
      {label && (
        <label htmlFor={id} className="small at-field__label">
          {label}
          {required && (
            <span className="at-field__req" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <div id={`${id}-err`} className="small at-field__error">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div id={`${id}-hint`} className="small at-field__hint">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export function TextInput({ label, required, hint, error, icon, prefix, trailing, className, id: idProp, ...rest }: FieldProps & Omit<ComponentProps<"input">, "prefix">) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <div className={cx("at-input", error && "is-error")}>
        {icon && <Icon name={icon} size={18} />}
        {prefix && <span className="at-input__prefix">{prefix}</span>}
        <input id={id} required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} {...rest} />
        {trailing}
      </div>
    </Field>
  );
}

export function TextArea({ label, hint, error, className, id: idProp, ...rest }: FieldProps & ComponentProps<"textarea">) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <textarea id={id} className={cx("at-textarea", error && "is-error")} aria-describedby={describedBy(id, error, hint)} {...rest} />
    </Field>
  );
}
