import { hc } from "hono/client";
import type { AppRoute } from ".";
// this is a trick to calculate the type when compiling
const client = hc<AppRoute>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
    hc<AppRoute>(...args);
