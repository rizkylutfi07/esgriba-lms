'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast({
        title: 'Login berhasil',
        description: `Selamat datang, ${response.user.name}!`,
      });

      // Redirect based on role
      const role = response.user.role.toLowerCase();
      router.push(`/dashboard/${role}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login gagal',
        description: error.message || 'Email atau password salah',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Esgriba LMS</CardTitle>
          <CardDescription className="text-center">
            Masukkan email dan password untuk login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@esgriba.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>Demo accounts:</p>
            <p>Admin: admin@esgriba.com / admin123</p>
            <p>Guru: budi@esgriba.com / guru123</p>
            <p>Siswa: 2024001@siswa.esgriba.com / siswa123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
