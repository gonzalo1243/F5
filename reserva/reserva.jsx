import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Booking } from "@/entities/Booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Calendar as CalendarIcon, Loader2 } from "lucide-react"; // Añadido Loader2
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Importar locale para fechas

import BookingForm from "../components/bookings/BookingForm";
import BookingsList from "../components/bookings/BookingsList";
import BookingFilters from "../components/bookings/BookingFilters";
import { useToast } from "@/components/ui/use-toast"; // Para notificaciones al usuario
import { Dialog } from "@/components/ui/dialog"; // Considerar usar Shadcn Dialog para el formulario

// Constantes para filtros iniciales
const INITIAL_FILTERS = {
  estado: "all",
  fecha: "",
  mes: format(new Date(), "yyyy-MM"),
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado para indicar si se está guardando
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const { toast } = useToast(); // Hook para notificaciones

  // Cargar reservas
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Podrías cargar más dinámicamente según la necesidad o paginación
      const data = await Booking.list("-fecha", 100); 
      setBookings(data);
      toast({
        title: "Reservas cargadas",
        description: `Se han cargado ${data.length} reservas.`,
      });
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Error al cargar",
        description: "No se pudieron cargar las reservas. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // `toast` es una dependencia estable del hook `useToast`

  useEffect(() => {
    loadBookings();
  }, [loadBookings]); // Dependencia `loadBookings` para recargar si la función cambia

  // Memoizar el filtrado para evitar recálculos innecesarios
  const filteredBookings = useMemo(() => {
    let currentFiltered = [...bookings];

    // 1. Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (booking) =>
          booking.nombre_contacto?.toLowerCase().includes(lowerSearchTerm) ||
          booking.telefono_contacto?.includes(lowerSearchTerm) // Usar lowerSearchTerm también para teléfonos si no son solo números
      );
    }

    // 2. Filtrar por estado
    if (filters.estado !== "all") {
      currentFiltered = currentFiltered.filter(
        (booking) => booking.estado === filters.estado
      );
    }

    // 3. Filtrar por fecha o mes
    if (filters.fecha) {
      currentFiltered = currentFiltered.filter(
        (booking) => booking.fecha === filters.fecha
      );
    } else if (filters.mes) {
      currentFiltered = currentFiltered.filter(
        (booking) => booking.fecha && booking.fecha.startsWith(filters.mes)
      );
    }

    return currentFiltered;
  }, [bookings, searchTerm, filters]); // Dependencias para re-calcular cuando cambien

  // Manejo del envío del formulario (crear/actualizar)
  const handleSubmit = useCallback(
    async (bookingData) => {
      setIsSaving(true);
      try {
        if (editingBooking) {
          await Booking.update(editingBooking.id, bookingData);
          toast({
            title: "Reserva actualizada",
            description: `La reserva de ${bookingData.nombre_contacto} ha sido actualizada.`,
          });
        } else {
          await Booking.create(bookingData);
          toast({
            title: "Reserva creada",
            description: `Se ha creado una nueva reserva para ${bookingData.nombre_contacto}.`,
          });
        }
        setShowForm(false);
        setEditingBooking(null);
        await loadBookings(); // Recargar las reservas después de guardar
      } catch (error) {
        console.error("Error saving booking:", error);
        toast({
          title: "Error al guardar",
          description: "Hubo un problema al guardar la reserva.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [editingBooking, loadBookings, toast]
  );

  // Manejo de la edición
  const handleEdit = useCallback((booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  }, []);

  // Manejo del cambio de estado
  const handleStatusChange = useCallback(
    async (booking, newStatus) => {
      setIsLoading(true); // O un estado específico para la actualización de estado
      try {
        await Booking.update(booking.id, {
          ...booking,
          estado: newStatus,
        });
        toast({
          title: "Estado actualizado",
          description: `El estado de la reserva de ${booking.nombre_contacto} ha cambiado a ${newStatus}.`,
        });
        await loadBookings(); // Recargar las reservas después de actualizar el estado
      } catch (error) {
        console.error("Error updating booking status:", error);
        toast({
          title: "Error al actualizar estado",
          description: "No se pudo actualizar el estado de la reserva.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadBookings, toast]
  );

  // Formatear fechas en el encabezado
  const formattedDate = useMemo(() => {
    if (filters.fecha) {
      return format(new Date(filters.fecha), "PPP", { locale: es });
    }
    if (filters.mes) {
      const [year, month] = filters.mes.split('-');
      const date = new Date(year, month - 1, 1);
      return format(date, "MMMM yyyy", { locale: es });
    }
    return "";
  }, [filters.fecha, filters.mes]);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Reservas
            </h1>
            <p className="text-gray-600">
              Administra todas las reservas de la cancha
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingBooking(null);
              setShowForm(true); // Siempre mostrar el formulario al hacer clic en "Nueva Reserva"
            }}
            className="bg-green-600 hover:bg-green-700 shadow-lg"
            disabled={isSaving} // Deshabilitar si se está guardando algo
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Plus className="w-5 h-5 mr-2" />
            )}
            Nueva Reserva
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon className="w-4 h-4" />
              <span>
                {isLoading ? (
                  <Loader2 className="inline w-4 h-4 animate-spin mr-1" />
                ) : (
                  filteredBookings.length
                )}{" "}
                de {bookings.length} reservas {formattedDate && `(${formattedDate})`}
              </span>
            </div>
          </div>

          <BookingFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Form Modal */}
        {/* Usar Shadcn Dialog para una mejor accesibilidad y comportamiento */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <AnimatePresence>
            {showForm && (
              <BookingForm
                booking={editingBooking}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingBooking(null);
                }}
                isSaving={isSaving} // Pasar el estado de guardado al formulario
              />
            )}
          </AnimatePresence>
        </Dialog>

        {/* Bookings List */}
        <BookingsList
          bookings={filteredBookings}
          isLoading={isLoading}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}