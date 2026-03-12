// src/components/dashboard/__tests__/TaskList.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "../TaskList";

const tasks = [
  { id: "1", title: "Tarefa 1", completed: false, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "2", title: "Tarefa 2", completed: true, createdAt: Date.now(), updatedAt: Date.now() },
];

describe("TaskList", () => {
  it("renderiza lista de tarefas", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const onDelete = jest.fn();

    render(<TaskList tasks={tasks} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText(/tarefa 1/i)).toBeInTheDocument();
    expect(screen.getByText(/tarefa 2/i)).toBeInTheDocument();

    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("1", true);

    const deleteButton = screen.getAllByRole("button", { name: /deletar/i })[0];
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("mostra mensagem quando lista vazia", () => {
    render(<TaskList tasks={[]} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/nenhuma tarefa cadastrada/i)).toBeInTheDocument();
  });
});