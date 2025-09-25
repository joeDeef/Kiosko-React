// electron.d.ts
interface ElectronAPI {
  // Assets y datos
  getAppData: () => Promise<{
    buttons: {
      id?: string;
      folder?: string;
      title: string;
      icon: string;
      videos?: string[];
      order?: number;
    }[];
    welcomeVideos: string[];
    logo: {
      image: string;
      position: 'left' | 'center' | 'right';
    };
  }>;
  
  getPathsInfo: () => Promise<{
    assetsPath: string;
  }>;
  
  getAssetPath: (type: string, filename: string) => Promise<string>;
  
  // Navegación
  openInformation: (videos?: string[], logo?: any) => void;
  openAdminPin: () => void;
  loadingTimeFinished: () => void;
  
  // Control de video
  onRestartWelcomeVideo: (callback: () => void) => void;
  onMuteHomeVideo: (callback: () => void) => void;
  onUnmuteHomeVideo: (callback: () => void) => void;
  
  // Control de timers
  onPauseTimer: (callback: () => void) => void;
  onResumeTimer: (callback: () => void) => void;
  
  // Admin PIN
  onAdminPinResult: (callback: (result: {
    success: boolean;
    cancelled: boolean;
  }) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};