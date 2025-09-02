import { useState, useEffect } from "react";
import { ArrowLeft, Instagram, MessageCircle, Save, Edit, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { useCheckIns } from "@/hooks/useCheckIns";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { checkIns } = useCheckIns();
  
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    instagram: "",
    whatsapp: "",
    avatar: "",
    avatarUrl: "",
    totalCheckins: 0,
    placesVisited: 0,
    joinedDate: ""
  });

  const [editProfile, setEditProfile] = useState(profile);

  // Authentication and data loading
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
          return;
        }

        // Load user profile data
        setTimeout(() => {
          loadUserProfile(session.user.id);
        }, 0);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      loadUserProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
        return;
      }

      if (userData) {
        const profileData = {
          name: userData.name || "",
          bio: userData.bio || "",
          instagram: userData.instagram || "",
          whatsapp: userData.whatsapp || "",
          avatar: userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : "",
          avatarUrl: userData.avatar_url || "",
          totalCheckins: 0, // Will be updated by checkIns hook
          placesVisited: 0, // Will be updated by checkIns hook
          joinedDate: userData.joined_at ? 
            new Date(userData.joined_at).toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            }) : ""
        };
        setProfile({
          ...profileData,
          totalCheckins: checkIns.length,
          placesVisited: new Set(checkIns.map(ci => ci.city || ci.formatted_address)).size
        });
        setEditProfile({
          ...profileData,
          totalCheckins: checkIns.length,
          placesVisited: new Set(checkIns.map(ci => ci.city || ci.formatted_address)).size
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          name: editProfile.name.trim(),
          bio: editProfile.bio.trim(),
          instagram: editProfile.instagram.trim(),
          whatsapp: editProfile.whatsapp.trim(),
          avatar_url: editProfile.avatarUrl
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
        return;
      }

      setProfile({
        ...editProfile,
        avatar: editProfile.name ? editProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : ""
      });
      setIsEditing(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const formatWhatsApp = (phone: string) => {
    // Remove tudo que não é dígito
    const cleaned = phone.replace(/\D/g, '');
    // Aplica máscara (XX) XXXXX-XXXX
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatWhatsApp(value);
    setEditProfile({ ...editProfile, whatsapp: formatted });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Meu Perfil</h1>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              disabled={loading}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {loading ? "Salvando..." : "Salvar"}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                {editProfile.avatarUrl || profile.avatarUrl ? (
                  <AvatarImage src={isEditing ? editProfile.avatarUrl : profile.avatarUrl} />
                ) : (
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">
                    {profile.avatar}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing ? (
                <div className="w-full max-w-sm space-y-3">
                  <div>
                    <Label htmlFor="avatar">Foto de Perfil</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setEditProfile({ ...editProfile, avatarUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editProfile.bio}
                      onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                      placeholder="Conte um pouco sobre você..."
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground mt-2 max-w-sm">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-gradient-card shadow-card border-0">
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
                    value={editProfile.instagram}
                    onChange={(e) => setEditProfile({ ...editProfile, instagram: e.target.value })}
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
                    value={editProfile.whatsapp}
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

        {/* Stats */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">{profile.totalCheckins}</p>
                <p className="text-sm text-muted-foreground">Check-ins</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">{profile.placesVisited}</p>
                <p className="text-sm text-muted-foreground">Lugares</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">4.8</p>
                <p className="text-sm text-muted-foreground">Avaliação</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Membro desde {profile.joinedDate}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Check-ins */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              Timeline de Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkIns.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {checkIn.formatted_address}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(checkIn.checked_in_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Nenhum check-in realizado ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel Button - Only show when editing */}
        {isEditing && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        )}
      </main>
    </div>
  );
};

export default Profile;