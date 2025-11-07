"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandStore } from '@/src/hooks/use-command-store';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import Image from 'next/image';

interface SearchResult {
  mal_id: number;
  title: string;
  images: { jpg: { small_image_url: string } };
}

export const CommandPalette = () => {
  const router = useRouter();
  const { isOpen, close } = useCommandStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useCommandStore.getState().toggle();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (search.length > 1) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${search}`);
          const data = await response.json();
          setResults(data || []);
        } catch (error) {
          console.error("Failed to fetch search results:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [search]);

  const onSelect = (mal_id: number) => {
    router.push(`/manga/${mal_id}`);
    close();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={close}>
      <CommandInput 
        placeholder="Search for a series..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isLoading && <CommandEmpty>Searching...</CommandEmpty>}
        {!isLoading && results.length === 0 && search.length > 1 && <CommandEmpty>No results found.</CommandEmpty>}
        
        <CommandGroup heading="Results">
          {results.map((manga) => (
            // --- UPDATED AGAIN FOR EVEN LARGER RESULTS ---
            <CommandItem 
              key={manga.mal_id} 
              onSelect={() => onSelect(manga.mal_id)} 
              value={manga.title}
              className="py-4" // Increased vertical padding
            >
              <Image 
                src={manga.images.jpg.small_image_url} 
                alt={manga.title} 
                width={60}   // Increased from 32
                height={80}  // Increased from 48
                className="mr-4 rounded-md" // Use a slightly larger border radius
              />
              <span className="text-base font-medium">{manga.title}</span> {/* Added font-medium */}
            </CommandItem>
            // ---------------------------------------------
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};