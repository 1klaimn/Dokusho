"use server";

import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
  } catch (error) {
    // P2002 is the Prisma code for a unique constraint violation
    if ((error as any).code === 'P2002') {
      return { success: false, error: "A tag with this name already exists." };
    }
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
    return { success: false, error: "Failed to delete tag." };
  }
}