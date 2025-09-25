// hooks/useAssetPath.ts
import { useAssets } from './useAssets';

export const useAssetPath = () => {
  const { getAssetPath } = useAssets();

  const img = (filename: string) => getAssetPath('img', filename);
  const video = (filename: string) => getAssetPath('videos', filename);

  return { img, video };
};
