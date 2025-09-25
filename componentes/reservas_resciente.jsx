import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos (si usas TypeScript, esto iría en un archivo .d.ts o similar)
/**
 * @typedef {"confirmada" | "pendiente" | "cancelada"} BookingStatus
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} nombre_contacto
 * @property {BookingStatus} estado
 * @property {string | Date} fecha
 * @property {string} hora
 * @property {number} cantidad_jugadores
 * @property {number} [monto] // Monto podría ser opcional
 */

const statusConfig = {
  confirmada: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Confirmada"
  },
  pendiente: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Pendiente"
  },
  cancelada: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Cancelada"
  }
};

/**
 * Formatea una fecha en formato corto (ej. "15 May").
 * @param {string | Date | null | undefined} dateValue
 * @returns {string}
 */
const formatShortDate = (dateValue) => {
  if (!dateValue) return "Sin fecha";
  try {
    return format(new Date(dateValue), "d MMM", { locale: es });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "Fecha inválida";
  }
};

/**
 * Componente para mostrar una tarjeta de reserva individual.
 * @param {{ booking: Booking }} props
 */
const BookingItem = ({ booking }) => {
  const currentStatus = statusConfig[booking.estado] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: "Desconocido"
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 bg-white/50">
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <span>{booking.nombre_contacto}</span>
          <Badge className={`${currentStatus.color} border text-xs`}>
            {currentStatus.label}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatShortDate(booking.fecha)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {booking.hora || "Sin hora"}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {booking.cantidad_jugadores} jugadores
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center gap-1 font-bold text-green-600 text-lg">
          <DollarSign className="w-4 h-4" />
          {booking.monto?.toLocaleString("es-ES") || "0"}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente principal para mostrar las reservas recientes.
 * @param {{ bookings: Booking[], isLoading: boolean }} props
 */
export default function RecentBookings({ bookings, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-green-600" />
            Reservas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-6 h-6 text-green-600" />
          Reservas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay reservas registradas</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}