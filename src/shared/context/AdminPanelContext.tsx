import { createContext, useContext } from 'react';
import { useData } from '../../renderer/hooks';
import { AppData } from '../types';

interface AdminPanelContextType {
  data: AppData | null;
  updateData: (newData: Partial<AppData>) => void;
  addImageToDelete: (img: string) => void;
  removeImageToDelete: (img: string) => void;
}

const AdminPanelContext = createContext<AdminPanelContextType | undefined>(undefined);

export const AdminPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, setData } = useData();

  const updateData = (newData: Partial<AppData>) => {
    if (!data) return;
    setData({ ...data, ...newData });
  };

  const addImageToDelete = (img: string) => {
    if (!data) return;
    setData({
      ...data,
      imagesToDelete: [...(data.imagesToDelete || []), img]
    });
  };

  const removeImageToDelete = (img: string) => {
    if (!data) return;
    setData({
      ...data,
      imagesToDelete: data.imagesToDelete?.filter(i => i !== img) || []
    });
  };

  return (
    <AdminPanelContext.Provider value={{ data, updateData, addImageToDelete, removeImageToDelete }}>
      {children}
    </AdminPanelContext.Provider>
  );
};

export const useAdminPanel = () => {
  const ctx = useContext(AdminPanelContext);
  if (!ctx) throw new Error("useAdminPanel must be used within AdminPanelProvider");
  return ctx;
};
