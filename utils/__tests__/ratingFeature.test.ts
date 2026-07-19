import {
  RATING_FEATURE_STORAGE_KEY,
  RatingFeatureStorage,
  resolveRatingFeature,
} from "../ratingFeature";

function memoryStorage(initial?: Record<string, string>): RatingFeatureStorage {
  const data = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

describe("resolveRatingFeature", () => {
  it("enables and persists the experiment with ?rating=1", () => {
    const storage = memoryStorage();

    expect(resolveRatingFeature("?rating=1", storage)).toBe(true);
    expect(storage.getItem(RATING_FEATURE_STORAGE_KEY)).toBe("1");
  });

  it("keeps the experiment enabled on subsequent navigation", () => {
    const storage = memoryStorage({ [RATING_FEATURE_STORAGE_KEY]: "1" });

    expect(resolveRatingFeature("?page=2", storage)).toBe(true);
  });

  it("disables and clears the experiment with ?rating=0", () => {
    const storage = memoryStorage({ [RATING_FEATURE_STORAGE_KEY]: "1" });

    expect(resolveRatingFeature("?rating=0", storage)).toBe(false);
    expect(storage.getItem(RATING_FEATURE_STORAGE_KEY)).toBeNull();
  });

  it("stays disabled without a flag", () => {
    expect(resolveRatingFeature("", memoryStorage())).toBe(false);
  });
});
