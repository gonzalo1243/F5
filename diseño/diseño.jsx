import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  Home,
  Star, // Agregado para un posible ícono de estado más dinámico
  SunDim, // Un ícono para indicar algún estado
  Cloud
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Constantes para los nombres de las rutas.
// Esto evita errores de escritura y facilita el refactoring.
const ROUTES = {
  DASHBOARD: "Dashboard",
  PLAYERS: "Players",
  BOOKINGS: "Bookings",
  REPORTS: "Reports",
  SETTINGS: "Settings", // Agregado para un futuro item de navegación
};

// Objeto de configuración para los ítems de navegación.
// Esto hace que sea más fácil de leer y modificar.
const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl(ROUTES.DASHBOARD),
    icon: Home,
  },
  {
    title: "Jugadores",
    url: createPageUrl(ROUTES.PLAYERS),
    icon: Users,
  },
  {
    title: "Reservas",
    url: createPageUrl(ROUTES.BOOKINGS),
    icon: Calendar,
  },
  {
    title: "Informes",
    url: createPageUrl(ROUTES.REPORTS),
    icon: BarChart3,
  },
  // {
  //   title: "Configuración",
  //   url: createPageUrl(ROUTES.SETTINGS),
  //   icon: Settings, // Puedes descomentar esto cuando necesites esta ruta
  // },
];

// Componente para el estado del sistema.
// Extraerlo a un componente aparte mejora la legibilidad y reusabilidad.
function SystemStatusCard() {
  // Podrías tener un estado real aquí o pasarlo como prop
  const systemActive = true;
  const statusMessage = systemActive
    ? "Todos los sistemas funcionando correctamente"
    : "Algunos servicios podrían estar afectados";
  const statusIcon = systemActive ? SunDim : Cloud; // Ejemplo de ícono dinámico
  const statusColor = systemActive ? "text-green-700" : "text-amber-700";
  const bgColor = systemActive ? "from-green-50 to-emerald-50" : "from-amber-50 to-orange-50";
  const borderColor = systemActive ? "border-green-100" : "border-amber-100";
  const dotColor = systemActive ? "bg-green-400" : "bg-amber-400";

  return (
    <div
      className={`px-4 py-3 bg-gradient-to-r ${bgColor} rounded-lg border ${borderColor} transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-3 h-3 ${dotColor} rounded-full ${systemActive ? "animate-pulse" : ""}`}></div>
        <span className={`text-sm font-medium ${statusColor}`}>
          Sistema {systemActive ? "Activo" : "Con Advertencias"}
        </span>
        <statusIcon className={`w-4 h-4 ${statusColor}`} />
      </div>
      <p className="text-xs text-gray-600">{statusMessage}</p>
    </div>
  );
}

// Componente para el perfil del usuario en el footer.
function UserProfileFooter() {
  // Datos del usuario (podrían venir de un contexto de autenticación)
  const userName = "Administrador";
  const userRole = "Gestión de Cancha";
  const userInitials = userName.charAt(0);

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
        <span className="text-white font-bold text-sm">{userInitials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{userName}</p>
        <p className="text-xs text-green-600 truncate">{userRole}</p>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      {/* 
        Considera mover las variables CSS a un archivo CSS global (ej. globals.css)
        o a un archivo de configuración de Tailwind si vas a usarlas mucho.
        Mantenerlas aquí está bien para un scope muy limitado, pero puede
        ensuciar el componente si crece.
      */}
      <style jsx>{`
        :root {
          --field-green: #2D7D32;
          --field-green-light: #4CAF50;
          --accent-blue: #1976D2;
          --grass-gradient: linear-gradient(135deg, #2D7D32 0%, #388E3C 100%);
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-50 font-sans">
        {/* Sidebar principal */}
        <Sidebar className="border-r border-green-100 bg-white/80 backdrop-blur-sm shadow-xl z-20">
          <SidebarHeader className="border-b border-green-100 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                {/* Indicador de estado o notificación */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">FutbolManager</h2>
                <p className="text-sm text-green-600 font-medium">Sistema de Gestión</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4 flex-1 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-3">
                Navegación Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group w-full text-left flex items-center gap-3 py-3 px-4 rounded-lg 
                                    transition-all duration-200 ease-in-out
                                    ${
                                      location.pathname === item.url
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg font-semibold transform translate-x-1"
                                        : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                                    }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 w-full">
                          <item.icon
                            className={`w-5 h-5 transition-transform group-hover:scale-110 
                                        ${location.pathname === item.url ? "text-white" : "text-green-500 group-hover:text-green-700"}`}
                          />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Nueva sección para acciones rápidas o información adicional */}
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-3">
                Información del Sistema
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SystemStatusCard /> {/* Componente extraído */}
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Podrías añadir otra sección aquí, por ejemplo, "Mis Canchas" o "Alertas" */}
            {/*
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-3">
                Acciones Rápidas
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="group hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg py-3 px-4">
                    <Link to={createPageUrl("NewBooking")} className="flex items-center gap-3">
                      <PlusCircle className="w-5 h-5 text-blue-500 group-hover:text-blue-700 transition-transform group-hover:scale-110" />
                      <span className="font-medium">Nueva Reserva</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroupContent>
            </SidebarGroup>
            */}
          </SidebarContent>

          <SidebarFooter className="border-t border-green-100 p-4 bg-gradient-to-r from-green-50 to-emerald-50 shadow-inner">
            <UserProfileFooter /> {/* Componente extraído */}
          </SidebarFooter>
        </Sidebar>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-green-50 z-10">
          {/* Header para móviles */}
          <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4 md:hidden shadow-sm flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-green-50 p-2 rounded-lg transition-colors duration-200">
                <Menu className="w-5 h-5 text-gray-700" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-green-600" />
                <h1 className="text-lg font-bold text-gray-900">FutbolManager</h1>
              </div>
            </div>
            {/* Podrías añadir un botón de perfil o notificaciones aquí para móviles */}
            {/* <button className="p-2 rounded-full hover:bg-green-50 transition-colors duration-200">
              <UserCircle className="w-6 h-6 text-gray-700" />
            </button> */}
          </header>

          {/* Header para desktop si es necesario */}
          <header className="hidden md:flex bg-white/90 backdrop-blur-sm border-b border-gray-100 px-8 py-4 justify-between items-center shadow-sm z-10">
            <h1 className="text-2xl font-semibold text-gray-800">
              {currentPageName || "Bienvenido"} {/* Muestra el nombre de la página actual */}
            </h1>
            {/* Aquí puedes añadir elementos como un buscador, notificaciones, o un menú de usuario */}
            <div className="flex items-center gap-4">
              {/* <input 
                type="text" 
                placeholder="Buscar..." 
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              /> */}
              {/* <button className="p-2 rounded-full hover:bg-green-50 transition-colors duration-200">
                <Bell className="w-6 h-6 text-gray-700" />
              </button> */}
              {/* Avatar de usuario */}
              <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md cursor-pointer">
                <span className="text-white font-bold text-xs">A</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}