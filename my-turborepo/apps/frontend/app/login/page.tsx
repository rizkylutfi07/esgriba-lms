'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

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
        title: 'Login successful',
        description: `Welcome back, ${response.user.name}!`,
      });

      // Redirect based on role
      const role = response.user.role.toLowerCase();
      router.push(`/dashboard/${role}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* Left Side - Image/Brand */}
      <div className="hidden md:flex flex-col relative bg-primary/5 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/login-bg.png"
            alt="Login Background"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between p-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="font-bold text-white">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Esgriba LMS</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Empowering The Future <br /> of Education
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Manage your school efficiently with our modern, intuitive learning management system.
            </p>
          </div>

          <div className="text-sm text-white/50">
            © 2024 Esgriba Schools. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 bg-background animate-fade-in">
        <div className="w-full max-w-[380px] space-y-8">
          <div className="flex flex-col space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials below to access your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 shadow-sm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-medium shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground text-center">
            <p className="font-medium mb-2">Demo Access:</p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="font-semibold block text-foreground">Admin:</span>
                admin@esgriba.com
              </div>
              <div>
                <span className="font-semibold block text-foreground">Password:</span>
                admin123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
