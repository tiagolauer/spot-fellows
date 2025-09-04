import { useState } from "react";
import { X, Lock, CreditCard, Instagram, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, isValidPhone } from "@/lib/security";

interface User {
  id: number;
  name: string; // nome completo
  avatar: string;
  avatarUrl?: string;
  checkedInAt: Date;
  instagram?: string;
  whatsapp?: string;
  contactUnlocked?: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onPaymentSuccess: (userId: number) => void;
}

const PaymentModal = ({ isOpen, onClose, user, onPaymentSuccess }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  // Check what contact info is available
  const hasInstagram = user.instagram && user.instagram.trim() !== '';
  const hasWhatsApp = user.whatsapp && user.whatsapp.trim() !== '';
  const hasLastName = user.name && user.name.split(' ').length > 1;

  const handlePayment = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    // Simular processamento do pagamento
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(user.id);
      onClose();
      toast({
        title: "Pagamento realizado!",
        description: `Contato de ${user.name} desbloqueado com sucesso.`,
      });
    }, 2000);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-primary" />
            Desbloquear Contato
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name.split(' ')[0]}</p>
              <p className="text-sm text-muted-foreground">Contato bloqueado</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="text-center space-y-4">
            <div className="p-6 bg-gradient-card rounded-lg border">
              <div className="text-3xl font-bold text-primary mb-2">R$ 5,00</div>
              <p className="text-sm text-muted-foreground">
                Pagamento único para desbloquear informações de contato
              </p>
            </div>

            <div className="text-left space-y-2">
              <p className="text-sm font-medium">Informações disponíveis:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {hasLastName && (
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2 text-green-500" />
                    Nome completo
                  </li>
                )}
                {hasInstagram && (
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2 text-green-500" />
                    Instagram
                  </li>
                )}
                {hasWhatsApp && (
                  <li className="flex items-center">
                    <Check className="h-3 w-3 mr-2 text-green-500" />
                    WhatsApp
                  </li>
                )}
                {!hasInstagram && !hasWhatsApp && !hasLastName && (
                  <li className="flex items-center text-orange-600">
                    <X className="h-3 w-3 mr-2" />
                    Nenhuma informação adicional cadastrada
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-hero hover:shadow-glow"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar R$ 5,00
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Pagamento seguro processado via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface UserCardProps {
  user: User;
  onUnlockContact: (user: User) => void;
  isCurrentUser?: boolean;
}

const UserCard = ({ user, onUnlockContact, isCurrentUser = false }: UserCardProps) => {
  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    return `${minutes} min atrás`;
  };

  const hasContacts = user.instagram || user.whatsapp;
  const showContacts = isCurrentUser || (user.contactUnlocked && hasContacts);

  // Separar nome e sobrenome
  const [firstName, ...rest] = user.name.split(' ');
  const lastName = rest.join(' ');


  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-card border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} />
              ) : (
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                  {user.avatar}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-medium">
                {firstName}
                {showContacts && lastName ? ` ${lastName}` : ''}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                {formatTimeAgo(user.checkedInAt)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Ativo
            </Badge>
          </div>
        </div>

        {/* Contact Section */}
        {!isCurrentUser && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-center py-3">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Perfil bloqueado</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnlockContact(user)}
                className="bg-primary/5 border-primary/20 hover:bg-primary/10"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Desbloquear por R$ 5,00
              </Button>
            </div>
          </div>
        )}

        {isCurrentUser && hasContacts && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center text-green-600">
                <Check className="h-4 w-4 mr-1" />
                Seus contatos
              </p>
              <div className="grid grid-cols-1 gap-2">
                {user.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => window.open(`https://instagram.com/${user.instagram?.replace('@', '')}`, '_blank')}
                  >
                    <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                    {user.instagram}
                  </Button>
                )}
                {user.whatsapp && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      const cleanPhone = user.whatsapp?.replace(/\D/g, '') || '';
                      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                    {user.whatsapp}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { UserCard, PaymentModal };
export type { User };