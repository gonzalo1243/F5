import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Edit, 
  Phone, 
  MapPin, 
  UserCheck, 
  UserX, 
  IdCard,
  Users 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Definición de tipos (si usas TypeScript) ---
// interface Player {
//   id: string;
//   nombre: string;
//   apellido: string;
//   dni: string;
//   telefono?: string;
//   direccion?: string;
//   activo: boolean;
// }

// interface PlayersListProps {
//   players: Player[];
//   isLoading: boolean;
//   onEdit: (player: Player) => void;
//   onToggleStatus: (player: Player) => void;
// }

// --- Subcomponente para la fila de la tabla (Desktop) ---
const PlayerTableRow = ({ player, onEdit, onToggleStatus }) => (
  <motion.tr
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    layout // Añadir layout para transiciones más suaves en reordenamientos/filtros
    className="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
  >
    <TableCell className="py-3 px-4"> {/* Ajuste de padding */}
      <div>
        <div className="font-semibold text-gray-900 leading-snug"> {/* leading-snug para mejor espaciado */}
          {player.nombre} {player.apellido}
        </div>
        {player.direccion && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3 h-3 text-blue-400" /> {/* Color de icono más distintivo */}
            {player.direccion}
          </div>
        )}
      </div>
    </TableCell>
    
    <TableCell className="py-3 px-4">
      <div className="flex items-center gap-2">
        <IdCard className="w-4 h-4 text-gray-400" />
        <span className="font-mono text-sm">{player.dni}</span> {/* Tamaño de fuente consistente */}
      </div>
    </TableCell>
    
    <TableCell className="py-3 px-4">
      {player.telefono ? (
        <a 
          href={`tel:${player.telefono}`} 
          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 hover:underline" // Enlace clickeable
          aria-label={`Llamar a ${player.nombre} ${player.apellido}`}
        >
          <Phone className="w-4 h-4 text-green-500" />
          {player.telefono}
        </a>
      ) : (
        <span className="text-gray-400 text-sm">Sin teléfono</span>
      )}
    </TableCell>
    
    <TableCell className="py-3 px-4">
      <Badge 
        className={`cursor-pointer transition-colors duration-200 ease-in-out px-3 py-1 text-xs font-medium border ${
          player.activo !== false
            ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
        }`}
        onClick={() => onToggleStatus(player)}
        aria-label={`Cambiar estado de ${player.nombre} a ${player.activo !== false ? 'inactivo' : 'activo'}`}
      >
        {player.activo !== false ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            Activo
          </>
        ) : (
          <>
            <UserX className="w-3 h-3 mr-1" />
            Inactivo
          </>
        )}
      </Badge>
    </TableCell>
    
    <TableCell className="py-3 px-4 text-right"> {/* Alineación a la derecha para acciones */}
      <Button
        variant="outline"
        size="icon" // Usar size="icon" para botones de solo icono
        onClick={() => onEdit(player)}
        className="text-gray-600 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
        aria-label={`Editar jugador ${player.nombre} ${player.apellido}`}
      >
        <Edit className="w-4 h-4" />
      </Button>
    </TableCell>
  </motion.tr>
);

// --- Subcomponente para la tarjeta de jugador (Mobile) ---
const PlayerMobileCard = ({ player, onEdit, onToggleStatus }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    layout // Añadir layout para transiciones más suaves
    className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-200 ease-in-out"
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
          {player.nombre} {player.apellido}
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <IdCard className="w-3 h-3 text-gray-400" />
          DNI: <span className="font-mono">{player.dni}</span>
        </div>
      </div>
      
      <Badge 
        className={`cursor-pointer transition-colors duration-200 ease-in-out px-3 py-1 text-xs font-medium border ${
          player.activo !== false
            ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
        }`}
        onClick={() => onToggleStatus(player)}
        aria-label={`Cambiar estado de ${player.nombre} a ${player.activo !== false ? 'inactivo' : 'activo'}`}
      >
        {player.activo !== false ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            Activo
          </>
        ) : (
          <>
            <UserX className="w-3 h-3 mr-1" />
            Inactivo
          </>
        )}
      </Badge>
    </div>
    
    <div className="space-y-2 mb-4">
      {player.telefono && (
        <a 
          href={`tel:${player.telefono}`} 
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 hover:underline"
          aria-label={`Llamar a ${player.nombre} ${player.apellido}`}
        >
          <Phone className="w-4 h-4 text-green-500 flex-shrink-0" /> {/* flex-shrink-0 para evitar encogimiento */}
          {player.telefono}
        </a>
      )}
      {player.direccion && (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
          {player.direccion}
        </div>
      )}
    </div>
    
    <div className="flex justify-end pt-2 border-t border-gray-100"> {/* Separador sutil */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(player)}
        className="text-gray-600 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
        aria-label={`Editar jugador ${player.nombre} ${player.apellido}`}
      >
        <Edit className="w-4 h-4 mr-2" />
        Editar
      </Button>
    </div>
  </motion.div>
);


// --- Componente principal PlayersList ---
export default function PlayersList({ players, isLoading, onEdit, onToggleStatus }) {
  // Skeleton de carga para la vista de tarjeta móvil
  const MobileSkeleton = () => (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg bg-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton de carga para la vista de tabla de escritorio
  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead>Jugador</TableHead>
          <TableHead>DNI</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(5).fill(0).map((_, i) => (
          <TableRow key={i}>
            <TableCell className="py-3 px-4">
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell className="py-3 px-4"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="py-3 px-4"><Skeleton className="h-5 w-36" /></TableCell>
            <TableCell className="py-3 px-4"><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell className="py-3 px-4"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );


  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
            <Users className="w-6 h-6 text-blue-500" />
            Cargando Jugadores...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <TableSkeleton />
          </div>
          <div className="md:hidden">
            <MobileSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-2 border-dashed border-gray-200"> {/* Borde dashed para indicar vacío */}
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay jugadores registrados</h3>
            <p className="text-gray-500">Haz clic en "Agregar Jugador" para empezar a gestionar tu equipo.</p>
            {/* Opcional: añadir un botón para agregar jugador aquí si la prop `onAddPlayer` existe */}
            {/* <Button className="mt-6">Agregar Jugador</Button> */}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4"> {/* Ajuste de padding */}
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <Users className="w-6 h-6 text-blue-600" />
          Lista de Jugadores <span className="text-gray-500 font-medium">({players.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2"> {/* Ajuste de padding */}
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100"> {/* Un poco más oscuro para header */}
                <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Jugador</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">DNI</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</TableHead>
                <TableHead className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout"> {/* Añadir mode="popLayout" para evitar problemas con las animaciones de salida */}
                {players.map((player) => (
                  <PlayerTableRow 
                    key={player.id} 
                    player={player} 
                    onEdit={onEdit} 
                    onToggleStatus={onToggleStatus} 
                  />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          <AnimatePresence mode="popLayout">
            {players.map((player) => (
              <PlayerMobileCard 
                key={player.id} 
                player={player} 
                onEdit={onEdit} 
                onToggleStatus={onToggleStatus} 
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}