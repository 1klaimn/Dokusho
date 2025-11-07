import { MangaCard } from "@/src/components/manga-card";

interface JikanMangaSearchResult {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string; }; };
  chapters: number | null;
  status: string;
}

async function searchManga(query: string): Promise<JikanMangaSearchResult[]> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/manga?q=${query}&limit=18`);
    if (!response.ok) throw new Error("Failed to fetch search results");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q: string }> 
}) {
  const { q: query } = await searchParams;
  const searchResults = query ? await searchManga(query) : [];

  // --- FIX: De-duplicate the results before rendering ---
  const uniqueResults = Array.from(new Map(searchResults.map(item => [item.mal_id, item])).values());
  // ----------------------------------------------------

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Search Results {query && `: "${query}"`}
      </h1>

      {!query ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>Please enter a search term in the bar above.</p>
        </div>
      ) : uniqueResults.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>No results found for &quot;{query}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {/* Map over the unique list */}
          {uniqueResults.map((manga) => (
            <MangaCard
              key={manga.mal_id}
              title={manga.title}
              imageUrl={manga.images.jpg.image_url}
              latestChapter={manga.status === "Publishing" ? "Ongoing" : `Chapters: ${manga.chapters || 'N/A'}`}
              href={`/manga/${manga.mal_id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}