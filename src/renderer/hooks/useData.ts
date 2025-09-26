import { useEffect, useState } from "react";
import { AppData } from "../../shared/types";

declare global {
  interface Window {
    electronAPI: {
      loadData: () => Promise<AppData>;
    };
  }
}

export function useData() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        let loadedData: AppData;
        loadedData = await window.electronAPI.loadData();
        setData(loadedData);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    }

    load();
  }, []);

  return { data, setData };
}
