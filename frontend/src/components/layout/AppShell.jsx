import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function AppShell() {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        aberto={sidebarAberta}
        onFechar={() => setSidebarAberta(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onAbrirMenu={() => setSidebarAberta(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
