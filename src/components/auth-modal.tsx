"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

export const AuthModal = ({ children }: { children: React.ReactNode }) => {
  const [variant, setVariant] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // <-- Add loading state
  const router = useRouter();

  const toggleVariant = () => {
    setVariant(variant === 'LOGIN' ? 'REGISTER' : 'LOGIN');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // <-- Set loading
    setError('');

    if (variant === 'REGISTER') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          setError('Registration failed. The user might already exist.');
          setIsLoading(false);
          return;
        }
        
        // --- CORRECTED REDIRECTION ---
        // After successful registration, sign in and redirect to the dashboard
        await signIn('credentials', { email, password, callbackUrl: '/dashboard' });

      } catch (err) {
        setError('An error occurred during registration.');
        setIsLoading(false);
      }
    }

    if (variant === 'LOGIN') {
      // --- CORRECTED REDIRECTION ---
      // Let signIn handle the redirect on success
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Keep false here to handle the error case
      });

      if (result?.ok) {
        router.push('/dashboard'); // Manually redirect on success
        router.refresh(); // Ensure the layout re-renders
      } else {
        setError('Invalid email or password.');
        setIsLoading(false); // Stop loading on error
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{variant === 'LOGIN' ? 'Sign In' : 'Create an Account'}</DialogTitle>
            <DialogDescription>
              {variant === 'LOGIN' ? 'Enter your credentials to access your dashboard.' : 'Enter your details to get started.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} /></div>
            {variant === 'REGISTER' && (<div className="space-y-2"><Label htmlFor="confirmPassword">Password confirmation</Label><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} /></div>)}
            {variant === 'REGISTER' && (<div className="flex items-center space-x-2 pt-2"><Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} disabled={isLoading} /><label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">I've read and agree with <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a></label></div>)}
          </div>
          {error && <p className="text-sm text-center text-red-500 mb-4">{error}</p>}
          <DialogFooter className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading || (variant === 'REGISTER' && !agreed)}>
              {isLoading ? 'Loading...' : (variant === 'LOGIN' ? 'Sign In' : 'Register')}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {variant === 'LOGIN' ? "Don't have an account?" : 'Already have an account?'}
              <Button variant="link" type="button" onClick={toggleVariant} className="pl-1" disabled={isLoading}>
                {variant === 'LOGIN' ? 'Register' : 'Sign In'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};