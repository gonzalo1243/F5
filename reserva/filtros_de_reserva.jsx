import React, { useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

// Definimos un objeto de configuración para los estados para evitar duplicación y mejorar la legibilidad.
const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
];

export default function BookingFilters({ filters, onFiltersChange }) {
  // Utilizamos useCallback para memorizar la función handleFilterChange,
  // lo que puede ser útil si este componente se renderiza con frecuencia
  // y onFiltersChange es una prop estable.
  const handleFilterChange = useCallback(
    (key, value) => {
      onFiltersChange((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [onFiltersChange]
  );

  // Función para manejar el cambio de fecha específica, reseteando el mes si se selecciona una fecha.
  const handleDateChange = useCallback(
    (e) => {
      const value = e.target.value;
      handleFilterChange("fecha", value);
      if (value) {
        handleFilterChange("mes", "");
      }
    },
    [handleFilterChange]
  );

  // Función para manejar el cambio de mes, reseteando la fecha específica si se selecciona un mes.
  const handleMonthChange = useCallback(
    (e) => {
      const value = e.target.value;
      handleFilterChange("mes", value);
      if (value) {
        handleFilterChange("fecha", "");
      }
    },
    [handleFilterChange]
  );

  return (
    <div className="flex flex-wrap gap-4 items-end p-4 bg-white rounded-lg shadow-sm"> {/* Añadido padding y sombra para mejor UI */}
      <div className="flex items-center gap-2 text-base text-gray-700"> {/* Ajuste de tamaño de texto */}
        <Filter className="w-5 h-5 text-blue-500" /> {/* Icono un poco más grande y con color */}
        <span className="font-semibold">Filtros de Reserva:</span> {/* Título más descriptivo */}
      </div>

      {/* Filtro por Estado */}
      <div className="space-y-1">
        <Label htmlFor="status-filter" className="text-xs text-gray-600 font-medium">Estado</Label> {/* Añadido htmlFor */}
        <Select
          value={filters.estado}
          onValueChange={(value) => handleFilterChange("estado", value)}
        >
          <SelectTrigger id="status-filter" className="w-36 h-10 border-gray-300 focus:border-blue-500 transition-colors"> {/* Ajuste de ancho y alto */}
            <SelectValue placeholder="Selecciona un estado" /> {/* Placeholder */}
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por Fecha Específica */}
      <div className="space-y-1">
        <Label htmlFor="date-filter" className="text-xs text-gray-600 font-medium">Fecha Específica</Label>
        <Input
          id="date-filter"
          type="date"
          value={filters.fecha}
          onChange={handleDateChange}
          className="w-40 h-10 border-gray-300 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filtro por Mes */}
      <div className="space-y-1">
        <Label htmlFor="month-filter" className="text-xs text-gray-600 font-medium">Mes</Label>
        <Input
          id="month-filter"
          type="month"
          value={filters.mes}
          onChange={handleMonthChange}
          className="w-40 h-10 border-gray-300 focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}