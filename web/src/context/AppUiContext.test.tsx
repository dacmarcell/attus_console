import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppUiProvider, useAppUi } from "./AppUiContext";

describe("AppUiContext", () => {
  it("abre modal com título e mensagem", () => {
    const { result } = renderHook(() => useAppUi(), {
      wrapper: AppUiProvider,
    });

    act(() => {
      result.current.showModal("success", "Sucesso", "Operação concluída");
    });

    expect(result.current.modal.isOpen).toBe(true);
    expect(result.current.modal.title).toBe("Sucesso");
    expect(result.current.modal.message).toBe("Operação concluída");
  });

  it("fecha modal e limpa callback de confirmação", () => {
    const { result } = renderHook(() => useAppUi(), {
      wrapper: AppUiProvider,
    });

    act(() => {
      result.current.showModal(
        "confirm",
        "Confirmar",
        "Deseja excluir?",
        () => {},
      );
      result.current.closeModal();
    });

    expect(result.current.modal.isOpen).toBe(false);
    expect(result.current.modal.onConfirm).toBeUndefined();
  });

  it("adiciona e remove toast", () => {
    const { result } = renderHook(() => useAppUi(), {
      wrapper: AppUiProvider,
    });

    act(() => {
      result.current.addToast("warning", "Campo obrigatório");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Campo obrigatório");

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("lança erro fora do provider", () => {
    expect(() => renderHook(() => useAppUi())).toThrow(
      "useAppUi deve ser usado dentro de AppUiProvider",
    );
  });
});
