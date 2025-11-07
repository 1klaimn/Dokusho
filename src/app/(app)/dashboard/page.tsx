import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/src/lib/db';
import { Manga, UserManga, Status, Prisma, Tag, Source, UserMangaSource } from '@prisma/client';
import { MangaListItem } from '@/src/components/manga-list-item';
import { DashboardFilters } from '@/src/components/dashboard-filters';
import { MangaCard } from '@/src/components/manga-card';
import { Checkbox } from '@/components/ui/checkbox';

export type UserMangaWithDetails = UserManga & { 
  manga: Manga;
  tags: Tag[];
  sources: (UserMangaSource & { source: Source })[];
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    status?: Status; 
    q?: string; 
    view?: string; 
    type?: string; 
    pub_status?: string; 
    tag?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/');

  const params = await searchParams;
  const statusFilter = params.status;
  const searchQuery = params.q;
  const view = params.view || 'list';
  const typeFilter = params.type;
  const pubStatusFilter = params.pub_status;
  const tagFilter = params.tag;
  const sortBy = params.sortBy || 'updatedAt';
  const sortOrder = params.sortOrder || 'desc';

  const mangaWhereConditions: Prisma.MangaWhereInput[] = [];
  if (typeFilter) {
    mangaWhereConditions.push({ type: { equals: typeFilter, mode: 'insensitive' } });
  }
  if (pubStatusFilter) {
    mangaWhereConditions.push({ status: pubStatusFilter });
  }

  const whereClause: Prisma.UserMangaWhereInput = {
    userId: session.user.id,
    ...(statusFilter && { status: statusFilter }),
    ...(tagFilter && { tags: { some: { name: tagFilter } } }),
    ...(searchQuery && { manga: { title: { contains: searchQuery, mode: 'insensitive' } } }),
    ...(mangaWhereConditions.length > 0 && { manga: { AND: mangaWhereConditions } }),
  };

  // Fix: Create proper orderBy clause based on sortBy field
  let orderByClause: Prisma.UserMangaOrderByWithRelationInput = {};
  
  if (sortBy === 'title') {
    orderByClause = { manga: { title: sortOrder } };
  } else if (sortBy === 'progress') {
    orderByClause = { progress: sortOrder };
  } else if (sortBy === 'score') {
    orderByClause = { score: sortOrder };
  } else if (sortBy === 'updatedAt') {
    orderByClause = { updatedAt: sortOrder };
  } else {
    // Default fallback
    orderByClause = { updatedAt: 'desc' };
  }

  const userMangaListPromise = prisma.userManga.findMany({
    where: whereClause,
    include: { manga: true, tags: true, sources: { include: { source: true } } },
    orderBy: orderByClause,
  });

  const availableSourcesPromise = prisma.source.findMany();
  const userTagsPromise = prisma.tag.findMany({ where: { userId: session.user.id }, orderBy: { name: 'asc' } });

  const [userMangaList, availableSources, userTags] = await Promise.all([userMangaListPromise, availableSourcesPromise, userTagsPromise]);

  return (
    <div className="space-y-4">
      <DashboardFilters userTags={userTags} />
      
      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {userMangaList.map((item) => (
            <MangaCard 
              key={item.mangaId} 
              title={item.manga.title} 
              imageUrl={item.manga.imageUrl || ''} 
              href={`/manga/${item.mangaId}`} 
              infoLines={[
                { label: `Ch. ${item.progress}`, value: 'In Progress' },
                { label: 'Latest', value: 'Up to date' }
              ]} 
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center gap-4">
              <Checkbox />
              <span className="text-sm text-muted-foreground">Showing {userMangaList.length} results</span>
            </div>
          </div>
          {userMangaList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No manga found for the selected filters.</p>
              <p className="mt-2 text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y">
              {userMangaList.map((item) => (
                <MangaListItem key={item.id} item={item} availableSources={availableSources} userTags={userTags} />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between p-3 bg-muted/50 border-t">
            <span className="text-sm text-muted-foreground">Showing {userMangaList.length} results</span>
          </div>
        </div>
      )}
    </div>
  );
}