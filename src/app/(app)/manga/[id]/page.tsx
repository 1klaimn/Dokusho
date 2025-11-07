import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Users, Library, BookCheck, Clock } from 'lucide-react';
import { AddToListButton } from '@/src/components/manga-controls';

interface MangaDetails {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string; }; };
  synopsis: string;
  chapters: number | null;
  status: string;
  score: number | null;
  scored_by: number | null;
  members: number;
  genres: { name: string }[];
  authors: { name: string }[];
  type: string;
}

async function getMangaDetails(id: string): Promise<MangaDetails | null> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch manga details");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function MangaDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const manga = await getMangaDetails(id);

  if (!manga) {
    return <div className="text-center py-10">Manga not found.</div>;
  }

  const mangaDataForAction = {
    id: manga.mal_id,
    title: manga.title,
    imageUrl: manga.images.jpg.large_image_url,
    type: manga.type,
    status: manga.status,
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
          <Image 
            src={manga.images.jpg.large_image_url} 
            alt={manga.title} 
            width={500} 
            height={750} 
            className="rounded-lg shadow-lg w-full"
          />
          <AddToListButton mangaData={mangaDataForAction} />
          
          <div className="space-y-4 text-sm">
            <div className="flex items-center"><Library className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Type:</strong><span className="ml-auto">{manga.type}</span></div>
            <Separator />
            {manga.score && <div className="flex items-center"><Star className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Score:</strong><span className="ml-auto">{manga.score} ({manga.scored_by?.toLocaleString()})</span></div>}
            <Separator />
            <div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Status:</strong><span className="ml-auto">{manga.status}</span></div>
            <Separator />
            <div className="flex items-center"><BookCheck className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Chapters:</strong><span className="ml-auto">{manga.chapters || 'N/A'}</span></div>
            <Separator />
            <div className="flex items-center"><Users className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Users:</strong><span className="ml-auto">{manga.members.toLocaleString()}</span></div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <h1 className="text-4xl font-bold">{manga.title}</h1>
          <div className="flex flex-wrap gap-2">{manga.genres.map(genre => <Badge key={genre.name} variant="outline">{genre.name}</Badge>)}</div>
          <Separator />
          <p className="text-muted-foreground whitespace-pre-line">{manga.synopsis}</p>
          <div className="space-y-2">
            <div><h3 className="font-semibold">Authors</h3><div className="flex flex-wrap gap-2 mt-1">{manga.authors.map(author => <Badge key={author.name} variant="outline">{author.name}</Badge>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}