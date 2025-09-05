import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useCheckIns } from "@/hooks/useCheckIns"
import type { User, Session } from "@supabase/supabase-js"

interface Profile {
  name: string
  bio: string
  instagram: string
  whatsapp: string
  avatar: string
  avatarUrl: string
  totalCheckins: number
  placesVisited: number
  joinedDate: string
}

export function useProfile() {
  const { toast } = useToast()
  const { checkIns } = useCheckIns()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  
  const [profile, setProfile] = useState<Profile>({
    name: "",
    bio: "",
    instagram: "",
    whatsapp: "",
    avatar: "",
    avatarUrl: "",
    totalCheckins: 0,
    placesVisited: 0,
    joinedDate: ""
  })

  const [editProfile, setEditProfile] = useState(profile)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id)
          }, 0)
        }
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        })
        return
      }

      if (userData) {
        const profileData: Profile = {
          name: userData.name || "",
          bio: userData.bio || "",
          instagram: userData.instagram || "",
          whatsapp: userData.whatsapp || "",
          avatar: userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : "",
          avatarUrl: userData.avatar_url || "",
          totalCheckins: checkIns.length,
          placesVisited: new Set(checkIns.map(ci => ci.city || ci.formatted_address)).size,
          joinedDate: userData.joined_at ? 
            new Date(userData.joined_at).toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            }) : ""
        }
        setProfile(profileData)
        setEditProfile(profileData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar perfil.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return false

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('users')
        .update({
          name: editProfile.name.trim(),
          bio: editProfile.bio.trim(),
          instagram: editProfile.instagram.trim(),
          whatsapp: editProfile.whatsapp.trim(),
          avatar_url: editProfile.avatarUrl
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast({
          title: "Erro",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        })
        return false
      }

      setProfile({
        ...editProfile,
        avatar: editProfile.name ? editProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : ""
      })
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      })
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar perfil.",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateEditProfile = (field: string, value: string) => {
    setEditProfile(prev => ({ ...prev, [field]: value }))
  }

  const resetEditProfile = () => {
    setEditProfile(profile)
  }

  return {
    profile,
    editProfile,
    loading,
    user,
    session,
    updateEditProfile,
    saveProfile,
    resetEditProfile,
    checkIns
  }
}