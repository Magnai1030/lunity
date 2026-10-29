/**
 * The admin edits the JSON files on disk, which only makes sense while developing:
 * a production build bundles those files and has no login yet. So the admin is open in
 * `next dev` and closed in production until the backend adds real accounts.
 */
export const adminEnabled = process.env.NODE_ENV !== "production";

export function requireAdmin() {
  if (!adminEnabled) throw new Error("Admin is turned off in production until the backend adds sign-in.");
}
