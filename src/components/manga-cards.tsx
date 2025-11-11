"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Bookmark, MoreVertical } from 'lucide-react';
import { EditProgressModal } from '@/src/components/manga-modals';
import { RemoveMangaButton, GoToSourceButton, CopyLinkButton, AddToListIconButton } from '@/src/components/manga-controls';
import { UserMangaWithDetails } from '@/app/(app)/dashboard/page';
import { Source, Tag } from '@prisma/client';
import { formatStatus } from '@/src/lib/utils';

// Define a type for the new detailed info lines
interface InfoLine {
  label: string;
  value: string;
}

// Update the props to be more flexible
interface MangaCardProps {
  title: string;
  imageUrl: string;
  href: string;
  badgeText?: string; // For the simple corner badge
  infoLines?: InfoLine[]; // For the detailed view
}

interface MangaListItemProps { 
  item: UserMangaWithDetails;
  availableSources: Source[];
  userTags: Tag[];
}

interface SearchResult {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string; }; };
  chapters: number | null;
  members: number; // Jikan uses 'members' for user count
  type: string;
}

interface SearchResultItemProps {
  manga: SearchResult;
}

export const MangaCard = ({ title, imageUrl, href, badgeText, infoLines }: MangaCardProps) => {
  return (
    <Link href={href} className="group flex flex-col h-full">
      <Card className="overflow-hidden grow flex flex-col">
        <CardContent className="p-0 relative">
          <Image
            src={imageUrl}
            alt={title}
            width={300}
            height={450}
            className="w-full h-auto object-cover aspect-2/3 group-hover:scale-105 transition-transform duration-300"
          />
          {badgeText && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2"
            >
              {badgeText}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="p-3 flex flex-col items-start w-full">
          <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors mb-2 w-full truncate">
            {title}
          </h3>
          {infoLines && (
            <div className="space-y-1 w-full">
              {infoLines.map((line, index) => (
                <div key={index} className="flex items-center justify-between text-xs w-full">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">
                    {line.label}
                  </Badge>
                  <span className="text-muted-foreground">{line.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export const MangaListItem = ({ item, availableSources, userTags }: MangaListItemProps) => {
  const primarySource = item.sources[0];

  return (
    <div className="flex items-center p-3 gap-4 hover:bg-muted/50">
      <Checkbox />
      <div className="grow">
        <div className="flex items-center gap-2">
          {item.sources.map(s => (s.source.icon ? <Image key={s.id} src={s.source.icon} alt={s.source.name} width={16} height={16} /> : null))}
          <Link href={`/manga/${item.manga.id}`} className="font-medium hover:underline">{item.manga.title}</Link>
        </div>
        <div className="flex items-center flex-wrap gap-2 mt-1 pl-6">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{formatStatus(item.status)}</Badge>
          <Badge variant="secondary" className="font-normal"><Bookmark className="mr-1 h-3 w-3" /> Ch. {item.progress}</Badge>
          
          {primarySource && primarySource.latestChapter && (
            <Link href={primarySource.url} target="_blank" rel="noopener noreferrer">
              <Badge 
                variant="default" 
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900/80 cursor-pointer"
              >
                Ch. {primarySource.latestChapter}
              </Badge>
            </Link>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <EditProgressModal item={item} availableSources={availableSources} userTags={userTags}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </EditProgressModal>
          <GoToSourceButton item={item} />
          <DropdownMenuSeparator />
          <RemoveMangaButton userMangaId={item.id} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const SearchResultItem = ({ manga }: SearchResultItemProps) => {
  const mangaDataForAction = {
    id: manga.mal_id,
    title: manga.title,
    imageUrl: manga.images.jpg.image_url,
  };

  return (
    <div className="flex p-4 gap-4 border-b">
      <Link href={`/manga/${manga.mal_id}`}>
        <Image 
          src={manga.images.jpg.image_url} 
          alt={manga.title} 
          width={80} 
          height={120}
          className="rounded-md object-cover"
        />
      </Link>
      <div className="grow flex flex-col justify-between">
        <div>
          <Link href={`/manga/${manga.mal_id}`} className="font-semibold text-lg hover:underline leading-tight">
            {manga.title}
          </Link>
          <div className="text-sm text-muted-foreground mt-1">
            <span>{manga.chapters || '--'} chapters</span>
            <span className="mx-2">•</span>
            <span>{manga.members.toLocaleString()} users</span>
          </div>
        </div>
        <div className="mt-2">
          <Badge variant="secondary">{manga.type}</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <CopyLinkButton id={manga.mal_id} />
        <AddToListIconButton mangaData={mangaDataForAction} />
      </div>
    </div>
  );
};