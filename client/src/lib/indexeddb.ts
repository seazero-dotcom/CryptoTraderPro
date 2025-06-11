interface DBSchema {
  credentials: {
    id: number;
    userId: number;
    apiKey: string;
    apiSecret: string;
    isTestnet: boolean;
    createdAt: Date;
  };
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = "binance-trader";
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create credentials store
        if (!db.objectStoreNames.contains("credentials")) {
          const store = db.createObjectStore("credentials", { keyPath: "id", autoIncrement: true });
          store.createIndex("userId", "userId", { unique: false });
        }
      };
    });
  }

  async saveCredentials(userId: number, apiKey: string, apiSecret: string, isTestnet = false): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["credentials"], "readwrite");
      const store = transaction.objectStore("credentials");

      const credentials = {
        userId,
        apiKey,
        apiSecret,
        isTestnet,
        createdAt: new Date(),
      };

      const request = store.put(credentials);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCredentials(userId: number): Promise<DBSchema["credentials"] | null> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["credentials"], "readonly");
      const store = transaction.objectStore("credentials");
      const index = store.index("userId");

      const request = index.get(userId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCredentials(userId: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["credentials"], "readwrite");
      const store = transaction.objectStore("credentials");
      const index = store.index("userId");

      const request = index.getKey(userId);
      request.onsuccess = () => {
        if (request.result) {
          const deleteRequest = store.delete(request.result);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDB = new IndexedDBManager();
