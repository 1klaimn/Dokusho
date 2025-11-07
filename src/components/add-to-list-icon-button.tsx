"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addMangaToList } from "@/app/(app)/manga/[id]/actions";
import { Plus, Loader2 } from "lucide-react";

interface AddToListIconButtonProps {
  mangaData: { id: number; title: string; imageUrl: string; };
}

export const AddToListIconButton = ({ mangaData }: AddToListIconButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addMangaToList(mangaData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
    </Button>
  );
};