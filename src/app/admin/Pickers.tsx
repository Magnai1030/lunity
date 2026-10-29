"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon, ICON_NAMES, Thumb, cx, isIconName, type IconName } from "@/components/ui";
import s from "./admin.module.css";

/** Open/close state for a popover that closes on Escape or a click outside it. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  return { open, setOpen, root };
}

/* Icon picker: the button shows the icon; the panel is a grid of icons (names as tooltips). */

// Interface-only icons that mean nothing as a menu picture.
const PICKABLE = ICON_NAMES.filter((n) => n !== "grip");

export function IconPicker({ value, onChange, label, fallback = "tag" }: { value: string | null; onChange: (name: IconName) => void; label: string; fallback?: IconName }) {
  const { open, setOpen, root } = usePopover();
  const current = isIconName(value) ? value : fallback;
  const grid = useRef<HTMLDivElement>(null);

  // Arrow keys move through the grid; the panel is 6 icons wide.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...(grid.current?.querySelectorAll("button") ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 6, ArrowUp: -6 }[e.key];
    if (e.key === "Escape") {
      setOpen(false);
      root.current?.querySelector("button")?.focus();
    } else if (step && i >= 0) {
      e.preventDefault();
      buttons[Math.max(0, Math.min(buttons.length - 1, i + step))]?.focus();
    }
  };

  return (
    <div ref={root} className={s.picker}>
      <button type="button" className={s.iconPickerBtn} aria-label={`${label}: ${current}`} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name={current} size={20} />
        <Icon name="chevron" size={14} className={s.pickerCaret} />
      </button>
      {open && (
        <div ref={grid} className={cx(s.pickerPanel, s.iconGrid)} role="group" aria-label={label} onKeyDown={onKey}>
          {PICKABLE.map((name) => (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={name}
              aria-pressed={name === current}
              className={cx(s.iconCell, name === current && s.iconCellOn)}
              autoFocus={name === current}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
            >
              <Icon name={name} size={20} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Product picker: a searchable list with each product's picture, name and number. */

export type PickerItem = { id: string; title: string; meta: string; photo?: string; badge?: ReactNode };

export function ProductPicker({ items, onPick, label, placeholder }: { items: PickerItem[]; onPick: (id: string) => void; label: string; placeholder: string }) {
  const { open, setOpen, root } = usePopover();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = items.filter((it) => words.every((w) => `${it.title} ${it.meta}`.toLowerCase().includes(w)));

  const close = () => {
    setOpen(false);
    setQ("");
    setActive(0);
  };
  const pick = (id: string) => {
    onPick(id);
    close();
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, Math.min(shown.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) pick(shown[active].id);
    } else if (e.key === "Escape") {
      close();
    }
  };

  return (
    <div ref={root} className={s.picker}>
      <span className="small muted">{label}</span>
      <button type="button" className={s.productPickerBtn} aria-haspopup="listbox" aria-expanded={open} onClick={() => (open ? close() : setOpen(true))}>
        <Icon name="plus" size={18} />
        <span>{placeholder}</span>
        <Icon name="chevron" size={14} className={s.pickerCaret} />
      </button>
      {open && (
        <div className={cx(s.pickerPanel, s.productPanel)}>
          <div className={s.pickerSearch}>
            <Icon name="search" size={16} />
            <input
              autoFocus
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={shown[active] ? `${listId}-${shown[active].id}` : undefined}
              aria-label={`Search ${label.toLowerCase()}`}
              placeholder="Search by name or N°"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
            />
          </div>
          <ul id={listId} role="listbox" aria-label={label} className={s.pickerList}>
            {shown.length === 0 && <li className={cx("small muted", s.pickerEmpty)}>Nothing matches “{q}”.</li>}
            {shown.map((it, i) => (
              <li
                key={it.id}
                id={`${listId}-${it.id}`}
                role="option"
                aria-selected={i === active}
                className={cx(s.pickerOption, i === active && s.pickerOptionOn)}
                onPointerEnter={() => setActive(i)}
                onClick={() => pick(it.id)}
              >
                <Thumb art={it.id} photo={it.photo} size={40} />
                <span className={s.productText}>
                  <span className="body-strong">{it.title}</span>
                  <span className="small muted">{it.meta}</span>
                </span>
                {it.badge}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
