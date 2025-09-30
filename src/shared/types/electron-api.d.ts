declare global {
  interface ElectronAPI {
    loadData: () => Promise<any>;
    isLicenseValid: () => Promise<boolean>;
    saveTempImage: (buffer: ArrayBuffer, ext: string) => Promise<string | null>;
    removeTempFile: (fileName: string) => Promise<boolean>;
  }

  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
