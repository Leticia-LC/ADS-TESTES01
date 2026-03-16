import { render, screen } from "@testing-library/react";
import Link from "next/link";

// Mock do Next.js Link
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ children, href, className }: any) => (
      <a href={href} className={className} data-testid={`link-${href.replace("/", "")}`}>
        {children}
      </a>
    ),
  };
});

describe("Home Page", () => {
  it("renderiza corretamente todos os elementos", () => {
    render(<Home />);

    // Verificar título principal
    expect(screen.getByText("AuthTask Manager")).toBeInTheDocument();

    // Verificar texto do eyebrow
    expect(screen.getByText("TRABALHO 01")).toBeInTheDocument();

    // Verificar descrição
    expect(screen.getByText(
      "Base funcional da aplicação para o trabalho de testes unitários com Jest + React Testing Library."
    )).toBeInTheDocument();

    // Verificar links
    const loginLink = screen.getByTestId("link-login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveTextContent("Entrar no sistema");
    expect(loginLink).toHaveAttribute("href", "/login");

    const dashboardLink = screen.getByTestId("link-dashboard");
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveTextContent("Ir para dashboard");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(dashboardLink).toHaveClass("ghost");

    // Verificar estrutura do DOM
    const main = screen.getByRole("main");
    expect(main).toHaveClass("page-shell");

    const actionsDiv = screen.getByText("Entrar no sistema").closest("div");
    expect(actionsDiv).toHaveClass("actions");
  });

  it("tem a estrutura correta do DOM", () => {
    const { container } = render(<Home />);

    // Verificar hierarquia
    expect(container.querySelector("main.page-shell")).toBeInTheDocument();
    expect(container.querySelector("section.hero")).toBeInTheDocument();
    expect(container.querySelector("p.eyebrow")).toBeInTheDocument();
    expect(container.querySelector("h1")).toBeInTheDocument();
    expect(container.querySelector("div.actions")).toBeInTheDocument();
  });
});

// Importar o componente após os mocks
import Home from "../page";