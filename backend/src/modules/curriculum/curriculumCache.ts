import { logger } from "../../utils/logger.js";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class InProcessCurriculumCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 60 * 60 * 1000) { // 1 hour default TTL
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs = this.defaultTtlMs): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(keyPrefix: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    logger.info({ keyPrefix, invalidatedEntries: count }, "Curriculum cache invalidated");
  }

  invalidateAll(): void {
    const count = this.cache.size;
    this.cache.clear();
    logger.info({ invalidatedEntries: count }, "Curriculum cache cleared entirely");
  }

  get size(): number {
    return this.cache.size;
  }
}

export const curriculumCache = new InProcessCurriculumCache();
