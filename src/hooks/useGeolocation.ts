import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  streetName?: string;
  streetNumber?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  formattedAddress?: string;
}

interface GeolocationHook {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => void;
}

/**
 * Hook para obter e gerenciar a localização geográfica do usuário.
 * @returns {GeolocationHook} Estado e funções de localização
 */
export function useGeolocation(): GeolocationHook {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Realiza a geocodificação reversa para obter dados detalhados do endereço.
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<LocationData>} Dados de localização formatados
   */
  const reverseGeocode = async (lat: number, lon: number): Promise<LocationData> => {
    // Enhanced security validation
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      throw new Error('Latitude e longitude devem ser números válidos.');
    }
    
    // Validate coordinate ranges for security
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude inválida: deve estar entre -90 e 90.');
    }
    
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude inválida: deve estar entre -180 e 180.');
    }
    
    try {
      // Encode parameters to prevent injection
      const encodedLat = encodeURIComponent(lat.toString());
      const encodedLon = encodeURIComponent(lon.toString());
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodedLat}&lon=${encodedLon}&zoom=18&addressdetails=1&accept-language=pt-BR`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Location-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao obter informações do endereço');
      }

      const data = await response.json();
      
      // Extrair informações detalhadas do endereço
      const address = data.address || {};
      const streetNumber = address.house_number || '';
      const streetName = address.road || address.street || '';
      
      // Criar endereço formatado mais legível
      let formattedAddress = '';
      if (streetName && streetNumber) {
        formattedAddress = `${streetName}, ${streetNumber}`;
      } else if (streetName) {
        formattedAddress = streetName;
      }
      
      if (address.suburb || address.neighbourhood) {
        formattedAddress += formattedAddress ? ` - ${address.suburb || address.neighbourhood}` : (address.suburb || address.neighbourhood);
      }
      
      if (address.city || address.town || address.village) {
        const cityName = address.city || address.town || address.village;
        formattedAddress += formattedAddress ? `, ${cityName}` : cityName;
      }

      return {
        latitude: lat,
        longitude: lon,
        streetName,
        streetNumber,
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        postalCode: address.postcode || '',
        country: address.country || 'Brasil',
        formattedAddress: formattedAddress || data.display_name || 'Localização não identificada'
      };
    } catch (error) {
      console.error('Erro ao fazer geocodificação reversa:', error);
      return {
        latitude: lat,
        longitude: lon,
        formattedAddress: `${lat.toFixed(6)}, ${lon.toFixed(6)}`
      };
    }
  };

  /**
   * Salva a localização do usuário no banco de dados.
   * @param {LocationData} locationData - Dados de localização
   */
  const saveLocationToDatabase = async (locationData: LocationData) => {
    // Validação básica de entrada
    if (!locationData || typeof locationData.latitude !== 'number' || typeof locationData.longitude !== 'number') {
      console.warn('Dados de localização inválidos para salvar no banco.');
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Usuário não autenticado - não salvando localização');
        return;
      }

      const { error } = await supabase.rpc('update_user_location', {
        user_id: user.id,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        street_name_param: locationData.streetName,
        street_number_param: locationData.streetNumber,
        city_param: locationData.city,
        state_param: locationData.state,
        postal_code_param: locationData.postalCode,
        country_param: locationData.country
      });

      if (error) {
        console.error('Erro ao salvar localização no banco:', error);
      } else {
        console.log('Localização salva no banco de dados');
      }
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste navegador');
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // Cache por 5 minutos
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const locationData = await reverseGeocode(latitude, longitude);
      
      setLocation(locationData);
      
      // Salvar no banco de dados se o usuário estiver logado
      await saveLocationToDatabase(locationData);
      
    } catch (error) {
      let errorMessage = 'Erro ao obter localização';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Acesso à localização negado pelo usuário';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização não disponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização';
            break;
          default:
            errorMessage = 'Erro desconhecido ao obter localização';
        }
      }
      
      setError(errorMessage);
      console.error('Erro de geolocalização:', error);
      
      toast({
        title: 'Erro de localização',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    getCurrentLocation();
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    refreshLocation
  };
}