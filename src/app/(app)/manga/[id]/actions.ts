"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { Status } from "@prisma/client";

// The data we receive from the client now includes the 'type'
interface MangaData {
  id: number;
  title: string;
  imageUrl: string;
  type: string; // <-- ADD THIS
  status: string;
  userStatus?: Status;
}

export async function addMangaToList(mangaData: MangaData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }
  const userId = session.user.id;

  const existingEntry = await prisma.userManga.findUnique({
    where: { userId_mangaId: { userId, mangaId: mangaData.id } },
  });

  if (existingEntry) {
    return { success: false, error: "This manga is already in your list." };
  }

  // When creating a new manga entry, also save its type
  await prisma.manga.upsert({
    where: { id: mangaData.id },
    update: { type: mangaData.type }, // Also update the type if it's somehow missing
    create: {
      id: mangaData.id,
      title: mangaData.title,
      imageUrl: mangaData.imageUrl,
      type: mangaData.type, // <-- SAVE THE TYPE HERE
      status: mangaData.status,
    },
  });

  await prisma.userManga.create({
    data: {
      userId: userId,
      mangaId: mangaData.id,
      status: mangaData.userStatus || "PLAN_TO_READ",
    },
  });

  revalidatePath("/dashboard");
  return { success: true, message: "New entry added!" };
}