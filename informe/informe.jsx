import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Player } from "@/entities/Player";
import { Booking } from "@/entities/Booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, Users, Calendar, DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { format, parseISO, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDaysInMonth } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton"; // Asumiendo que tienes un componente Skeleton
import { toast } from "sonner"; // Asumiendo que usas Sonner para notificaciones

// Definir colores para las gráficas
const COLORS = {
  confirmada: '#22C55E', // Green-500
  pendiente: '#EAB308', // Yellow-500
  cancelada: '#EF4444', // Red-500
  ingresos: '#22C55E',
  reservas: '#3B82F6',
  general: '#8B5CF6', // Purple-500
};

export default function ReportsPage() {
  const [players, setPlayers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM")); // Cambiado a selectedMonth
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga de datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [playersData, bookingsData] = await Promise.all([
          Player.list("-created_date"),
          Booking.list("-fecha", 200) // Considera paginación si hay muchas reservas
        ]);
        setPlayers(playersData);
        setBookings(bookingsData);
        toast.success("Datos cargados exitosamente.");
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar los datos. Inténtalo de nuevo más tarde.");
        toast.error("Error al cargar los datos.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []); // Se ejecuta solo una vez al montar

  // Parsear selectedMonth a un objeto Date para facilitar comparaciones
  const currentMonthDate = useMemo(() => parseISO(`${selectedMonth}-01`), [selectedMonth]);

  // Filtrar reservas por el mes seleccionado
  const filteredBookings = useMemo(() => {
    if (!bookings.length) return [];
    return bookings.filter(booking => 
      booking.fecha && isSameMonth(parseISO(booking.fecha), currentMonthDate)
    );
  }, [bookings, currentMonthDate]);

  // Métricas calculadas con useMemo para optimizar rendimiento
  const { monthlyRevenue, bookingsByStatus, dailyRevenueData, statusData, hourlyData } = useMemo(() => {
    const revenue = filteredBookings.reduce((sum, booking) => sum + (booking.monto || 0), 0);

    const byStatus = {
      confirmada: filteredBookings.filter(b => b.estado === 'confirmada').length,
      pendiente: filteredBookings.filter(b => b.estado === 'pendiente').length,
      cancelada: filteredBookings.filter(b => b.estado === 'cancelada').length
    };

    // Preparar datos para el gráfico diario (Ingresos y Reservas)
    const start = startOfMonth(currentMonthDate);
    const end = endOfMonth(currentMonthDate);
    const daysInCurrentMonth = eachDayOfInterval({ start, end });

    const dailyDataMap = daysInCurrentMonth.reduce((acc, date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      acc[dateKey] = { day: format(date, "d"), ingresos: 0, reservas: 0 };
      return acc;
    }, {});

    filteredBookings.forEach(booking => {
      const dateKey = booking.fecha; // booking.fecha ya debe estar en yyyy-MM-dd
      if (dailyDataMap[dateKey]) {
        dailyDataMap[dateKey].ingresos += (booking.monto || 0);
        dailyDataMap[dateKey].reservas += 1;
      }
    });
    const dailyRevData = Object.values(dailyDataMap);

    // Datos para el gráfico de pastel de estados
    const statusPieData = [
      { name: 'Confirmadas', value: byStatus.confirmada, color: COLORS.confirmada },
      { name: 'Pendientes', value: byStatus.pendiente, color: COLORS.pendiente },
      { name: 'Canceladas', value: byStatus.cancelada, color: COLORS.cancelada }
    ].filter(item => item.value > 0);

    // Distribución por horas
    const hourlyCounts = {};
    filteredBookings.forEach(booking => {
      if (booking.hora) {
        const hour = booking.hora.substring(0, 2);
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
      }
    });
    const hourlyChartData = Object.entries(hourlyCounts)
      .map(([hour, count]) => ({ hora: `${hour}:00`, reservas: count }))
      .sort((a, b) => a.hora.localeCompare(b.hora));

    return {
      monthlyRevenue: revenue,
      bookingsByStatus: byStatus,
      dailyRevenueData: dailyRevData,
      statusData: statusPieData,
      hourlyData: hourlyChartData
    };
  }, [filteredBookings, currentMonthDate]); // Recalcular solo cuando filteredBookings o currentMonthDate cambien

  // Promedio por reserva
  const averageRevenuePerBooking = useMemo(() => 
    filteredBookings.length > 0 
      ? Math.round(monthlyRevenue / filteredBookings.length) 
      : 0
  , [monthlyRevenue, filteredBookings.length]);

  // Tasa de confirmación
  const confirmationRate = useMemo(() => 
    filteredBookings.length > 0 
      ? Math.round((bookingsByStatus.confirmada / filteredBookings.length) * 100) 
      : 0
  , [bookingsByStatus.confirmada, filteredBookings.length]);

  // Jugadores activos e inactivos
  const activePlayers = useMemo(() => players.filter(p => p.activo !== false).length, [players]);
  const inactivePlayers = useMemo(() => players.filter(p => p.activo === false).length, [players]);
  const playersWithPhone = useMemo(() => players.filter(p => p.telefono && p.telefono.trim()).length, [players]);


  // Función para exportar a CSV (usamos useCallback para memoizarla)
  const exportToCSV = useCallback(() => {
    if (filteredBookings.length === 0) {
      toast.info("No hay reservas para exportar en el período seleccionado.");
      return;
    }

    const csvData = [
      ['Fecha', 'Hora', 'Contacto', 'Teléfono', 'Jugadores', 'Monto', 'Estado'],
      ...filteredBookings.map(booking => [
        booking.fecha || '',
        booking.hora || '',
        booking.nombre_contacto || '',
        booking.telefono_contacto || '',
        booking.cantidad_jugadores || '',
        booking.monto || '',
        booking.estado || ''
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n'); // Asegurarse de escapar las comillas dobles en el contenido

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Liberar el objeto URL
    toast.success("Datos exportados a CSV.");
  }, [filteredBookings, selectedMonth]);

  // Generar opciones de meses dinámicamente
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => { // Últimos 12 meses
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = format(date, "yyyy-MM");
      return (
        <SelectItem key={period} value={period}>
          {format(date, "MMMM yyyy", { locale: es })}
        </SelectItem>
      );
    });
  }, []); // Se genera solo una vez

  // Componente de Skeleton para los gráficos
  const ChartSkeleton = () => (
    <div className="flex flex-col space-y-3 p-6">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-2/3 md:w-1/2 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="shadow-lg"><ChartSkeleton /></Card>
            <Card className="shadow-lg"><ChartSkeleton /></Card>
            <Card className="shadow-lg lg:col-span-2"><ChartSkeleton /></Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md shadow-lg border-red-400 border-2">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold mb-2">Error de Carga</CardTitle>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="destructive">
            Recargar Página
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
              Informes y Estadísticas
            </h1>
            <p className="text-gray-600">Análisis detallado del rendimiento de la cancha</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 bg-white shadow-sm">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="hover:bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
              disabled={filteredBookings.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Reservas</p>
                  <p className="text-3xl font-bold">{filteredBookings.length}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-200 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Ingresos del Mes</p>
                  <p className="text-3xl font-bold">${monthlyRevenue.toLocaleString('es-CL')}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-200 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Jugadores Registrados</p>
                  <p className="text-3xl font-bold">{players.length}</p>
                </div>
                <Users className="w-12 h-12 text-purple-200 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Promedio por Reserva</p>
                  <p className="text-3xl font-bold">
                    ${averageRevenuePerBooking.toLocaleString('es-CL')}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200 opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Daily Revenue & Bookings Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Ingresos y Reservas Diarias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="day" tick={{ fill: COLORS.general }} />
                    <YAxis yAxisId="left" orientation="left" stroke={COLORS.ingresos} />
                    <YAxis yAxisId="right" orientation="right" stroke={COLORS.reservas} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'ingresos' ? `$${value.toLocaleString('es-CL')}` : value,
                        name === 'ingresos' ? 'Ingresos' : 'Reservas'
                      ]}
                      labelFormatter={(label) => `Día ${label}`}
                      wrapperClassName="rounded-md shadow-md bg-white p-2 text-sm"
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ingresos" fill={COLORS.ingresos} name="Ingresos" />
                    <Bar yAxisId="right" dataKey="reservas" fill={COLORS.reservas} name="Reservas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 p-4">No hay datos de ingresos o reservas para este período.</p>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Estado de las Reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} reservas`, name]} 
                      wrapperClassName="rounded-md shadow-md bg-white p-2 text-sm"
                    />
                    <Legend 
                      align="right" 
                      verticalAlign="middle" 
                      layout="vertical" 
                      iconType="circle"
                      wrapperStyle={{ paddingLeft: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No hay datos de estado de reservas para este período.</p>
              )}
            </CardContent>
          </Card>

          {/* Hourly Distribution */}
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Clock className="w-5 h-5 text-blue-600" />
                Distribución de Reservas por Horarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hourlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="hora" tick={{ fill: COLORS.general }} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Reservas']} 
                      wrapperClassName="rounded-md shadow-md bg-white p-2 text-sm"
                    />
                    <Bar dataKey="reservas" fill={COLORS.reservas} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 p-4">No hay datos de reservas por horario para este período.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Estadísticas de Reservas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Confirmadas</span>
                <span className="font-semibold text-green-600">{bookingsByStatus.confirmada}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pendientes</span>
                <span className="font-semibold text-yellow-600">{bookingsByStatus.pendiente}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Canceladas</span>
                <span className="font-semibold text-red-600">{bookingsByStatus.cancelada}</span>
              </div>
              <div className="pt-4 border-t-2 border-gray-100 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Tasa de Confirmación</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {confirmationRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Estadísticas de Jugadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-green-500" /> Jugadores Activos</span>
                <span className="font-semibold text-green-600">{activePlayers}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-red-500" /> Jugadores Inactivos</span>
                <span className="font-semibold text-red-600">{inactivePlayers}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Con Teléfono Registrado</span>
                <span className="font-semibold text-blue-600">{playersWithPhone}</span>
              </div>
              <div className="pt-4 border-t-2 border-gray-100 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total de Jugadores Registrados</span>
                  <span className="font-bold text-indigo-600 text-lg">{players.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}