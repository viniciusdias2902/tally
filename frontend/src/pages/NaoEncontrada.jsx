import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function NaoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="text-center">
        <p className="text-6xl font-bold font-mono text-accent">404</p>
        <h1 className="mt-4 text-xl font-semibold text-text-primary">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          A página que você procura não existe ou foi movida.
        </p>
        <Link to="/" className="inline-block mt-6">
          <Button variant="secondary">Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}
