const IDB_NAME = 'got_agent_media_vault_v1';
const IDB_STORE = 'uploaded_images';

function openImageDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveImageToPersistentVault(
  messageId: string,
  attachedImageUrl: string,
  attachedImageName = ''
): Promise<void> {
  if (!messageId || !attachedImageUrl) return;
  try {
    const db = await openImageDb();
    if (!db) return;
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({
      id: messageId,
      attachedImageUrl,
      attachedImageName,
      savedAt: Date.now(),
    });
  } catch {
    // Ignore IDB errors
  }
}

export async function getAllSavedImagesFromVault(): Promise<
  Record<string, { attachedImageUrl: string; attachedImageName?: string }>
> {
  const result: Record<
    string,
    { attachedImageUrl: string; attachedImageName?: string }
  > = {};
  try {
    const db = await openImageDb();
    if (!db) return result;
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = Array.isArray(req.result) ? req.result : [];
        for (const r of rows) {
          if (r?.id && r?.attachedImageUrl) {
            result[r.id] = {
              attachedImageUrl: r.attachedImageUrl,
              attachedImageName: r.attachedImageName,
            };
          }
        }
        resolve(result);
      };
      req.onerror = () => resolve(result);
    });
  } catch {
    return result;
  }
}
