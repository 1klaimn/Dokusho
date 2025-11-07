import { MangaCard } from "@/src/components/manga-card";
import { BrowseControls } from "@/src/components/browse-controls";
import { BrowseFilters } from "@/src/components/browse-filters"; // <-- Import new component

interface JikanMangaSearchResult {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string; }; };
  chapters: number | null;
  status: string;
}

// Update the search function to accept a type filter
async function searchManga(query: string, type?: string): Promise<JikanMangaSearchResult[]> {
  try {
    const url = new URL('https://api.jikan.moe/v4/manga');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '18');
    if (type) {
      url.searchParams.set('type', type);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch search results");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Page now accepts 'type' in its searchParams
export default async function BrowsePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; type?: string }>; 
}) {
  const params = await searchParams;
  const query = params.q;
  const typeFilter = params.type; // <-- Get the type filter

  // Pass the type filter to the search function
  const searchResults = query ? await searchManga(query, typeFilter) : [];
  const uniqueResults = Array.from(new Map(searchResults.map(item => [item.mal_id, item])).values());

  return (
    <div className="space-y-6">
      <BrowseControls />
      <BrowseFilters /> {/* <-- Add the filter component here */}

      {!query ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Search for a series to get started.</p>
        </div>
      ) : uniqueResults.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No results found for &quot;{query}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {uniqueResults.map((manga) => (
            <MangaCard
              key={manga.mal_id}
              title={manga.title}
              imageUrl={manga.images.jpg.image_url}
              badgeText={manga.status === "Publishing" ? "Ongoing" : `Chapters: ${manga.chapters || 'N/A'}`}
              href={`/manga/${manga.mal_id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}