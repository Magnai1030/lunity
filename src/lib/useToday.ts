import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** Local date as YYYY-MM-DD on the client; null while prerendering, so server and client markup match. */
export const useToday = () => useSyncExternalStore(noSubscribe, () => new Date().toLocaleDateString("sv"), () => null);
