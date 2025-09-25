import React, { useCallback, useMemo } from "react";
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
  Calendar,
  Clock,
  Users,
  DollarSign,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical // Para el menú de opciones en móvil
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator // Para separar opciones en el menú
} from "@/components/ui/dropdown-menu";

// --- Constantes y Enums ---
// Centralizar textos para fácil modificación y consistencia
const TEXTS = {
  listTitle: "Lista de Reservas",
  noBookingsTitle: "No hay reservas",
  noBookingsMessage: "Agrega la primera reserva para comenzar",
  editButton: "Editar",
  noDate: "Sin fecha",
  noTime: "Sin hora",
  noAmount: "0",
  playersLabel: "jugadores",
  markAsPending: "Marcar como Pendiente",
  markAsConfirmed: "Marcar como Confirmada",
  markAsCancelled: "Marcar como Cancelada",
};

// Centralizar configuración de estados para evitar repetición
const BOOKING_STATUS = {
  CONFIRMADA: "confirmada",
  PENDIENTE: "pendiente",
  CANCELADA: "cancelada",
};

const statusConfig = {
  [BOOKING_STATUS.CONFIRMADA]: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
    label: "Confirmada",
  },
  [BOOKING_STATUS.PENDIENTE]: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <AlertCircle className="w-3 h-3" />,
    label: "Pendiente",
  },
  [BOOKING_STATUS.CANCELADA]: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
    label: "Cancelada",
  },
};

// --- Componentes Auxiliares ---

// Componente para manejar el cambio de estado de la reserva
function StatusDropdown({ booking, onStatusChange }) {
  const currentStatus = statusConfig[booking.estado] || statusConfig[BOOKING_STATUS.PENDIENTE]; // Default seguro

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          className={`cursor-pointer transition-colors hover:opacity-85 border ${currentStatus.color}`}
        >
          {currentStatus.icon}
          <span className="ml-1">{currentStatus.label}</span>
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(BOOKING_STATUS).map(([key, statusValue]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onStatusChange(booking, statusValue)}
            disabled={booking.estado === statusValue} // Deshabilita la opción si ya es el estado actual
            className={booking.estado === statusValue ? "font-semibold text-primary" : ""}
          >
            {statusConfig[statusValue].icon}
            <span className="ml-2">{statusConfig[statusValue].label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente para renderizar una fila de la tabla (Desktop)
function BookingTableRow({ booking, onEdit, onStatusChange }) {
  const formattedDate = booking.fecha
    ? format(new Date(booking.fecha), "d MMM yyyy", { locale: es })
    : TEXTS.noDate;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout // Permite animaciones de layout al añadir/quitar elementos
      className="hover:bg-green-50 transition-colors"
    >
      <TableCell>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Calendar className="w-4 h-4 text-green-600" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Clock className="w-3 h-3" />
            {booking.hora || TEXTS.noTime}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <div className="font-medium text-gray-900">{booking.nombre_contacto}</div>
          {booking.telefono_contacto && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Phone className="w-3 h-3" />
              {booking.telefono_contacto}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4 text-blue-500" />
          <span>{booking.cantidad_jugadores || 0} {TEXTS.playersLabel}</span>
        </div>
        {booking.observaciones && (
          <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]"> {/* Aumentado el max-w para mejor lectura */}
            {booking.observaciones}
          </div>
        )}
      </TableCell>

      <TableCell className="font-semibold text-green-700">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {booking.monto?.toLocaleString() || TEXTS.noAmount}
        </div>
      </TableCell>

      <TableCell>
        <StatusDropdown booking={booking} onStatusChange={onStatusChange} />
      </TableCell>

      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(booking)}
          aria-label={`${TEXTS.editButton} ${booking.nombre_contacto}`}
          className="hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </TableCell>
    </motion.tr>
  );
}

// Componente para renderizar una tarjeta de reserva (Mobile)
function BookingMobileCard({ booking, onEdit, onStatusChange }) {
  const formattedDate = booking.fecha
    ? format(new Date(booking.fecha), "d MMM yyyy", { locale: es })
    : TEXTS.noDate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout // Permite animaciones de layout
      className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 leading-tight">
            {booking.nombre_contacto}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {booking.hora || TEXTS.noTime}
            </span>
          </div>
        </div>
        <StatusDropdown booking={booking} onStatusChange={onStatusChange} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1 text-gray-700">
          <Users className="w-4 h-4 text-blue-500" />
          <span>{booking.cantidad_jugadores || 0} {TEXTS.playersLabel}</span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-green-700 justify-end">
          <DollarSign className="w-4 h-4" />
          ${booking.monto?.toLocaleString() || TEXTS.noAmount}
        </div>
        {booking.telefono_contacto && (
          <div className="flex items-center gap-1 col-span-2 text-gray-600">
            <Phone className="w-4 h-4 text-gray-500" />
            <span>{booking.telefono_contacto}</span>
          </div>
        )}
      </div>

      {booking.observaciones && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 max-h-[80px] overflow-auto">
          {booking.observaciones}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(booking)}
          className="hover:bg-green-50 hover:border-green-300 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          {TEXTS.editButton}
        </Button>
      </div>
    </motion.div>
  );
}

