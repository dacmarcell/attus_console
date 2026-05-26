import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { AppUiProvider, useAppUi } from "../context/AppUiContext";

interface Options extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  routerProps?: MemoryRouterProps;
}

// eslint-disable-next-line react-refresh/only-export-components
function TestUiShell({ children }: { children: ReactNode }) {
  const { modal, closeModal, toasts, removeToast } = useAppUi();

  return (
    <>
      {children}
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
    </>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", routerProps, ...options }: Options = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppUiProvider>
        <MemoryRouter initialEntries={[route]} {...routerProps}>
          <TestUiShell>{children}</TestUiShell>
        </MemoryRouter>
      </AppUiProvider>
    ),
    ...options,
  });
}
