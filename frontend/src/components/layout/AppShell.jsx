import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell() {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [colapsada, setColapsada] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar
        aberto={sidebarAberta}
        colapsada={colapsada}
        onFechar={() => setSidebarAberta(false)}
        onColapsar={() => setColapsada((prev) => !prev)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onAbrirMenu={() => setSidebarAberta(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
