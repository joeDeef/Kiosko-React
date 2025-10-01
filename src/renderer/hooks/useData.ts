import { useEffect, useState } from "react";
import { AppData } from "../../shared/types";

export function useData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    window.electronAPI.loadData()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        console.error("Error cargando datos:", err);
        setError("Error cargando datos");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { data, setData, loading, error };
}
