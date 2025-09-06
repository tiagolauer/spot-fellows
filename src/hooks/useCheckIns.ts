import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CheckIn {
  id: string;
  formatted_address: string;
  street_name?: string;
  street_number?: string;
  city?: string;
  state?: string;
  checked_in_at: string;
}

interface CheckInHook {
  checkIns: CheckIn[];
  loading: boolean;
  canCheckIn: boolean;
  nextCheckInTime: Date | null;
  saveCheckIn: (locationData: any) => Promise<boolean>;
  refreshCheckIns: () => Promise<void>;
}

/**
 * Hook para gerenciar check-ins do usuário.
 * @returns {CheckInHook} Estado e funções para check-ins
 */
export function useCheckIns(): CheckInHook {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [nextCheckInTime, setNextCheckInTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load user's check-ins
  const refreshCheckIns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('checked_in_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading check-ins:', error);
        return;
      }

      setCheckIns(data || []);
      
      // Check cooldown for next check-in
      if (data && data.length > 0) {
        const lastCheckIn = new Date(data[0].checked_in_at);
        const nextAllowed = new Date(lastCheckIn.getTime() + 5 * 60 * 1000); // 5 minutes
        const now = new Date();
        
        if (now < nextAllowed) {
          setCanCheckIn(false);
          setNextCheckInTime(nextAllowed);
          
          // Set timeout to enable check-in when cooldown expires
          const timeoutMs = nextAllowed.getTime() - now.getTime();
          setTimeout(() => {
            setCanCheckIn(true);
            setNextCheckInTime(null);
          }, timeoutMs);
        } else {
          setCanCheckIn(true);
          setNextCheckInTime(null);
        }
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save a new check-in
  /**
   * Salva um novo check-in do usuário.
   * @param {object} locationData - Dados de localização do check-in
   * @returns {Promise<boolean>} Indica se o check-in foi realizado com sucesso
   */
  const saveCheckIn = async (locationData: any): Promise<boolean> => {
    // Enhanced security validation
    if (!locationData || typeof locationData !== 'object') {
      toast({
        title: "Dados inválidos",
        description: "Dados de localização são obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    // Validate coordinates with proper type checking and ranges
    const { latitude, longitude } = locationData;
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
        isNaN(latitude) || isNaN(longitude) ||
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      toast({
        title: "Coordenadas inválidas",
        description: "Latitude e longitude devem ser números válidos.",
        variant: "destructive"
      });
      return false;
    }

    if (!canCheckIn) {
      toast({
        title: "Check-in não permitido",
        description: "Aguarde 5 minutos entre check-ins.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Sanitize string inputs to prevent injection
      const sanitizeString = (str: any) => {
        if (typeof str !== 'string') return null;
        return str.trim().substring(0, 255); // Limit length
      };

      const { error } = await supabase.rpc('save_checkin', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_street_name: sanitizeString(locationData.street),
        p_street_number: sanitizeString(locationData.houseNumber),
        p_city: sanitizeString(locationData.city),
        p_state: sanitizeString(locationData.state),
        p_country: sanitizeString(locationData.country),
        p_postal_code: sanitizeString(locationData.postalCode),
        p_formatted_address: sanitizeString(locationData.formattedAddress)
      });

      if (error) {
        if (error.message.includes('aguardar 5 minutos')) {
          toast({
            title: "Check-in muito rápido",
            description: "Aguarde 5 minutos entre check-ins.",
            variant: "destructive"
          });
          return false;
        }
        throw error;
      }

      // Refresh check-ins to update the list and cooldown
      await refreshCheckIns();
      
      toast({
        title: "Check-in realizado!",
        description: `Você fez check-in em: ${locationData.formattedAddress}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast({
        title: "Erro no check-in",
        description: "Não foi possível realizar o check-in. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Load check-ins on mount
  useEffect(() => {
    refreshCheckIns();
  }, []);

  return {
    checkIns,
    loading,
    canCheckIn,
    nextCheckInTime,
    saveCheckIn,
    refreshCheckIns
  };
}