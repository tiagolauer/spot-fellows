import { Instagram, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ContactInfoProps {
  profile: {
    instagram: string
    whatsapp: string
  }
  editProfile?: {
    instagram: string
    whatsapp: string
  }
  isEditing: boolean
  onUpdateEdit?: (field: string, value: string) => void
}

export function ContactInfo({ profile, editProfile, isEditing, onUpdateEdit }: ContactInfoProps) {
  const formatWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatWhatsApp(value);
    onUpdateEdit?.('whatsapp', formatted);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-card border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-primary" />
          Informações de Contato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="instagram" className="flex items-center">
                <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={editProfile?.instagram || ''}
                onChange={(e) => onUpdateEdit?.('instagram', e.target.value)}
                placeholder="@seuusuario"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                value={editProfile?.whatsapp || ''}
                onChange={(e) => handleWhatsAppChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.instagram ? (
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center">
                  <Instagram className="h-5 w-5 mr-3 text-pink-500" />
                  <span className="font-medium">{profile.instagram}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://instagram.com/${profile.instagram.replace('@', '')}`, '_blank')}
                >
                  Abrir
                </Button>
              </div>
            ) : (
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <Instagram className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground">Instagram não informado</span>
              </div>
            )}

            {profile.whatsapp ? (
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-3 text-green-500" />
                  <span className="font-medium">{profile.whatsapp}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const cleanPhone = profile.whatsapp.replace(/\D/g, '');
                    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                  }}
                >
                  Enviar
                </Button>
              </div>
            ) : (
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <MessageCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground">WhatsApp não informado</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}