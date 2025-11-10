"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/src/components/ui/kbd";
import { Filter, Search } from "lucide-react";
import { useCommandStore } from "@/src/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AddToListIconButton, CopyLinkButton } from "./manga-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

interface SearchResult { 
  mal_id: number; 
  title: string; 
  images: { 
    jpg: { 
      image_url: string;
      small_image_url?: string;
    }; 
  }; 
  chapters: number | null; 
  members: number; 
  status: string; 
  type: string; 
}

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Quick search..."
        className="pl-9 pr-16"
      />
      <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        <Kbd>Ctrl+K</Kbd>
      </div>
    </form>
  );
};

export const SearchPalette = () => {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  useEffect(() => {
    const fetchResults = async () => {
      if (search.trim().length > 1) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${search.trim()}`);
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
    };

    const debounceTimeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimeout);
  }, [search]);

  const onSelect = useCallback((mal_id: number) => {
    router.push(`/manga/${mal_id}`);
    close();
  }, [router, close]);

  const handleOpenChange = (open: boolean) => { 
    if (!open) { 
      setSearch(''); 
      setResults([]); 
      close(); 
    } 
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden shadow-lg border rounded-lg top-16 translate-y-0">
        <DialogTitle className="sr-only">Search Everything</DialogTitle>
        {}
        <Command className="[&_[cmdk-input-wrapper]_svg]:h-6 [&_[cmdk-input-wrapper]_svg]:w-6 **:[[cmdk-input]]:h-16 **:[[cmdk-input]]:text-lg [&_[cmdk-input-wrapper]_button]:size-8">
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
                <Image src={manga.images.jpg.image_url} alt={manga.title} width={60} height={85} className="rounded-md object-cover aspect-2/3" />
                <div className="grow">
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
            <CommandItem 
              key={manga.mal_id} 
              onSelect={() => onSelect(manga.mal_id)} 
              value={manga.title}
              className="py-4" 
            >
              <Image 
                src={manga.images.jpg.small_image_url} 
                alt={manga.title} 
                width={60} 
                height={80}  
                className="mr-4 rounded-md" 
              />
              <span className="text-base font-medium">{manga.title}</span> {}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export const BrowseControls = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search series by title"
          className="pl-9 h-11 text-base"
        />
      </div>
      <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
        <Filter className="h-4 w-4" />
      </Button>
    </form>
  );
};

const MANGA_TYPES = ["manga", "manhwa", "manhua"];

export const BrowseFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") || "all";

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <Select value={currentType} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {MANGA_TYPES.map(type => (
            <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Placeholder for future filters like tags */}
    </div>
  );
};