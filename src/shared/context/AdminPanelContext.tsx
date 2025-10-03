import { createContext, useContext } from 'react';
import { useData } from '../../renderer/hooks';
import { AppData } from '../types';
import { produce } from "immer";

interface AdminPanelContextType {
  data: AppData | null;
  updateData: (callback: (draft: AppData) => void) => void;
  addImageToDelete?: (img: string) => void;
  removeImageToDelete?: (img: string) => void;
}

const AdminPanelContext = createContext<AdminPanelContextType | undefined>(undefined);

export const AdminPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, setData } = useData();

  const updateData = (callback: (draft: AppData) => void) => {
    if (!data) return;
    setData(prev =>
      produce(prev!, (draft: AppData) => {
        callback(draft);
      })
    );
  };

  const addImageToDelete = (img: string) => {
    if (!data) return;
    updateData(draft => {
      if (!draft.imagesToDelete) draft.imagesToDelete = [];
      if (img && !draft.imagesToDelete.includes(img)) draft.imagesToDelete.push(img);
    });
  };

  const removeImageToDelete = (img: string) => {
    if (!data) return;
    updateData(draft => {
      if (draft.imagesToDelete) {
        draft.imagesToDelete = draft.imagesToDelete.filter(i => i !== img);
      }
    });
  };

  // **Aquí está la clave: devolver el Provider**
  return (
    <AdminPanelContext.Provider
      value={{ data, updateData, addImageToDelete, removeImageToDelete }}
    >
      {children}
    </AdminPanelContext.Provider>
  );
};

export const useAdminPanel = () => {
  const ctx = useContext(AdminPanelContext);
  if (!ctx) throw new Error("useAdminPanel must be used within AdminPanelProvider");
  return ctx;
};