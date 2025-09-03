import { useState } from "react";
import { ArrowLeft, Save, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ContactInfo } from "@/components/profile/ContactInfo";
import { StatsCard } from "@/components/profile/StatsCard";
import { CheckInTimeline } from "@/components/profile/CheckInTimeline";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    profile, 
    editProfile, 
    loading, 
    user,
    session,
    updateEditProfile, 
    saveProfile, 
    resetEditProfile,
    checkIns 
  } = useProfile();

  const handleSave = async () => {
    const success = await saveProfile();
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    resetEditProfile();
    setIsEditing(false);
  };

  if (!session || !user) {
    navigate("/auth");
    return null;
  }

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
            <div className="flex items-center space-x-2">
              <ThemeToggle />
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="bg-card/80 backdrop-blur-sm shadow-card border">
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
                              updateEditProfile('avatarUrl', ev.target?.result as string);
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
                        onChange={(e) => updateEditProfile('name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editProfile.bio}
                        onChange={(e) => updateEditProfile('bio', e.target.value)}
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
        <ContactInfo
          profile={profile}
          editProfile={editProfile}
          isEditing={isEditing}
          onUpdateEdit={updateEditProfile}
        />

        {/* Stats */}
        <StatsCard
          totalCheckins={profile.totalCheckins}
          placesVisited={profile.placesVisited}
          joinedDate={profile.joinedDate}
        />

        {/* Timeline de Check-ins */}
        <CheckInTimeline checkIns={checkIns} />

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