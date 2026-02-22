// IndexedDB offline cache for Fictionry chapters
// Database: 'fictionry-offline', Store: 'chapters'
// No external dependencies — raw IndexedDB API

export interface CachedChapter {
  storyId: string;
  chapterId: string;
  storyTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  authorName: string;
  content: string | object;
  wordCount: number;
  cachedAt: string;
  prevChapterId?: string;
  nextChapterId?: string;
}

export interface CachedChapterSummary {
  storyId: string;
  chapterId: string;
  storyTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  authorName: string;
  wordCount: number;
  cachedAt: string;
}

const DB_NAME = 'fictionry-offline';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';

function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined' && window.indexedDB !== null;
  } catch {
    return false;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function makeKey(storyId: string, chapterId: string): string {
  return `${storyId}/${chapterId}`;
}

export async function cacheChapter(data: CachedChapter): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const key = makeKey(data.storyId, data.chapterId);

    return new Promise((resolve, reject) => {
      const request = store.put(data, key);
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('Failed to cache chapter:', error);
  }
}

export async function getCachedChapter(storyId: string, chapterId: string): Promise<CachedChapter | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const key = makeKey(storyId, chapterId);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        db.close();
        resolve(request.result ?? null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('Failed to get cached chapter:', error);
    return null;
  }
}

export async function getCachedChaptersList(): Promise<CachedChapterSummary[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        db.close();
        const chapters: CachedChapter[] = request.result ?? [];
        const summaries: CachedChapterSummary[] = chapters.map((ch) => ({
          storyId: ch.storyId,
          chapterId: ch.chapterId,
          storyTitle: ch.storyTitle,
          chapterTitle: ch.chapterTitle,
          chapterNumber: ch.chapterNumber,
          authorName: ch.authorName,
          wordCount: ch.wordCount,
          cachedAt: ch.cachedAt,
        }));
        resolve(summaries);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('Failed to get cached chapters list:', error);
    return [];
  }
}

export async function clearOldCache(maxAgeDays: number = 30): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    const cursorRequest = store.openCursor();

    return new Promise((resolve, reject) => {
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const chapter = cursor.value as CachedChapter;
          if (chapter.cachedAt && new Date(chapter.cachedAt).getTime() < cutoff) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          db.close();
          resolve();
        }
      };
      cursorRequest.onerror = () => {
        db.close();
        reject(cursorRequest.error);
      };
    });
  } catch (error) {
    console.warn('Failed to clear old cache:', error);
  }
}

export async function getCacheSize(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('Failed to get cache size:', error);
    return 0;
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}
