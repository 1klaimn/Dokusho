"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCommandStore } from '@/src/hooks/use-command-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AnimatedMenuIcon } from '@/src/components/animated-menu-icon';
import { Kbd } from '@/src/components/ui/kbd';
import { Search, Bell, LogOut, Settings } from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { open } = useCommandStore();

  return (
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
  );
};