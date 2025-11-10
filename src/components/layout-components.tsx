"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCommandStore } from '@/src/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Kbd } from '@/src/components/ui/kbd';
import { Search, Bell, LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SearchPalette } from './search-components';
import { signIn } from 'next-auth/react';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { open } = useCommandStore();

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <DropdownMenu onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><AnimatedMenuIcon isOpen={isMenuOpen} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/discover">Discover</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/browse">Browse</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold tracking-tight">読書</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <Button variant="outline" className="relative w-full max-w-xs justify-start text-muted-foreground" onClick={open}>
              <Search className="h-4 w-4 mr-2" />
              Quick search...
              <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">Ctrl+K</Kbd>
            </Button>
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Avatar className="h-9 w-9 cursor-pointer"><AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? 'User'} /><AvatarFallback>{session.user?.name?.[0].toUpperCase()}</AvatarFallback></Avatar></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{session.user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer"><Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <SearchPalette />
    </>
  );
};

interface AnimatedMenuIconProps {
  isOpen: boolean;
}

const lineVariants = {
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

const top_line = {
  closed: {
    rotate: 0,
    translateY: 0,
  },
  open: {
    rotate: 45,
    translateY: 6,
  },
};

const middle_line = {
  closed: {
    opacity: 1,
  },
  open: {
    opacity: 0,
  },
};

const bottom_line = {
  closed: {
    rotate: 0,
    translateY: 0,
  },
  open: {
    rotate: -45,
    translateY: -6,
  },
};

export const AnimatedMenuIcon = ({ isOpen }: AnimatedMenuIconProps) => {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      className="stroke-current"
    >
      <motion.line
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        variants={{ ...top_line, ...lineVariants }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <motion.line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        variants={{ ...middle_line, ...lineVariants }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <motion.line
        x1="4"
        y1="18"
        x2="20"
        y2="18"
        variants={{ ...bottom_line, ...lineVariants }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
};

export const AuthModal = ({ children }: { children: React.ReactNode }) => {
  const [variant, setVariant] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleVariant = () => {
    setVariant(variant === 'LOGIN' ? 'REGISTER' : 'LOGIN');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
        
        await signIn('credentials', { email, password, callbackUrl: '/dashboard' });

      } catch {
        setError('An error occurred during registration.');
        setIsLoading(false);
      }
    }

    if (variant === 'LOGIN') {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Invalid email or password.');
        setIsLoading(false);
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
            {variant === 'REGISTER' && (<div className="flex items-center space-x-2 pt-2"><Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} disabled={isLoading} /><label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">I&apos;ve read and agree with <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a></label></div>)}
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