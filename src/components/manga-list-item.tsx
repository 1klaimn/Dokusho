"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Bookmark, MoreVertical } from 'lucide-react';
import { EditProgressModal } from '@/src/components/edit-progress-modal';
import { RemoveMangaButton } from '@/src/components/remove-manga-button';
import { GoToSourceButton } from './go-to-source-button';
import { UserMangaWithDetails } from '@/app/(app)/dashboard/page';
import { Source, Tag } from '@prisma/client';
import { formatStatus } from '@/src/lib/utils';

interface MangaListItemProps { 
  item: UserMangaWithDetails;
  availableSources: Source[];
  userTags: Tag[];
}

export const MangaListItem = ({ item, availableSources, userTags }: MangaListItemProps) => {
  const primarySource = item.sources[0];

  return (
    <div className="flex items-center p-3 gap-4 hover:bg-muted/50">
      <Checkbox />
      <div className="flex-grow">
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