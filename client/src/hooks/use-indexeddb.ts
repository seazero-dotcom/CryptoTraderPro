import { useEffect, useState } from "react";
import { indexedDB } from "@/lib/indexeddb";

export function useIndexedDB() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    indexedDB.init().then(() => {
      setIsReady(true);
    }).catch((error) => {
      console.error("Failed to initialize IndexedDB:", error);
    });
  }, []);

  const saveCredentials = async (userId: number, apiKey: string, apiSecret: string, isTestnet = false) => {
    await indexedDB.saveCredentials(userId, apiKey, apiSecret, isTestnet);
  };

  const getCredentials = async (userId: number) => {
    return await indexedDB.getCredentials(userId);
  };

  const deleteCredentials = async (userId: number) => {
    await indexedDB.deleteCredentials(userId);
  };

  return {
    isReady,
    saveCredentials,
    getCredentials,
    deleteCredentials,
  };
}
