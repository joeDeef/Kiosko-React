export const useAssets = () => {

  const getAssetPath = (type: 'img' | 'videos', filename: string) => {
    if (!filename) return '';
    if (filename.startsWith('data:') || filename.startsWith('http')) return filename;
    return `app-assets:///${type}/${filename}`;
  };

  const getTemporalPath = (filename: string) => {
    if (!filename) return '';
    if (filename.startsWith('data:') || filename.startsWith('http')) return filename;
    return `app-temp:///${filename}`;
  };

  return { getAssetPath, getTemporalPath };
};
