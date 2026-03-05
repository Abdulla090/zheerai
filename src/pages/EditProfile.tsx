import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

const EditProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form values when profile loads
  if (profile && !initialized) {
    setDisplayName(profile.display_name || "");
    setBio(profile.bio || "");
    setAvatarPreview(profile.avatar_url);
    setInitialized(true);
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "فایلەکە زۆر گەورەیە", description: "تکایە وێنەیەک هەڵبژێرە کە لە ٥ مێگابایت کەمتر بێت", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!displayName.trim()) {
      toast({ title: "ناوی نمایش پێویستە", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "پرۆفایل نوێ کرایەوە ✓" });
      navigate("/profile");
    } catch (err: any) {
      toast({ title: "هەڵە ڕوویدا", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || profileLoading) return <div className="py-20 text-center"><Skeleton className="h-8 w-48 mx-auto" /></div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="py-10 md:py-14">
      <div className="container max-w-xl">
        <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate("/profile")}>
          <ArrowRight className="h-4 w-4" />
          گەڕانەوە بۆ پرۆفایل
        </Button>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">دەستکاریکردنی پرۆفایل</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative h-24 w-24 cursor-pointer rounded-2xl border-2 border-dashed border-border bg-accent hover:border-primary/50 transition-colors overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-xs text-muted-foreground">کلیک بکە بۆ گۆڕینی وێنەی پرۆفایل</p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">ناوی نمایش</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ناوەکەت بنووسە..."
                  dir="rtl"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">بایۆ</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="کورتەیەک دەربارەی خۆت بنووسە..."
                  rows={4}
                  dir="rtl"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label>ئیمەیل</Label>
                <Input value={user.email || ""} disabled className="opacity-60" />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "پاشەکەوتکردن..." : "پاشەکەوتکردن"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
