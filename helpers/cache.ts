import exp from "constants";

const cache = {};
let cacheTimestamp: number = 0;

export function resetCache(key: string) {
  // @ts-expect-error
  cache[key] = undefined;
}

export function getCache(key: string, ttl = 60 * 1000) {
  // @ts-expect-error
  if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
    // @ts-expect-error
    return cache[key].value;
  }
  return undefined;
}

export function setCache(key: string, value: any) {
  // @ts-expect-error
  cache[key] = {
    value,
    timestamp: Date.now(),
  };
}

export const STANDINGS_CACHE_KEY = "standings";
