// Promise-based IndexedDB Wrapper for v-screen-recorder
const DB_NAME = 'v-screen-recorder-db';
const DB_VERSION = 1;
const METADATA_STORE = 'metadata';
const BLOB_STORE = 'blobs';

/**
 * Initializes and opens the IndexedDB database.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store 1: Lightweight metadata for fast querying, filtering, and pagination
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        const metaStore = db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
        metaStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store 2: Heavy video blobs, loaded on-demand
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error('Failed to open database: ' + event.target.error?.message));
    };
  });
}

/**
 * Saves a new recording (metadata + blob) into IndexedDB.
 * @param {Object} recording
 * @param {Blob} recording.blob - The recorded video file blob
 * @param {string} recording.title - Custom recording title
 * @param {string} recording.mode - 'screen' or 'camera'
 * @param {number} recording.duration - Duration in seconds
 * @returns {Promise<string>} The generated recording ID
 */
export async function saveRecording({ blob, title, mode, duration }) {
  const db = await openDB();
  const id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const timestamp = Date.now();

  const metadata = {
    id,
    title: title || `Recording ${new Date().toLocaleString()}`,
    mode,
    duration,
    timestamp
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE, BLOB_STORE], 'readwrite');
    const metaStore = transaction.objectStore(METADATA_STORE);
    const blobStore = transaction.objectStore(BLOB_STORE);

    metaStore.add(metadata);
    blobStore.add({ id, blob });

    transaction.oncomplete = () => {
      resolve(id);
    };

    transaction.onerror = (event) => {
      reject(new Error('Failed to save recording: ' + transaction.error?.message));
    };
  });
}

/**
 * Retrieves the paginated and filtered list of recording metadata.
 * Does NOT load heavy video blobs into memory.
 * @param {Object} filters
 * @param {number} filters.page - 1-indexed page number
 * @param {number} filters.pageSize - Number of items per page
 * @param {string} [filters.startDate] - ISO Date string (YYYY-MM-DD)
 * @param {string} [filters.endDate] - ISO Date string (YYYY-MM-DD)
 * @param {string} [filters.searchQuery] - Title search string
 * @returns {Promise<{ items: Array, total: number }>}
 */
export async function getRecordingsList({ page = 1, pageSize = 5, startDate = '', endDate = '', searchQuery = '' }) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], 'readonly');
    const store = transaction.objectStore(METADATA_STORE);
    const index = store.index('timestamp');
    const allMetadata = [];

    // Fetch all metadata sorted by timestamp descending
    const request = index.openCursor(null, 'prev');

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        allMetadata.push(cursor.value);
        cursor.continue();
      } else {
        // Apply Filters in memory for simple search/dates
        let filtered = allMetadata;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(item => item.title.toLowerCase().includes(query));
        }

        if (startDate) {
          const startMs = new Date(startDate + 'T00:00:00').getTime();
          filtered = filtered.filter(item => item.timestamp >= startMs);
        }

        if (endDate) {
          const endMs = new Date(endDate + 'T23:59:59').getTime();
          filtered = filtered.filter(item => item.timestamp <= endMs);
        }

        const total = filtered.length;

        // Paginate
        const startIndex = (page - 1) * pageSize;
        const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

        resolve({
          items: paginatedItems,
          total
        });
      }
    };

    request.onerror = (event) => {
      reject(new Error('Failed to query database: ' + request.error?.message));
    };
  });
}

/**
 * Retrieves the heavy video Blob for a specific recording ID.
 * @param {string} id - Recording ID
 * @returns {Promise<Blob>} The video Blob
 */
export async function getRecordingBlob(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([BLOB_STORE], 'readonly');
    const store = transaction.objectStore(BLOB_STORE);
    const request = store.get(id);

    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result && result.blob) {
        resolve(result.blob);
      } else {
        reject(new Error(`Recording blob with ID ${id} not found.`));
      }
    };

    request.onerror = (event) => {
      reject(new Error('Failed to retrieve recording blob: ' + request.error?.message));
    };
  });
}

/**
 * Deletes a recording (both metadata and blob) by ID.
 * @param {string} id - Recording ID
 * @returns {Promise<void>}
 */
export async function deleteRecording(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE, BLOB_STORE], 'readwrite');
    const metaStore = transaction.objectStore(METADATA_STORE);
    const blobStore = transaction.objectStore(BLOB_STORE);

    metaStore.delete(id);
    blobStore.delete(id);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = (event) => {
      reject(new Error('Failed to delete recording: ' + transaction.error?.message));
    };
  });
}

/**
 * Updates a recording's title.
 * @param {string} id - Recording ID
 * @param {string} newTitle - The updated title
 * @returns {Promise<void>}
 */
export async function updateRecordingTitle(id, newTitle) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], 'readwrite');
    const store = transaction.objectStore(METADATA_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = (event) => {
      const data = event.target.result;
      if (data) {
        data.title = newTitle;
        const updateRequest = store.put(data);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error('Failed to update title.'));
      } else {
        reject(new Error(`Recording not found.`));
      }
    };

    getRequest.onerror = () => {
      reject(new Error('Failed to retrieve metadata for update.'));
    };
  });
}
