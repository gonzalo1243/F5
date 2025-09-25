import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Player } from "@/entities/Player";
import { Booking } from "@/entities/Booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, TrendingUp, Trophy, Activity, PlusCircle, UserPlus, BarChart2 } from "lucide-react"; // Importar iconos adicionales
import { format, parseISO, isSameDay, startOfMonth, isSameMonth } from "date-fns"; // Mejorar importaciones de date-fns
import { es } from "date-fns/locale";

// Importar componentes de dashboard
import StatsCard from "../components/dashboard/StatsCard";
import RecentBookings from "../components/dashboard/RecentBookings";
import PlayerStats from "../components/dashboard/PlayerStats";

export default function Dashboard() {
    const [players, setPlayers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Nuevo estado para manejar errores

    // Constantes de fecha para evitar recalcularlas en cada render
    const today = useMemo(() => new Date(), []);
    const todayFormatted = useMemo(() => format(today, "yyyy-MM-dd"), [today]);
    const thisMonthStart = useMemo(() => startOfMonth(today), [today]);
    const thisMonthFormatted = useMemo(() => format(thisMonthStart, "yyyy-MM"), [thisMonthStart]);


    // useCallback para memorizar la función loadData
    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null); // Resetear errores antes de una nueva carga
        try {
            const [playersData, bookingsData] = await Promise.all([
                Player.list("-created_date"), // Obtener todos los jugadores
                Booking.list("-created_date", 50) // Obtener las 50 reservas más recientes
            ]);
            setPlayers(playersData || []); // Asegurarse de que sea un array
            setBookings(bookingsData || []); // Asegurarse de que sea un array
        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError("No se pudieron cargar los datos. Intenta de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependencias vacías, solo se crea una vez

    // useEffect para cargar los datos al montar el componente
    useEffect(() => {
        loadData();
    }, [loadData]); // Ejecutar cuando loadData cambie (solo al inicio)


    // --- Cálculos de estadísticas usando useMemo para optimizar ---

    const monthlyBookings = useMemo(() => {
        return bookings.filter(booking => 
            booking.fecha && isSameMonth(parseISO(booking.fecha), thisMonthStart)
        );
    }, [bookings, thisMonthStart]);

    const monthlyRevenue = useMemo(() => {
        return monthlyBookings.reduce((sum, booking) => 
            sum + (booking.monto || 0), 0
        );
    }, [monthlyBookings]);

    const todayBookings = useMemo(() => {
        return bookings.filter(booking => 
            booking.fecha && isSameDay(parseISO(booking.fecha), today)
        );
    }, [bookings, today]);

    const activePlayers = useMemo(() => {
        return players.filter(player => player.activo !== false);
    }, [players]);

    const newPlayersThisMonth = useMemo(() => {
        return players.filter(player => {
            const createdDate = player.created_date ? parseISO(player.created_date) : null;
            return createdDate && isSameMonth(createdDate, thisMonthStart);
        }).length;
    }, [players, thisMonthStart]);

    const averageBookingValue = useMemo(() => {
        return monthlyBookings.length > 0 
            ? Math.round(monthlyRevenue / monthlyBookings.length) 
            : 0;
    }, [monthlyRevenue, monthlyBookings.length]);

    // Función de renderizado condicional para el contenido
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
                    <p className="ml-4 text-gray-700 text-lg">Cargando datos...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-red-600">
                    <p className="text-xl font-semibold mb-4">{error}</p>
                    <button 
                        onClick={loadData} 
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        return (
            <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Jugadores Activos"
                        value={activePlayers.length}
                        icon={Users}
                        color="bg-blue-500"
                        trend={`+${newPlayersThisMonth} este mes`}
                    />
                    
                    <StatsCard
                        title="Reservas Hoy"
                        value={todayBookings.length}
                        icon={Calendar}
                        color="bg-green-500"
                        trend={`${todayBookings.filter(b => b.estado === 'confirmada').length} confirmadas`}
                    />
                    
                    <StatsCard
                        title="Ingresos del Mes"
                        value={`$${monthlyRevenue.toLocaleString('es-CL')}`} /* Formato de moneda localizado */
                        icon={DollarSign}
                        color="bg-emerald-500"
                        trend={`${monthlyBookings.length} reservas`}
                    />
                    
                    <StatsCard
                        title="Promedio por Reserva"
                        value={`$${averageBookingValue.toLocaleString('es-CL')}`}
                        icon={TrendingUp}
                        color="bg-purple-500"
                        trend="Mes actual"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Bookings */}
                    <div className="lg:col-span-2">
                        <RecentBookings 
                            bookings={bookings.slice(0, 8)} // Mostrar solo las 8 más recientes para la UI
                            isLoading={isLoading} 
                        />
                    </div>

                    {/* Player Stats */}
                    <div>
                        <PlayerStats 
                            players={players} 
                            isLoading={isLoading} 
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <Card className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Activity className="w-6 h-6" />
                            Acciones Rápidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200 cursor-pointer flex items-center gap-3">
                                <PlusCircle className="w-5 h-5" />
                                <div>
                                    <h3 className="font-semibold mb-1">Nueva Reserva</h3>
                                    <p className="text-sm opacity-90">Agregar una reserva para hoy</p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200 cursor-pointer flex items-center gap-3">
                                <UserPlus className="w-5 h-5" />
                                <div>
                                    <h3 className="font-semibold mb-1">Registrar Jugador</h3>
                                    <p className="text-sm opacity-90">Dar de alta un nuevo jugador</p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-200 cursor-pointer flex items-center gap-3">
                                <BarChart2 className="w-5 h-5" />
                                <div>
                                    <h3 className="font-semibold mb-1">Ver Informes</h3>
                                    <p className="text-sm opacity-90">Consultar estadísticas detalladas</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </>
        );
    };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-8 h-8 text-green-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                </div>

                {renderContent()} {/* Renderizado condicional */}
            </div>
        </div>
    );
}