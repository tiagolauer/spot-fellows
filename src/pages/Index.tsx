import { useState } from "react";
import { MapPin, Users, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Mock data para demonstração
const mockUsers = [
  { id: 1, name: "Ana Silva", avatar: "AS", checkedInAt: new Date(Date.now() - 120000) },
  { id: 2, name: "Carlos Lima", avatar: "CL", checkedInAt: new Date(Date.now() - 240000) },
  { id: 3, name: "Maria Santos", avatar: "MS", checkedInAt: new Date(Date.now() - 180000) },
];

const mockLocation = "Shopping Center Norte";

const Index = () => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [currentUser] = useState({ id: 0, name: "Você", avatar: "VC" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckIn = () => {
    setHasCheckedIn(true);
    toast({
      title: "Check-in realizado!",
      description: `Você fez check-in em ${mockLocation}`,
    });
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    return `${minutes} min atrás`;
  };

  const activeUsers = hasCheckedIn 
    ? [{ ...currentUser, checkedInAt: new Date() }, ...mockUsers]
    : mockUsers;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              I've Been Here
            </h1>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Location Card */}
        <Card className="bg-gradient-card shadow-card border-0">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">{mockLocation}</h2>
            </div>
            <p className="text-muted-foreground">
              Localização atual detectada
            </p>
          </CardContent>
        </Card>

        {/* Check-in Button */}
        <div className="flex justify-center">
          <Button
            variant={hasCheckedIn ? "secondary" : "default"}
            size="lg"
            onClick={handleCheckIn}
            disabled={hasCheckedIn}
            className={`
              h-24 w-64 text-xl font-bold rounded-2xl
              ${hasCheckedIn 
                ? "bg-secondary text-secondary-foreground" 
                : "bg-gradient-hero hover:shadow-glow animate-pulse-glow"
              }
            `}
          >
            {hasCheckedIn ? "✓ Você está aqui!" : "Eu estive aqui"}
          </Button>
        </div>

        {/* Who's Here Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Quem está aqui?
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUsers(!showUsers)}
            >
              {showUsers ? "Ocultar" : "Ver todos"}
            </Button>
          </div>

          {showUsers && (
            <div className="space-y-3">
              {activeUsers.map((user, index) => (
                <Card key={user.id || "current-user"} className="bg-gradient-card shadow-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {index === 0 && hasCheckedIn ? "Agora" : formatTimeAgo(user.checkedInAt)}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        Ativo
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!showUsers && (
            <Card className="bg-gradient-card shadow-card border-0">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="flex -space-x-2">
                    {activeUsers.slice(0, 3).map((user, index) => (
                      <Avatar key={index} className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-bold">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {activeUsers.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeUsers.length === 1 
                    ? "pessoa está aqui agora" 
                    : "pessoas estão aqui agora"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;