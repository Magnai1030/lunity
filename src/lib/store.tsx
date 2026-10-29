"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { isListed, lineKey, setToday, unitPrice, type Lang, type Selection } from "./data";
import { dictionaries } from "./i18n";

/** One cart row: a product in one chosen type. `key` = product id + options. */
export type CartLine = { key: string; id: string; qty: number; sel?: Selection };
export type User = { name: string; phone: string; email: string };

type State = {
  lang: Lang;
  cart: CartLine[];
  fav: string[];
  user: User | null;
  toast: string;
  /** False during SSR/hydration, true once localStorage has been read. */
  hydrated: boolean;
};

const KEY = "lunar-gift-shop:v1";
const MAX_QTY = 10;
const initial: State = { lang: "en", cart: [], fav: [], user: null, toast: "", hydrated: false };

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  // Browser-only clock for sale end dates (see setToday); the state change below re-renders prices.
  setToday(new Date().toLocaleDateString("sv"));
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
    // Drop products that were removed or archived; older saves stored lines without options/keys.
    state.cart = state.cart.filter((c) => isListed(c.id)).map((c) => ({ ...c, key: lineKey(c.id, c.sel) }));
  } catch {
    // Storage blocked or corrupt — keep defaults.
    state = { ...initial };
  }
  state = { ...state, toast: "", hydrated: true };
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try {
    const { lang, cart, fav, user } = state;
    window.localStorage.setItem(KEY, JSON.stringify({ lang, cart, fav, user }));
  } catch {
    // Ignore quota / privacy-mode errors.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => initial;

let toastTimer: ReturnType<typeof setTimeout> | undefined;

const actions = {
  setLang: (lang: Lang) => set({ lang }),
  /** Adds a product in the chosen type (defaults when `sel` is omitted). */
  addToCart(id: string, qty = 1, sel?: Selection) {
    const key = lineKey(id, sel);
    const cart = state.cart.map((c) => ({ ...c }));
    const row = cart.find((c) => c.key === key);
    if (row) row.qty = Math.min(row.qty + qty, MAX_QTY);
    else cart.push({ key, id, qty: Math.min(qty, MAX_QTY), sel });
    set({ cart });
  },
  setQty: (key: string, qty: number) =>
    set({ cart: state.cart.map((c) => (c.key === key ? { ...c, qty: Math.max(1, Math.min(qty, MAX_QTY)) } : c)) }),
  remove: (key: string) => set({ cart: state.cart.filter((c) => c.key !== key) }),
  clearCart: () => set({ cart: [] }),
  toggleFav: (id: string) =>
    set({ fav: state.fav.includes(id) ? state.fav.filter((f) => f !== id) : [...state.fav, id] }),
  login: (user: User) => set({ user }),
  logout: () => set({ user: null }),
  showToast(message: string) {
    clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: "" }), 2400);
  },
};

export const MAX_CART_QTY = MAX_QTY;

export function useShop() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = dictionaries[s.lang];

  const cartCount = s.cart.reduce((n, c) => n + c.qty, 0);
  const subtotal = s.cart.reduce((n, c) => n + unitPrice(c.id, c.sel) * c.qty, 0);
  const isFav = useCallback((id: string) => s.fav.includes(id), [s.fav]);

  return useMemo(
    () => ({ ...s, ...actions, t, cartCount, subtotal, isFav, MAX_QTY }),
    [s, t, cartCount, subtotal, isFav],
  );
}

/** Keeps <html lang> in sync with the chosen language. */
export function LangSync() {
  const { lang } = useShop();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
