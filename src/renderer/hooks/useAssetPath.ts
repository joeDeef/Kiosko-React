export const useAssetPath = () => {

  const img = (filename: string) => {
    return `app-assets:///img/${filename}`;
  };
  const video = (filename: string) => {
    return `http://localhost:3001/videos/${encodeURIComponent(filename)}`
  };
  const temp = (filename: string) => {
    return `app-temp:///${filename}`;

  };
  const tempVideo = (filename: string) => {
    return `http://localhost:3001/temp/${encodeURIComponent(filename)}`
  }

  return { img, video, temp, tempVideo };
};
