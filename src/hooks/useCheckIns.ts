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
  const saveCheckIn = async (locationData: any): Promise<boolean> => {
    if (!canCheckIn) {
      toast({
        title: "Check-in não permitido",
        description: "Aguarde 5 minutos entre check-ins.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase.rpc('save_checkin', {
        p_latitude: locationData.latitude,
        p_longitude: locationData.longitude,
        p_street_name: locationData.street || null,
        p_street_number: locationData.houseNumber || null,
        p_city: locationData.city || null,
        p_state: locationData.state || null,
        p_country: locationData.country || null,
        p_postal_code: locationData.postalCode || null,
        p_formatted_address: locationData.formattedAddress || null
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