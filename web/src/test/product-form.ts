import { fireEvent, screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

export async function openCreateProductModal(user: UserEvent) {
  await user.click(screen.getByRole("button", { name: /Cadastrar Produto/i }));
}

export function getProductModalForm(): HTMLFormElement {
  const cancelButton = screen.getByRole("button", { name: /^Cancelar$/i });
  const form = cancelButton.closest("form");
  if (!form) {
    throw new Error("Formulário do modal de produto não encontrado");
  }
  return form;
}

export function submitProductModalForm() {
  fireEvent.submit(getProductModalForm());
}
