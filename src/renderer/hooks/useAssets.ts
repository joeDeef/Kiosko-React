// hooks/useAssets.ts
import { useState, useEffect } from 'react';

interface PathsInfo {
  assetsPath: string;
}

export const useAssets = () => {
  const [assetsPath, setAssetsPath] = useState<string>('app-assets://');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        let paths: PathsInfo = { assetsPath: 'app-assets://' };
        setAssetsPath(paths.assetsPath);
      } catch (err) {
        setError('No se pudieron cargar los recursos');
        setAssetsPath('app-assets://');
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  const getAssetPath = (type: 'img' | 'videos', filename: string) => {
    if (!filename) return '';
    if (filename.startsWith('data:') || filename.startsWith('http')) return filename;
    return `${assetsPath}/${type}/${filename}`;
  };

  return { assetsPath, loading, error, getAssetPath };
};
