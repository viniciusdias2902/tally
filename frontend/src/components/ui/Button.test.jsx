import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";
import { vi } from "vitest";

describe("Button", () => {
    test("renderiza o texto corretamente", () => {
        render(<Button>Salvar</Button>);
        expect(screen.getByRole("button")).toHaveTextContent("Salvar");
    });

    test("dispara função ao ser clicado", async () => {
        const user = userEvent.setup();
        const onClickMock = vi.fn();

        render(<Button onClick={onClickMock}>Salvar</Button>);

        await user.click(screen.getByText("Salvar"));

        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    test("fica desabilitado quando prop disabled está true", async () => {
        const user = userEvent.setup();
        const onClickMock = vi.fn();

        render(<Button onClick={onClickMock} disabled>Salvar</Button>);

        await user.click(screen.getByText("Salvar"));

        expect(onClickMock).not.toHaveBeenCalled();
        expect(screen.getByRole("button")).toBeDisabled();
    });

    test("aplica variante primary por padrão", () => {
        render(<Button>Primary</Button>);
        const button = screen.getByRole("button");
        expect(button.className).toContain("bg-button-primary-bg");
    });
});