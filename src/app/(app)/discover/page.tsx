import { MangaCard } from "@/src/components/manga-card";
import { PaginationControls } from "@/src/components/pagination-controls";

const MANGA_PER_PAGE = 18;

interface JikanManga {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string; }; };
  chapters: number | null;
  status: string;
}

interface JikanResponse {
  data: JikanManga[];
  pagination: {
    has_next_page: boolean;
    current_page: number;
  };
}

async function getTopManga(page: number): Promise<JikanResponse | null> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/top/manga?page=${page}&limit=${MANGA_PER_PAGE}`);
    if (!response.ok) throw new Error("Failed to fetch manga");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// The page now receives searchParams as a Promise
export default async function DiscoverPage({
  searchParams,
}: {
  // --- CORRECTED THE TYPE TO BE A PROMISE ---
  searchParams: Promise<{ page?: string }>;
}) {
  // --- AWAIT THE PROMISE BEFORE ACCESSING ITS PROPERTIES ---
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const response = await getTopManga(currentPage);
  const topManga = response?.data || [];
  const hasNextPage = response?.pagination?.has_next_page || false;

  const uniqueManga = Array.from(new Map(topManga.map(item => [item.mal_id, item])).values());

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Top Manga</h1>
      
      {uniqueManga.length === 0 ? (
        <p className="text-muted-foreground">Could not load manga. Please try again later.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {uniqueManga.map((manga) => (
              <MangaCard
                key={manga.mal_id}
                title={manga.title}
                imageUrl={manga.images.jpg.image_url}
                latestChapter={manga.status}
                href={`/manga/${manga.mal_id}`}
              />
            ))}
          </div>
          
          <PaginationControls currentPage={currentPage} hasNextPage={hasNextPage} />
        </>
      )}
    </div>
  );
}