import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

export default function Login() {
  const { entrar, autenticado, carregando } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (carregando) return null;
  if (autenticado) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await entrar({ email, senha });
    } catch (err) {
      setErro(
        err.message === "CREDENCIAIS_INVALIDAS"
          ? "E-mail ou senha incorretos."
          : "Erro ao fazer login. Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-bg-primary via-bg-primary to-accent/5 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            <span className="text-accent">||||</span> Tally
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Entre na sua conta para continuar
          </p>
        </div>

        <div className="bg-bg-elevated rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="senha"
              label="Senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
            />

            {erro && (
              <p className="text-sm text-danger text-center">{erro}</p>
            )}

            <Button
              type="submit"
              disabled={enviando}
              className="w-full"
              size="lg"
            >
              {enviando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Ainda no tem conta?{" "}
          <Link to="/registro" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
