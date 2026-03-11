// src/components/dashboard/__tests__/TaskComposer.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskComposer } from "../TaskComposer";

describe("TaskComposer", () => {
  it("permite digitar tarefa e clicar em adicionar", async () => {
    const user = userEvent.setup();
    const onCreateMock = jest.fn().mockResolvedValue(undefined);

    render(<TaskComposer onCreate={onCreateMock} />);

    const input = screen.getByPlaceholderText(/nova tarefa/i);
    await user.type(input, "Nova tarefa");

    const addButton = screen.getByRole("button", { name: /adicionar/i });
    await user.click(addButton);

    expect(onCreateMock).toHaveBeenCalledWith("Nova tarefa");
  });

  it("mostra erro quando input vazio", async () => {
    const user = userEvent.setup();
    render(<TaskComposer onCreate={jest.fn()} />);

    const addButton = screen.getByRole("button", { name: /adicionar/i });
    await user.click(addButton);

    expect(screen.getByText(/digite um título/i)).toBeInTheDocument();
  });
});