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

export function useNearbyUsers(): NearbyUsersHook {
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = async (latitude: number, longitude: number, radiusMeters = 1000) => {
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