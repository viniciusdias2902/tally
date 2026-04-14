import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Spinner from "../ui/Spinner.jsx";

export default function ProtectedRoute({ children }) {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
