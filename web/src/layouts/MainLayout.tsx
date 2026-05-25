import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import ErrorBanner from "../components/ErrorBanner";
import Modal from "../components/Modal";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { API_BASE_URL } from "../constants/api";
import { AppUiProvider, useAppUi } from "../context/AppUiContext";

function MainLayoutContent() {
  const { modal, closeModal, toasts, removeToast } = useAppUi();
  const [errorBannerMsg, setErrorBannerMsg] = useState<string | null>(null);

  const sendBrowserLog = useCallback(async (msg: string, stack: string) => {
    try {
      await fetch(`${API_BASE_URL}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: "web-frontend",
          environment: "production",
          level: "ERROR",
          message: msg,
          stackTrace: stack,
        }),
      });
    } catch (e) {
      console.error("Erro ao enviar log automático:", e);
    }
  }, []);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || "Erro desconhecido";
      const stack = event.error ? event.error.stack : "N/A";

      sendBrowserLog(msg, stack);
      setErrorBannerMsg(
        `Capturado globalmente: "${msg}" (Log enviado com sucesso!)`,
      );

      setTimeout(() => setErrorBannerMsg(null), 8000);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
        ? String(event.reason)
        : "Promise rejeitada sem motivo";
      const stack =
        event.reason && event.reason.stack ? event.reason.stack : "N/A";

      sendBrowserLog(`Unhandled Rejection: ${reason}`, stack);
      setErrorBannerMsg(
        `Capturado globalmente: Promise rejeitada - "${reason}" (Log enviado!)`,
      );

      setTimeout(() => setErrorBannerMsg(null), 8000);
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, [sendBrowserLog]);

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        {errorBannerMsg && (
          <ErrorBanner
            message={errorBannerMsg}
            onClose={() => setErrorBannerMsg(null)}
          />
        )}

        <Outlet />
      </div>

      {modal.isOpen ? (
        <Modal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          confirmText={modal.type === "confirm" ? "Sim, excluir" : "Confirmar"}
          cancelText={modal.type === "confirm" ? "Cancelar" : "OK"}
        />
      ) : null}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function MainLayout() {
  return (
    <AppUiProvider>
      <MainLayoutContent />
    </AppUiProvider>
  );
}
