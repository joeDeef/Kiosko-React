import { useAssets } from './useAssets';

export const useAssetPath = () => {
  const { getAssetPath, getTemporalPath } = useAssets();

  const img = (filename: string) => getAssetPath('img', filename);
  const video = (filename: string) => getAssetPath('videos', filename);
  const temp = (filename: string) => getTemporalPath(filename);

  return { img, video, temp };
};
