"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Button, Icon, cx } from "@/components/ui";
import type { ActionResult } from "./actions";
import s from "./admin.module.css";

type FormAction = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

/* One save bar per page */

type Slot = { dirty: boolean; save: () => Promise<ActionResult>; discard: () => void };
type Scope = { set: (id: string, slot: Slot | null) => void; saveAll: () => void };
const ScopeContext = createContext<Scope | null>(null);

/**
 * Pages with several editors (product: details, variants, gift set) get one save bar, pinned
 * to the bottom of the screen like Shopify's. Save runs every editor with changes, in order,
 * and stops at the first error so it can be fixed.
 */
export function SaveScope({ children }: { children: ReactNode }) {
  const slots = useRef(new Map<string, Slot>());
  const [dirtyIds, setDirtyIds] = useState<string[]>([]);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();

  const dirtyNow = () => [...slots.current].filter(([, slot]) => slot.dirty).map(([id]) => id);
  const saveAll = () =>
    start(async () => {
      let last: ActionResult = null;
      for (const id of dirtyNow()) {
        last = (await slots.current.get(id)?.save()) ?? null;
        if (last && !last.ok) break;
      }
      setResult(last?.ok ? { ok: true, message: "Changes saved" } : last);
    });

  const scope = useMemo<Scope>(
    () => ({
      set(id, slot) {
        if (slot) slots.current.set(id, slot);
        else slots.current.delete(id);
        const ids = [...slots.current].filter(([, x]) => x.dirty).map(([k]) => k);
        setDirtyIds((prev) => (prev.join() === ids.join() ? prev : ids));
      },
      saveAll: () => saveAllRef.current(),
    }),
    [],
  );
  // saveAll closes over fresh state each render; the memoized scope calls the latest one.
  const saveAllRef = useRef(saveAll);
  useEffect(() => {
    saveAllRef.current = saveAll;
  });

  return (
    <ScopeContext.Provider value={scope}>
      {children}
      <SaveBar
        dirty={dirtyIds.length > 0}
        pending={pending}
        result={result}
        onSave={saveAll}
        onDiscard={() => {
          dirtyNow().forEach((id) => slots.current.get(id)?.discard());
          setResult(null);
        }}
        onDone={() => setResult(null)}
      />
    </ScopeContext.Provider>
  );
}

/**
 * Lets an editor join the page's SaveScope. Returns true when it did, in which case the
 * editor shows no bar of its own.
 */
export function useSaveSlot(slot: Slot) {
  const scope = useContext(ScopeContext);
  const id = useId();
  useEffect(() => {
    scope?.set(id, slot);
  });
  useEffect(() => () => scope?.set(id, null), [scope, id]);
  return scope !== null;
}

/**
 * Form with a Shopify-style save bar: it slides up once anything changes, offers Discard and
 * Save, and confirms the save. Submits through the action without React's auto-reset, so a
 * validation error never wipes what was typed.
 */
export function AdminForm({ action, children, className, onDiscard }: { action: FormAction; children: ReactNode; className?: string; onDiscard?: () => void }) {
  const ref = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();

  const save = async () => {
    const r = await action(null, new FormData(ref.current!));
    if (r?.ok) setDirty(false);
    return r;
  };
  const discard = () => {
    ref.current?.reset();
    onDiscard?.();
    setDirty(false);
    setResult(null);
  };
  const inScope = useSaveSlot({ dirty, save, discard });
  const scope = useContext(ScopeContext);

  // Enter in a field saves: the whole page when in a scope, otherwise just this form.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (scope) return scope.saveAll();
    start(async () => setResult(await save()));
  };

  return (
    <form ref={ref} onSubmit={submit} onChange={() => setDirty(true)} className={className} noValidate>
      {children}
      {!inScope && <SaveBar dirty={dirty} pending={pending} result={result} onDiscard={discard} onDone={() => setResult(null)} />}
    </form>
  );
}

/** Bottom bar: unsaved state with Discard/Save, an error to fix, or a short "Saved" confirmation. */
export function SaveBar({ dirty, pending, result, onDiscard, onDone, onSave }: {
  dirty: boolean;
  pending: boolean;
  result: ActionResult;
  onDiscard: () => void;
  onDone: () => void;
  /** For editors that save without a <form>; otherwise Save submits the surrounding form. */
  onSave?: () => void;
}) {
  const saved = !dirty && result?.ok;
  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(onDone, 2500);
    return () => clearTimeout(id);
  }, [saved, onDone]);

  if (!dirty && !pending && !saved) return null;
  return (
    <div className={cx(s.saveBar, saved && s.saveBarDone)} role="status" aria-live="polite">
      {saved ? (
        <span className={s.saveMsg}>
          <Icon name="check" size={18} strokeWidth={2.4} />
          {result.message}
        </span>
      ) : (
        <>
          <span className={s.saveMsg}>
            {result && !result.ok ? (
              <>
                <Icon name="alert" size={18} />
                {result.message}
              </>
            ) : (
              "Unsaved changes"
            )}
          </span>
          <div className={s.saveActions}>
            <Button type="button" variant="ghost" size="sm" onClick={onDiscard} disabled={pending}>
              Discard
            </Button>
            <Button type={onSave ? "button" : "submit"} size="sm" onClick={onSave} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/** Native checkbox styled as a switch, so it takes part in the form's change tracking and FormData. */
export function Switch({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className={s.switchRow}>
      <span className={s.switchText}>
        <span className="body-strong">{label}</span>
        {hint && <span className="small muted">{hint}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className={s.switch} role="switch" />
    </label>
  );
}

/** A titled block of fields, like a Shopify settings card. */
export function Card({ title, hint, children, aside }: { title?: string; hint?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className={s.card}>
      {(title || aside) && (
        <div className={s.cardHead}>
          <div className={s.cardTitle}>
            {title && <h2 className="body-strong">{title}</h2>}
            {hint && <p className="small muted">{hint}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
