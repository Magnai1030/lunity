// Formatting for admin client components. Kept apart from lib/i18n on purpose: that module
// imports the JSON tables, and a client import of them would full-reload the admin in dev
// every time a save rewrites a file.

const num = new Intl.NumberFormat("en-US");
export const mnt = (n: number) => `₮${num.format(n)}`;

const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
export const date = (iso: string) => day.format(new Date(`${iso}T00:00:00`));

export const STATUS_LABEL = { preparing: "Preparing", ready: "Ready for pickup", completed: "Completed" } as const;
export const STATUS_TONE = { preparing: "warn", ready: "ok", completed: "neutral" } as const;
