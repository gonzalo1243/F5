import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils"; // Asegúrate de tener una utilidad para combinar clases

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  // Nuevas props para colores más explícitos
  bgColorClass = "bg-blue-500", // Default para el fondo de la burbuja
  iconBgClass = "bg-blue-100", // Default para el fondo del icono
  iconColorClass = "text-blue-500", // Default para el color del icono
  trendColorClass = "text-green-500", // Default para el color de la tendencia
}) {
  return (
    <Card
      className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-gray-100 hover:shadow-lg transition-all duration-300 group"
    >
      {/* Burbuja de fondo decorativa */}
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500",
          bgColorClass // Usa la clase de fondo proporcionada
        )}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {/* Contenedor del icono */}
        <div
          className={cn(
            "p-2 rounded-lg bg-opacity-20 group-hover:bg-opacity-30 transition-colors duration-300",
            iconBgClass // Usa la clase de fondo para el icono
          )}
        >
          <Icon className={cn("h-5 w-5", iconColorClass)} />{" "}
          {/* Usa la clase de color para el icono */}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {trend && (
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className={cn("h-3 w-3 mr-1", trendColorClass)} />{" "}
            {/* Usa la clase de color para la tendencia */}
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 