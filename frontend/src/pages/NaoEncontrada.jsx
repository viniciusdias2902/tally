import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function NaoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <div className="text-center">
        <p className="text-7xl font-bold font-mono text-accent/30">404</p>
        <h1 className="mt-4 text-xl font-semibold text-text-primary">
          Pagina nao encontrada
        </h1>
        <p className="mt-2 text-sm text-text-secondary max-w-xs mx-auto">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <Link to="/" className="inline-block mt-8">
          <Button variant="secondary" size="lg">Voltar ao inicio</Button>
        </Link>
      </div>
    </div>
  );
}
