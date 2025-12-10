import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useToast } from "../hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();

  // Check if input is NISN (only numbers)
  const isNISN = /^\d+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login with email/NISN and password
      const user = await login(email, password);
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${user.name}!`,
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login gagal",
        description:
          error.response?.data?.message ||
          (isNISN ? "NISN atau password salah" : "Email atau password salah"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      <Card className="w-full max-w-md glass border-none shadow-2xl relative z-10">
        <CardHeader className="space-y-3 text-center pb-8">
          {/* Logo */}
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <img
              src="/logo website.png"
              alt="Logo SMKS PGRI Banyuputih"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          <CardTitle className="text-3xl font-bold">
            <span className="gradient-text">Computer Based Test</span>
          </CardTitle>
          <CardDescription className="text-base">
            SMKS PGRI Banyuputih
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                {isNISN ? "NISN" : "Username / Email"}
              </Label>
              <Input
                id="email"
                type="text"
                placeholder={isNISN ? "Masukkan NISN" : "username atau email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 glass border-slate-300 focus:border-purple-500 focus:ring-purple-500"
              />
              {isNISN && (
                <p className="text-xs text-blue-600">
                  Login sebagai siswa dengan NISN
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 glass border-slate-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
          {/* <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
            <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Demo Accounts
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span className="text-slate-500">admin@cbt.com / password</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Guru:</span>
                <span className="text-slate-500">guru@cbt.com / password</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Siswa:</span>
                <span className="text-slate-500">siswa@cbt.com / password</span>
              </div>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
