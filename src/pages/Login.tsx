import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("بە سەرکەوتوویی چوویتەژوورەوە");
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error("هەڵەیەک ڕوویدا لە چوونەژوورەوە بە گووگڵ");
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    setGuestLoading(false);
    if (error) {
      toast.error("هەڵەیەک ڕوویدا لە چوونەژوورەوە وەک میوان");
    } else {
      toast.success("بە سەرکەوتوویی وەک میوان چوویتەژوورەوە");
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md px-4"
      >
        <Card className="border-border">
          <CardHeader className="text-center">
            <Link to="/" className="mb-4 inline-block text-xl font-bold text-primary">Kurdistan AI</Link>
            <CardTitle className="text-xl">چوونەژوورەوە</CardTitle>
            <CardDescription>بۆ بەردەوامبوون، چوونەژوورەوە بکە</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Google */}
            <Button variant="outline" className="w-full gap-2" onClick={handleGoogleLogin}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              چوونەژوورەوە بە گووگڵ
            </Button>

            {/* Guest Login */}
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={handleGuestLogin}
              disabled={guestLoading}
            >
              <UserRound className="h-4 w-4" />
              {guestLoading ? "چاوەڕوان بە..." : "چوونەژوورەوە وەک میوان"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground -mt-3">
              میوانەکان تەنها دەتوانن پرسیار بنێرن
            </p>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">یان</span>
              <Separator className="flex-1" />
            </div>

            {/* Email/Password */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ئیمەیل</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    dir="ltr"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">وشەی نهێنی</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10"
                    dir="ltr"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="text-left">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  وشەی نهێنیت لەبیرکردووە؟
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "چاوەڕوان بە..." : "چوونەژوورەوە"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              هەژمارت نییە؟{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                تۆمارکردن
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
