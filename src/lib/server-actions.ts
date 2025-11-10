"use server";

import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Status } from "@prisma/client";

// --- Main Data Update Action ---
interface UpdateData {
  progress?: number;
  status?: Status;
  tags?: string[];
  notes?: string;
  score?: number | null;
  isHidden?: boolean;
  isFavourite?: boolean;
}

interface MangaData {
  id: number;
  title: string;
  imageUrl: string;
  type?: string;
  status?: string;
  userStatus?: Status;
}

// Define the MangaDex API response types
interface MangaDexChapterAttributes {
  chapter: string | null;
  title?: string;
  translatedLanguage?: string;
}

interface MangaDexChapter {
  id: string;
  type: string;
  attributes: MangaDexChapterAttributes;
}

interface MangaDexFeedResponse {
  data: MangaDexChapter[];
  limit: number;
  offset: number;
  total: number;
}

export async function updateUserMangaEntry(userMangaId: string, data: UpdateData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }
  const userId = session.user.id;

  try {
    let tagConnectOps = undefined;
    if (data.tags) {
      const tagOps = data.tags.map((tagName) => 
        prisma.tag.upsert({
          where: { userId_name: { userId, name: tagName } },
          update: {},
          create: { name: tagName, userId },
        })
      );
      const tags = await prisma.$transaction(tagOps);
      tagConnectOps = { set: tags.map(tag => ({ id: tag.id })) };
    }

    await prisma.userManga.update({
      where: { id: userMangaId, userId: userId },
      data: {
        progress: data.progress,
        status: data.status,
        notes: data.notes,
        score: data.score,
        isHidden: data.isHidden,
        isFavourite: data.isFavourite,
        tags: tagConnectOps,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Entry updated successfully!" };
  } catch (error) {
    console.error("Failed to update manga entry:", error);
    return { success: false, error: "An error occurred while updating." };
  }
}

// --- List Management Actions ---
export async function removeMangaFromList(userMangaId: string) {
  try {
    await prisma.userManga.delete({ where: { id: userMangaId } });
    revalidatePath("/dashboard");
    return { success: true, message: "Manga removed from your list." };
  } catch (error) {
    console.error("Failed to remove manga:", error);
    return { success: false, error: "An error occurred." };
  }
}

// --- Source Management Actions ---
export async function linkSourceToManga(userMangaId: string, sourceId: string, url: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }

  try {
    await prisma.userMangaSource.upsert({
      where: { userMangaId_sourceId: { userMangaId, sourceId } },
      update: { url },
      create: { userMangaId, sourceId, url },
    });
    revalidatePath("/dashboard");
    return { success: true, message: "Source linked successfully." };
  } catch (error) {
    console.error("Failed to link source:", error);
    return { success: false, error: "An error occurred." };
  }
}

export async function unlinkSourceFromManga(userMangaSourceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }

  try {
    await prisma.userMangaSource.delete({ where: { id: userMangaSourceId } });
    revalidatePath("/dashboard");
    return { success: true, message: "Source unlinked." };
  } catch (error) {
    console.error("Failed to unlink source:", error);
    return { success: false, error: "An error occurred." };
  }
}

