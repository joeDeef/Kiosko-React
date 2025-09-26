declare global {
  interface ElectronAPI {
    loadData: () => Promise<any>;
    isLicenseValid: () => Promise<boolean>;
  }
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
