import { useState, useEffect, useCallback } from 'react';
import { getOfflineVideos, removeVideoOffline, OfflineVideo } from '../lib/offlineStorage';

export function useOfflineStorage() {
  const [downloads, setDownloads] = useState<OfflineVideo[]>([]);
  const [totalSize, setTotalSize] = useState<string>('Calcul...');

  const loadDownloads = useCallback(async () => {
    setDownloads(getOfflineVideos());
    
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const estimate = await navigator.storage.estimate();
            if (estimate.usage) {
               const mb = (estimate.usage / (1024 * 1024)).toFixed(1);
               setTotalSize(`~${mb} MB`);
            } else {
               setTotalSize('0 MB');
            }
        } catch (e) {
            setTotalSize('Inconnu');
        }
    } else {
        setTotalSize('Inconnu');
    }
  }, []);

  const removeDownload = async (videoId: string) => {
    await removeVideoOffline(videoId);
    await loadDownloads();
  };

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  return { downloads, totalSize, removeDownload, refresh: loadDownloads };
}
