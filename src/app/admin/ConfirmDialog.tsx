"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import s from "./admin.module.css";

/**
 * Modal confirmation for destructive actions. Built on <dialog> (focus trap, Escape = cancel).
 * Cancel gets focus first, so Enter never confirms by accident.
 */
export function ConfirmDialog({ open, title, children, confirmLabel, pendingLabel, pending, error, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      cancel.current?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={s.confirmDialog}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div className={s.confirmBody}>
        <span className={s.confirmIcon} aria-hidden="true">
          <Icon name="trash" size={22} />
        </span>
        <h2 id={titleId} className="title">
          {title}
        </h2>
        <div id={bodyId} className={`body muted ${s.confirmText}`}>
          {children}
        </div>
        {error && (
          <p className={`small ${s.confirmError}`} role="alert">
            <Icon name="alert" size={16} />
            {error}
          </p>
        )}
        <div className={s.confirmActions}>
          <button ref={cancel} type="button" className="at-btn at-btn--secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          {/* Same size as Cancel; solid red because it's the destructive choice. */}
          <button type="button" className={`at-btn ${s.confirmDanger}`} onClick={onConfirm} disabled={pending}>
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
