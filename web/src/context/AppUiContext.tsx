import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { ModalState, ModalType } from "../types/app";
import type { ToastData } from "../components/Toast";

interface AppUiContextValue {
  toasts: ToastData[];
  addToast: (type: ToastData["type"], message: string) => void;
  removeToast: (id: string) => void;
  modal: ModalState;
  showModal: (
    type: ModalType,
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => void;
  closeModal: () => void;
}

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function AppUiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const addToast = useCallback((type: ToastData["type"], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showModal = useCallback(
    (
      type: ModalType,
      title: string,
      message: string,
      onConfirm?: () => void,
    ) => {
      setModal({ isOpen: true, type, title, message, onConfirm });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false, onConfirm: undefined }));
  }, []);

  return (
    <AppUiContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        modal,
        showModal,
        closeModal,
      }}
    >
      {children}
    </AppUiContext.Provider>
  );
}

export function useAppUi() {
  const context = useContext(AppUiContext);
  if (!context) {
    throw new Error("useAppUi deve ser usado dentro de AppUiProvider");
  }
  return context;
}
