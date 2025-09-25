import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Save, User, Loader2 } from "lucide-react"; // Importar Loader2
import { z } from "zod"; // Importar Zod para validación

// Define el esquema de validación con Zod
const playerSchema = z.object({
  dni: z.string().trim().min(1, "El DNI es requerido."),
  nombre: z.string().trim().min(1, "El nombre es requerido."),
  apellido: z.string().trim().min(1, "El apellido es requerido."),
  direccion: z.string().optional(),
  telefono: z.string().optional(), // Podrías añadir .regex() para formato de teléfono
  activo: z.boolean().default(true),
});

export default function PlayerForm({ player, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    dni: player?.dni || "",
    nombre: player?.nombre || "",
    apellido: player?.apellido || "",
    direccion: player?.direccion || "",
    telefono: player?.telefono || "",
    activo: player?.activo !== false, // Por defecto, true si no está explícitamente false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el indicador de carga

  const handleSubmit = async (e) => { // Marca la función como async
    e.preventDefault();
    setIsSubmitting(true); // Activa el indicador de carga

    try {
      // Valida el formulario con Zod
      playerSchema.parse(formData);
      await onSubmit(formData); // Espera a que la función onSubmit se complete
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        // Manejar otros errores (ej. errores de la API en onSubmit)
        console.error("Error al procesar el formulario:", error);
        // Podrías mostrar un toast de error general aquí
      }
    } finally {
      setIsSubmitting(false); // Desactiva el indicador de carga, sea éxito o error
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpia el error del campo específico cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()} // Cierra al hacer clic fuera del card
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
              <User className="w-6 h-6" />
              {player ? "Editar Jugador" : "Nuevo Jugador"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-white/20 transition-colors duration-200"
              aria-label="Cerrar formulario"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI <span className="text-red-500">*</span></Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => handleChange("dni", e.target.value)}
                  placeholder="Ej: 12345678"
                  className={errors.dni ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={!!errors.dni}
                  aria-describedby={errors.dni ? "dni-error" : undefined}
                  autoFocus={!player} // Autofocus en el DNI solo para nuevo jugador
                />
                {errors.dni && <p id="dni-error" className="text-sm text-red-500">{errors.dni}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  placeholder="Ej: +54 9 11 1234-5678"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Ej: Juan"
                  className={errors.nombre ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={!!errors.nombre}
                  aria-describedby={errors.nombre ? "nombre-error" : undefined}
                />
                {errors.nombre && <p id="nombre-error" className="text-sm text-red-500">{errors.nombre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido <span className="text-red-500">*</span></Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => handleChange("apellido", e.target.value)}
                  placeholder="Ej: Pérez"
                  className={errors.apellido ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={!!errors.apellido}
                  aria-describedby={errors.apellido ? "apellido-error" : undefined}
                />
                {errors.apellido && <p id="apellido-error" className="text-sm text-red-500">{errors.apellido}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                placeholder="Ej: Av. Corrientes 1234, CABA"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => handleChange("activo", checked)}
              />
              <Label htmlFor="activo">Jugador activo</Label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6"
                disabled={isSubmitting} // Deshabilita cancelar mientras se envía
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 flex items-center gap-2 transition-colors duration-200"
                disabled={isSubmitting} // Deshabilita el botón mientras se envía
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {player ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {player ? "Actualizar" : "Guardar"} Jugador
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}