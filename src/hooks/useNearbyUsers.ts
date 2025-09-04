import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NearbyUser {
  id: string;
  name: string;
  avatar_url?: string;
  street_name?: string;
  street_number?: string;
  distance_meters: number;
  last_location_update: string;
}

interface NearbyUsersHook {
  users: NearbyUser[];
  loading: boolean;
  error: string | null;
  refreshUsers: (lat: number, lon: number, radius?: number) => Promise<void>;
}

/**
 * Hook para buscar e gerenciar usuários próximos.
 * @returns {NearbyUsersHook} Estado e funções para usuários próximos
 */
export function useNearbyUsers(): NearbyUsersHook {
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca usuários próximos a partir de uma localização.
   * @param {number} latitude - Latitude do usuário
   * @param {number} longitude - Longitude do usuário
   * @param {number} [radiusMeters=1000] - Raio de busca em metros
   * @returns {Promise<void>}
   */
  const refreshUsers = async (latitude: number, longitude: number, radiusMeters = 1000) => {
    // Validação básica de entrada
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      setError('Latitude e longitude devem ser números.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setError('Usuário não autenticado');
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_nearby_users', {
        user_latitude: latitude,
        user_longitude: longitude,
        radius_meters: radiusMeters
      });

      if (rpcError) {
        console.error('Erro ao buscar usuários próximos:', rpcError);
        setError('Erro ao buscar usuários próximos');
        return;
      }

      // Filtrar usuários que fizeram check-in nos últimos 5 minutos
      // (já está sendo feito na função do banco de dados)
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários próximos:', error);
      setError('Erro inesperado ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    refreshUsers
  };
}