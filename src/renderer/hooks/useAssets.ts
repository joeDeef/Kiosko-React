// hooks/useAssets.ts
import { useState, useEffect } from 'react';
import sampleData from '../../../data/content_ui.json';
import { AppData } from '../../shared/types';

interface PathsInfo {
  assetsPath: string;
}

export const useAssets = () => {
  const [appData, setAppData] = useState<AppData | null>(sampleData as AppData);
  const [assetsPath, setAssetsPath] = useState<string>('app-assets://');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        let paths: PathsInfo;
        if (window.electronAPI?.getPathsInfo) {
          paths = await window.electronAPI.getPathsInfo();
        } else {
          paths = { assetsPath: 'app-assets://' }; // fallback para web/dev
        }
        setAssetsPath(paths.assetsPath);
      } catch (err) {
        console.error('Error cargando assets:', err);
        setError('No se pudieron cargar los recursos');
        setAppData(null);
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

  return { appData, assetsPath, loading, error, getAssetPath };
};
