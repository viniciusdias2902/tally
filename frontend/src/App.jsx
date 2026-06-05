import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { OnboardingProvider } from "./onboarding/OnboardingContext.jsx";
import { TourSessaoProvider } from "./onboarding/TourSessaoContext.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DashboardPasta from "./pages/DashboardPasta.jsx";
import DashboardAtividade from "./pages/DashboardAtividade.jsx";
import Atividades from "./pages/Atividades.jsx";
import Categorias from "./pages/Categorias.jsx";
import RegistrarSessao from "./pages/RegistrarSessao.jsx";
import Sessoes from "./pages/Sessoes.jsx";
import Tutoriais from "./pages/Tutoriais.jsx";
import NaoEncontrada from "./pages/NaoEncontrada.jsx";

function HomeGate() {
  const { autenticado, carregando } = useAuth();
  if (carregando) return null;
  if (autenticado) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter basename="/tally/app">
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <TourSessaoProvider>
              <Routes>
                <Route path="/" element={<HomeGate />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/pastas/:pastaId/dashboard"
                    element={<DashboardPasta />}
                  />
                  <Route path="/atividades" element={<Atividades />} />
                  <Route
                    path="/atividades/:atividadeId/categorias"
                    element={<Categorias />}
                  />
                  <Route
                    path="/atividades/:atividadeId/registrar"
                    element={<RegistrarSessao />}
                  />
                  <Route
                    path="/atividades/:atividadeId/sessoes"
                    element={<Sessoes />}
                  />
                  <Route
                    path="/atividades/:atividadeId/dashboard"
                    element={<DashboardAtividade />}
                  />
                  <Route path="/tutoriais" element={<Tutoriais />} />
                </Route>

                <Route path="*" element={<NaoEncontrada />} />
              </Routes>
            </TourSessaoProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
