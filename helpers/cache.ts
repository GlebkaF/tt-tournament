import exp from "constants";

const cache = {};
let cacheTimestamp: number = 0;

export function resetCache(key: string) {
  cache[key] = undefined;
}

export function getCache(key: string, ttl = 60 * 1000) {
  if (cache[key] && Date.now() - cache[key].timestamp < ttl) {
    return cache[key].value;
  }
  return undefined;
}

export function setCache(key: string, value: any) {
  cache[key] = {
    value,
    timestamp: Date.now(),
  };
}

export const STANDINGS_CACHE_KEY = "standings";
