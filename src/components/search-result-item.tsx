import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CopyLinkButton } from './copy-link-button';
import { AddToListIconButton } from './add-to-list-icon-button';

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