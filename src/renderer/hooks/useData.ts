import { useEffect, useState } from "react";
import { AppData } from "../../shared/types";
// El tipado global de electronAPI ya está disponible por electron-api.d.ts

export function useData() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    window.electronAPI.loadData()
      .then(setData)
      .catch((err) => {
        console.error("Error cargando datos:", err);
      });
  }, []);

  return { data, setData };
}
