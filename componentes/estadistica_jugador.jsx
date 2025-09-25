import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define una interfaz para el jugador si usas TypeScript
// interface Player {
//   id: string;
//   nombre: string;
//   apellido: string;
//   dni: string;
//   activo: boolean;
//   telefono?: string;
// }

// Componente para mostrar el esqueleto de carga
const PlayerStatsSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        Estadísticas de Jugadores
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-8" />
        </div>
      ))}
    </CardContent>
  </Card>
);

// Componente para mostrar las estadísticas principales
const StatsOverview = ({ activeCount, inactiveCount }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
      <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
      <div className="text-2xl font-bold text-green-700">{activeCount}</div>
      <div className="text-sm text-green-600">Activos</div>
    </div>
    <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100">
      <UserX className="w-8 h-8 text-red-600 mx-auto mb-2" />
      <div className="text-2xl font-bold text-red-700">{inactiveCount}</div>
      <div className="text-sm text-red-600">Inactivos</div>
    </div>
  </div>
);

// Componente para la información de contacto
const ContactInfo = ({ totalPlayers, playersWithPhoneCount }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
      <Phone className="w-4 h-4" />
      Información de Contacto
    </h4>
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Con teléfono</span>
        <span className="font-semibold text-green-600">{playersWithPhoneCount}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Sin teléfono</span>
        <span className="font-semibold text-gray-500">{totalPlayers - playersWithPhoneCount}</span>
      </div>
    </div>
  </div>
);

// Componente para la lista de jugadores recientes
const RecentPlayersList = ({ players }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-gray-900">Jugadores Recientes</h4>
    {players.slice(0, 3).map((player) => (
      <div key={player.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div>
          <div className="font-medium text-sm text-gray-900">
            {player.nombre} {player.apellido}
          </div>
          <div className="text-xs text-gray-500">DNI: {player.dni}</div>
        </div>
        <div
          className={`w-2 h-2 rounded-full ${player.activo !== false ? 'bg-green-400' : 'bg-red-400'}`}
          // Añadir aria-label para accesibilidad
          aria-label={player.activo !== false ? "Jugador activo" : "Jugador inactivo"}
        />
      </div>
    ))}
  </div>
);


export default function PlayerStats({ players, isLoading }) {
  if (isLoading) {
    return <PlayerStatsSkeleton />;
  }

  // Usar useMemo para memorizar los resultados de los filtros
  const activePlayers = useMemo(
    () => players.filter(player => player.activo !== false),
    [players]
  );
  const inactivePlayers = useMemo(
    () => players.filter(player => player.activo === false),
    [players]
  );
  const playersWithPhone = useMemo(
    () => players.filter(player => player.telefono && player.telefono.trim()),
    [players]
  );

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="w-6 h-6 text-blue-600" />
          Estadísticas de Jugadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <StatsOverview
            activeCount={activePlayers.length}
            inactiveCount={inactivePlayers.length}
          />
          <ContactInfo
            totalPlayers={players.length}
            playersWithPhoneCount={playersWithPhone.length}
          />
          <RecentPlayersList players={players} />
        </div>
      </CardContent>
    </Card>
  );
}