// --- Chapter Fetching Logic ---
async function fetchAndParseMangaDexChapters(mangaUUID: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.mangadex.org/manga/${mangaUUID}/feed?order[chapter]=desc&translatedLanguage[]=en&limit=500`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from MangaDex chapter feed.');
    }
    
    const data: MangaDexFeedResponse = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Extract chapter numbers with proper type checking
    const chapterStrings = data.data
      .map((ch: MangaDexChapter) => {
        // Check if attributes and chapter exist and chapter is a string
        if (ch?.attributes?.chapter && typeof ch.attributes.chapter === 'string') {
          return ch.attributes.chapter;
        }
        return null;
      })
      .filter((ch): ch is string => ch !== null);
    
    // Remove duplicates and sort
    const uniqueChapters = [...new Set(chapterStrings)];
    const sortedChapters = uniqueChapters
      .map(ch => parseFloat(ch))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a);

    return sortedChapters.map(String);
  } catch (error) {
    console.error("Error fetching MangaDex chapters:", error);
    return [];
  }
}

export async function refreshSourceChapters(userMangaSourceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }
  
  try {
    const userMangaSource = await prisma.userMangaSource.findUnique({
      where: { id: userMangaSourceId },
      include: { source: true, userManga: true },
    });

    if (!userMangaSource || userMangaSource.source.name !== 'MangaDex') {
      return { success: false, error: "Source not found or is not MangaDex." };
    }
    
    const uuidMatch = userMangaSource.url.match(/mangadex\.org\/title\/([a-f0-9-]+)/);
    if (!uuidMatch || !uuidMatch[1]) {
      return { success: false, error: "Invalid MangaDex URL format." };
    }
    const mangaUUID = uuidMatch[1];

    const chapters = await fetchAndParseMangaDexChapters(mangaUUID);
    const latestChapter = chapters.length > 0 ? String(parseInt(chapters[0], 10)) : "0";
    
    await prisma.userMangaSource.update({
      where: { id: userMangaSourceId },
      data: { latestChapter },
    });

    revalidatePath("/dashboard");
    return { success: true, message: `Found latest chapter: ${latestChapter}` };
  } catch (error) {
    console.error("MangaDex refresh failed:", error);
    return { success: false, error: "Could not refresh from MangaDex." };
  }
}

export async function getChaptersForSource(userMangaSourceId: string): Promise<string[]> {
  try {
    const userMangaSource = await prisma.userMangaSource.findUnique({
      where: { id: userMangaSourceId },
    });

    if (!userMangaSource) {
      throw new Error("Source not found.");
    }
    
    const uuidMatch = userMangaSource.url.match(/mangadex\.org\/title\/([a-f0-9-]+)/);
    if (!uuidMatch || !uuidMatch[1]) {
      throw new Error("Invalid MangaDex URL.");
    }
    const mangaUUID = uuidMatch[1];

    return await fetchAndParseMangaDexChapters(mangaUUID);
  } catch (error) {
    console.error("Failed to fetch chapters:", error);
    return [];
  }
}

export async function findNextChapterUrl(userMangaId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }

  try {
    const userMangaEntry = await prisma.userManga.findUnique({
      where: { id: userMangaId, userId: session.user.id },
      include: { sources: { include: { source: true } } },
    });

    if (!userMangaEntry) {
      return { success: false, error: "Manga entry not found." };
    }

    const mangaDexSource = userMangaEntry.sources.find(s => s.source.name === 'MangaDex');
    if (!mangaDexSource) {
      return { success: false, error: "No MangaDex source linked." };
    }

    const userProgress = userMangaEntry.progress;
    const uuidMatch = mangaDexSource.url.match(/mangadex\.org\/title\/([a-f0-9-]+)/);
    if (!uuidMatch || !uuidMatch[1]) {
      return { success: false, error: "Invalid MangaDex URL format." };
    }
    const mangaUUID = uuidMatch[1];

    const response = await fetch(
      `https://api.mangadex.org/manga/${mangaUUID}/feed?order[chapter]=desc&translatedLanguage[]=en`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from MangaDex chapter feed.');
    }
    
    const data: MangaDexFeedResponse = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return { success: true, url: mangaDexSource.url };
    }

    let nextChapterId: string | null = null;
    
    // Iterate through chapters to find the next one after user's progress
    for (let i = data.data.length - 1; i >= 0; i--) {
      const chapter = data.data[i];
      
      // Type-safe check for chapter attributes
      if (chapter?.attributes?.chapter && typeof chapter.attributes.chapter === 'string') {
        const chapterNumber = parseFloat(chapter.attributes.chapter);
        
        if (!isNaN(chapterNumber) && chapterNumber > userProgress) {
          nextChapterId = chapter.id;
          break;
        }
      }
    }

    if (nextChapterId) {
      return { success: true, url: `https://mangadex.org/chapter/${nextChapterId}` };
    } else {
      return { success: true, url: mangaDexSource.url };
    }
  } catch (error) {
    console.error("Failed to find next chapter:", error);
    return { success: false, error: "Could not find the next chapter." };
  }
}

export async function addMangaToList(mangaData: MangaData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }
  const userId = session.user.id;

  try {
    // Debugging: Check if the user exists before the transaction
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      // If the user doesn't exist, return an error
      return { success: false, error: "User not found." };
    }

    // Check if entry already exists
    const existingEntry = await prisma.userManga.findUnique({
      where: {
        userId_mangaId: {
          userId: userId,
          mangaId: mangaData.id,
        },
      },
    });

    if (existingEntry) {
      return { success: false, error: "This manga is already in your list." };
    }

    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      prisma.manga.upsert({
        where: { id: mangaData.id },
        update: {
          title: mangaData.title,
          imageUrl: mangaData.imageUrl,
          type: mangaData.type,
          status: mangaData.status,
        },
        create: {
          id: mangaData.id,
          title: mangaData.title,
          imageUrl: mangaData.imageUrl,
          type: mangaData.type,
          status: mangaData.status,
        },
      }),
      prisma.userManga.create({
        data: {
          userId: userId,
          mangaId: mangaData.id,
          status: mangaData.userStatus || "PLAN_TO_READ",
          progress: 0,
        },
      }),
    ]);

    revalidatePath("/dashboard");
    return { success: true, message: "New entry added!" };
  } catch (error) {
    console.error("Failed to add manga to list:", error);
    return { success: false, error: "An error occurred while adding the manga." };
  }
}

export async function createTag(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }

  if (!name.trim()) {
    return { success: false, error: "Tag name cannot be empty." };
  }

  try {
    await prisma.tag.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
    });
    revalidatePath("/settings");
    return { success: true, message: "Tag created successfully." };
  } catch(error) {
    // P2002 is the Prisma code for a unique constraint violation
    if ((error as any).code === 'P2002') {
      return { success: false, error: "A tag with this name already exists." };
    }
    console.error("Failed to create tag:", error);
    return { success: false, error: "Failed to create tag." };
  }
}

export async function deleteTag(tagId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }

  try {
    await prisma.tag.delete({
      where: {
        id: tagId,
        userId: session.user.id, // Ensure user can only delete their own tags
      },
    });
    revalidatePath("/settings");
    revalidatePath("/dashboard"); // Also revalidate dashboard in case tags are removed
    return { success: true, message: "Tag deleted." };
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return { success: false, error: "Failed to delete tag." };
  }
}