import { Outlet } from "react-router-dom";
import Topbar from "./Topbar.jsx";

export default function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-primary">
      <Topbar />

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
