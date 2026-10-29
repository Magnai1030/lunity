"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";
import { IconButton } from "./IconButton";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Accessible name; also rendered as the heading unless `head` is given. */
  title: string;
  head?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** bottom: mobile sheet that becomes a centered dialog on desktop. left: full-height drawer. */
  side?: "bottom" | "left";
  wide?: boolean;
  closeLabel?: string;
};

/** Exit animation length; matches the `.is-closing` animations in atelier.css. */
const CLOSE_MS = 200;

/** Modal sheet built on <dialog> — native focus trap, Esc to close, backdrop click closes. */
export function Sheet({ open, onClose, title, head, footer, children, side = "bottom", wide, closeLabel = "Close" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  // Keep the panel mounted while it animates out after `open` turns false.
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    setClosing(!open);
  }

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open && !d.open) {
      d.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && d.open) {
      const finish = () => {
        setClosing(false);
        d.close();
      };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
      else timer = setTimeout(finish, CLOSE_MS);
    }
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("at-sheet", `at-sheet--${side}`, wide && "at-sheet--wide", closing && "is-closing")}
      aria-label={title}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {(open || closing) && (
        <div className="at-sheet__panel">
          {side === "bottom" && <div className="at-sheet__grip" aria-hidden="true" />}
          <div className="at-sheet__head">
            {head ?? <h2 className="title">{title}</h2>}
            <IconButton icon="close" label={closeLabel} onClick={onClose} />
          </div>
          <div className="at-sheet__body">{children}</div>
          {footer && <div className="at-sheet__foot">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
