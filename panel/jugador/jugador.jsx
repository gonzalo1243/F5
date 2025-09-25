// PlayersPage.jsx (usando el custom hook)
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react"; // Importar Loader2
import { AnimatePresence } from "framer-motion";

import PlayerForm from "../components/players/PlayerForm";
import PlayersList from "../components/players/PlayersList";
import { usePlayers } from "../hooks/usePlayers"; // Importar el custom hook

export default function PlayersPage() {
const {
    players,
    filteredPlayers,
    searchTerm,
    showForm,
    editingPlayer,
    isLoading,
    error,
    handleSearchChange,
    handleSubmit,
    handleToggleStatus,
    handleEdit,
    handleAddPlayer,
    handleCancelForm,
} = usePlayers();

return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
    <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Jugadores</h1>
            <p className="text-gray-600">Administra la información de todos los jugadores registrados</p>
        </div>

        <Button
            onClick={handleAddPlayer}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Jugador
        </Button>
        </div>

        {/* Mensaje de Error */}
        {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
        </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            />
        </div>
        <div className="text-sm text-gray-500">
            {filteredPlayers.length} de {players.length} jugadores
        </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
        {showForm && (
            <PlayerForm
            player={editingPlayer}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            />
        )}
        </AnimatePresence>

        {/* Players List */}
        {isLoading && !players.length ? ( // Mostrar spinner solo al cargar por primera vez o si no hay jugadores
            <div className="text-center py-8 text-gray-500">
                <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
                Cargando jugadores...
            </div>
        ) : (
            <PlayersList
                players={filteredPlayers}
                isLoading={isLoading} // isLoading puede ser útil para deshabilitar interacciones
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
            />
        )}
    </div>
    </div>
);
}