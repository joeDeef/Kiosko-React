declare global {
  interface ElectronAPI {
    loadData: () => Promise<any>;
    isLicenseValid: () => Promise<boolean>;
    saveTempImage: (buffer: ArrayBuffer, ext: string, preNombre: string) => Promise<string | null>;
    removeTempFile: (fileName: string) => Promise<boolean>;
    openFileDialog: () => Promise<string[]>;
    saveTempVideo: (filePath: string, ext: string, preNombre: string) => Promise<string | null>;

  }

  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
