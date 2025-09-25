import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Calendar } from "lucide-react";
import { format } from "date-fns";

// Constantes para los horarios y estados de reserva
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00"
];

const BOOKING_STATES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
];

export default function BookingForm({ booking, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    fecha: booking?.fecha || format(new Date(), "yyyy-MM-dd"),
    hora: booking?.hora || "",
    monto: booking?.monto ?? "", // Usar nullish coalescing
    cantidad_jugadores: booking?.cantidad_jugadores ?? 10,
    nombre_contacto: booking?.nombre_contacto || "",
    telefono_contacto: booking?.telefono_contacto || "",
    estado: booking?.estado || "pendiente",
    observaciones: booking?.observaciones || ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maneja cambios para Inputs
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? (value === "" ? "" : parseFloat(value)) : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Maneja cambios para Selects
  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fecha) newErrors.fecha = "La fecha es requerida.";
    if (!formData.hora) newErrors.hora = "La hora es requerida.";
    if (formData.monto === "" || parseFloat(formData.monto) <= 0 || isNaN(parseFloat(formData.monto))) {
      newErrors.monto = "El monto debe ser un número positivo.";
    }
    if (formData.cantidad_jugadores === "" || parseInt(formData.cantidad_jugadores) <= 0 || isNaN(parseInt(formData.cantidad_jugadores))) {
      newErrors.cantidad_jugadores = "La cantidad de jugadores debe ser un número positivo.";
    }
    if (!formData.nombre_contacto.trim()) newErrors.nombre_contacto = "El nombre de contacto es requerido.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData); // Asumimos que onSubmit puede ser asíncrona
      } catch (error) {
        console.error("Error al guardar la reserva:", error);
        // Aquí podrías mostrar una notificación de error al usuario
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid = Object.keys(errors).length === 0 && 
                      formData.fecha && formData.hora && 
                      (formData.monto !== "" && parseFloat(formData.monto) > 0) &&
                      (formData.cantidad_jugadores !== "" && parseInt(formData.cantidad_jugadores) > 0) &&
                      formData.nombre_contacto.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="w-6 h-6" />
              {booking ? "Editar Reserva" : "Nueva Reserva"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de la Reserva *</Label>
                <Input
                  id="fecha"
                  name="fecha" // Añadir atributo name
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className={errors.fecha ? "border-red-500" : ""}
                />
                {errors.fecha && <p className="text-sm text-red-500">{errors.fecha}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Horario *</Label>
                <Select
                  value={formData.hora}
                  onValueChange={(value) => handleSelectChange("hora", value)}
                >
                  <SelectTrigger className={errors.hora ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>
                        {time} hs
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hora && <p className="text-sm text-red-500">{errors.hora}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre_contacto">Nombre de Contacto *</Label>
                <Input
                  id="nombre_contacto"
                  name="nombre_contacto" // Añadir atributo name
                  value={formData.nombre_contacto}
                  onChange={handleInputChange}
                  placeholder="Nombre del responsable"
                  className={errors.nombre_contacto ? "border-red-500" : ""}
                />
                {errors.nombre_contacto && <p className="text-sm text-red-500">{errors.nombre_contacto}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_contacto">Teléfono de Contacto</Label>
                <Input
                  id="telefono_contacto"
                  name="telefono_contacto" // Añadir atributo name
                  value={formData.telefono_contacto}
                  onChange={handleInputChange}
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cantidad_jugadores">Cantidad de Jugadores *</Label>
                <Input
                  id="cantidad_jugadores"
                  name="cantidad_jugadores" // Añadir atributo name
                  type="number"
                  min="1"
                  max="22"
                  value={formData.cantidad_jugadores}
                  onChange={handleInputChange}
                  className={errors.cantidad_jugadores ? "border-red-500" : ""}
                />
                {errors.cantidad_jugadores && <p className="text-sm text-red-500">{errors.cantidad_jugadores}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto de la Reserva *</Label>
                <Input
                  id="monto"
                  name="monto" // Añadir atributo name
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monto}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={errors.monto ? "border-red-500" : ""}
                />
                {errors.monto && <p className="text-sm text-red-500">{errors.monto}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado de la Reserva</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleSelectChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_STATES.map(state => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones" // Añadir atributo name
                value={formData.observaciones}
                onChange={handleInputChange}
                placeholder="Información adicional sobre la reserva..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-6 flex items-center gap-2"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <>
                    <Calendar className="w-4 h-4 animate-spin" /> {/* Icono de carga */}
                    Enviando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {booking ? "Actualizar" : "Guardar"} Reserva
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