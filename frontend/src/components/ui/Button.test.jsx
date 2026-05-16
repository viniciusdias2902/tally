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
});