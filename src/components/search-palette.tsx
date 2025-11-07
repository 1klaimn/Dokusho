"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandStore } from '@/src/hooks/use-command-store';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CopyLinkButton } from './copy-link-button';
import { AddToListIconButton } from './add-to-list-icon-button';

interface SearchResult { mal_id: number; title: string; images: { jpg: { image_url: string; }; }; chapters: number | null; members: number; status: string; type: string; }

export const SearchPalette = () => {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggle]);

  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (search.trim().length > 1) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${search.trim()}`);
          const data = await response.json();
          setResults(data || []);
        } catch (error) { console.error("Failed to fetch search results:", error); setResults([]); } finally { setIsLoading(false); }
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [search]);

  const onSelect = useCallback((mal_id: number) => {
    router.push(`/manga/${mal_id}`);
    close();
  }, [router, close]);

  const handleOpenChange = (open: boolean) => { if (!open) { setSearch(''); setResults([]); close(); } };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden shadow-lg border rounded-lg top-16 translate-y-0">
        <DialogTitle className="sr-only">Search Everything</DialogTitle>
        {/* --- THIS IS THE CORRECTED LINE --- */}
        <Command className="[&_[cmdk-input-wrapper]_svg]:h-6 [&_[cmdk-input-wrapper]_svg]:w-6 [&_[cmdk-input]]:h-16 [&_[cmdk-input]]:text-lg [&_[cmdk-input-wrapper]_button]:size-8">
          <CommandInput placeholder="Search everything..." value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && <CommandEmpty>Searching...</CommandEmpty>}
            {!isLoading && results.length === 0 && search.length > 1 && <CommandEmpty>No results found.</CommandEmpty>}
            
            {results.map((manga) => (
              <CommandItem 
                key={manga.mal_id} 
                onSelect={() => onSelect(manga.mal_id)}
                value={manga.title} 
                className="p-3 gap-4 items-center cursor-pointer"
              >
                <Image src={manga.images.jpg.image_url} alt={manga.title} width={60} height={85} className="rounded-md object-cover aspect-[2/3]" />
                <div className="flex-grow">
                  <p className="font-semibold text-lg leading-tight">{manga.title}</p>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>{manga.chapters || '--'} chapters</span><span className="mx-2">•</span><span>{manga.members.toLocaleString()} users</span>
                  </div>
                  <div className="mt-2"><Badge variant="secondary">{manga.type}</Badge></div>
                </div>
                <div className="flex items-center" onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
                  <CopyLinkButton id={manga.mal_id} />
                  <AddToListIconButton mangaData={{ id: manga.mal_id, title: manga.title, imageUrl: manga.images.jpg.image_url, type: manga.type, status: manga.status }} />
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};