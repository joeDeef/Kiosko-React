export interface AppData {
  welcomeVideos?: string[]; // Opcional, array de nombres de videos
  logo: {
    image: string;                 // Nombre del archivo de imagen del logo
    position: "derecha" | "centro" | "izquierda"; // Posición del logo en pantalla
  };
  buttons: {
    order: number;       // Orden de aparición
    icon: string;        // Nombre del archivo de icono
    title: string;       // Título del botón
    videos?: string[];   // Opcional, array de nombres de videos asociados
  }[];
}
