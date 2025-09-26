
export interface LogoData {
  image: string; // Nombre del archivo de imagen del logo
  temporalImage?: string;
  position: "derecha" | "centro" | "izquierda"; // Posición del logo en pantalla
}

export interface ButtonData {
  order: number; // Orden de aparición
  icon: string; // Nombre del archivo de icono
  title: string; // Título del botón
  videos: string[]; // Opcional, array de nombres de videos asociados
  temporalImage?: string;
}

export interface AppData {
  welcomeVideos: string[]; // Opcional, array de nombres de videos
  logo: LogoData;
  buttons: ButtonData[];
  imagesToDelete?: string[];
  videosParaEliminar?: string[];
}
