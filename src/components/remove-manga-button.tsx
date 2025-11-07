"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { removeMangaFromList } from "@/app/(app)/dashboard/actions";
import { OctagonXIcon } from "lucide-react"; // <-- Import the icon

export const RemoveMangaButton = ({ userMangaId }: { userMangaId: string }) => {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeMangaFromList(userMangaId);
      if (result.success) {
        // --- Use a success toast but with a custom, destructive icon ---
        toast.success(result.message, {
          icon: <OctagonXIcon className="size-4 text-red-600 dark:text-red-400" />,
        });
        // -----------------------------------------------------------------
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenuItem
      className="text-red-500"
      onClick={handleRemove}
      disabled={isPending}
      onSelect={(e) => e.preventDefault()}
    >
      {isPending ? "Removing..." : "Remove from list"}
    </DropdownMenuItem>
  );
};