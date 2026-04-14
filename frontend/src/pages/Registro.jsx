import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

export default function Registro() {
  const { registrar, autenticado, carregando } = useAuth();
  const [nome, setNome] = useState("");
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
      await registrar({ nome, email, senha });
    } catch (err) {
      setErro(
        err.message === "EMAIL_JA_EXISTE"
          ? "Este e-mail ja esta cadastrado."
          : "Erro ao criar conta. Tente novamente.",
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
            Crie sua conta para comecar
          </p>
        </div>

        <div className="bg-bg-elevated rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="nome"
              label="Nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="name"
              maxLength={100}
            />

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
              placeholder="Minimo 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
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
              {enviando ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Ja tem conta?{" "}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