// --- Componente Principal ---

export default function BookingsList({ bookings = [], isLoading, onEdit, onStatusChange }) { // Default para bookings
  // Memoizar las funciones de callback para evitar re-renderizados innecesarios en componentes hijos
  const memoizedOnEdit = useCallback((booking) => {
    if (onEdit) onEdit(booking);
  }, [onEdit]);

  const memoizedOnStatusChange = useCallback((booking, newStatus) => {
    if (onStatusChange) onStatusChange(booking, newStatus);
  }, [onStatusChange]);

  // Renderizado condicional para el estado de carga
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-none">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
            <Calendar className="w-6 h-6 text-green-600" />
            {TEXTS.listTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3) // Mostrar menos esqueletos si la lista puede ser corta
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50 animate-pulse">
                  <div className="space-y-2 flex-1 mb-3 sm:mb-0">
                    <Skeleton className="h-5 w-48 bg-gray-200" />
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                    <Skeleton className="h-4 w-64 bg-gray-200" />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Skeleton className="h-9 w-24 bg-gray-200" />
                    <Skeleton className="h-9 w-9 bg-gray-200" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizado condicional si no hay reservas
  if (!bookings || bookings.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-none">
        <CardContent className="py-12 px-6">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">{TEXTS.noBookingsTitle}</h3>
            <p className="text-gray-500">{TEXTS.noBookingsMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizado de la lista de reservas
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <Calendar className="w-7 h-7 text-green-600" />
          {TEXTS.listTitle} ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0"> {/* Quitar padding para que la tabla ocupe todo el ancho */}
        {/* Vista de Tabla para Escritorio */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100 text-gray-700 uppercase text-sm">
                <TableHead className="py-3 px-4">Fecha y Hora</TableHead>
                <TableHead className="py-3 px-4">Contacto</TableHead>
                <TableHead className="py-3 px-4">Detalles</TableHead>
                <TableHead className="py-3 px-4">Monto</TableHead>
                <TableHead className="py-3 px-4">Estado</TableHead>
                <TableHead className="py-3 px-4 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout"> {/* `mode="popLayout"` para animaciones de salida de layout */}
                {bookings.map((booking) => (
                  <BookingTableRow
                    key={booking.id}
                    booking={booking}
                    onEdit={memoizedOnEdit}
                    onStatusChange={memoizedOnStatusChange}
                  />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Vista de Tarjetas para Móvil */}
        <div className="lg:hidden space-y-4 p-4"> {/* Añadir padding de nuevo para el móvil */}
          <AnimatePresence mode="popLayout">
            {bookings.map((booking) => (
              <BookingMobileCard
                key={booking.id}
                booking={booking}
                onEdit={memoizedOnEdit}
                onStatusChange={memoizedOnStatusChange}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}