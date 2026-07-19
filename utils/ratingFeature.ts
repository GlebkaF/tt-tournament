"use client";

import { useEffect, useState } from "react";

export const RATING_FEATURE_STORAGE_KEY = "tt-rating-enabled";

export interface RatingFeatureStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function resolveRatingFeature(
  search: string,
  storage: RatingFeatureStorage
): boolean {
  const value = new URLSearchParams(search).get("rating");
  if (value === "1") {
    storage.setItem(RATING_FEATURE_STORAGE_KEY, "1");
    return true;
  }
  if (value === "0") {
    storage.removeItem(RATING_FEATURE_STORAGE_KEY);
    return false;
  }
  return storage.getItem(RATING_FEATURE_STORAGE_KEY) === "1";
}

export function useRatingFeatureFlag(): {
  enabled: boolean;
  ready: boolean;
} {
  const [state, setState] = useState({ enabled: false, ready: false });

  useEffect(() => {
    try {
      setState({
        enabled: resolveRatingFeature(window.location.search, localStorage),
        ready: true,
      });
    } catch {
      setState({ enabled: false, ready: true });
    }
  }, []);

  return state;
}
