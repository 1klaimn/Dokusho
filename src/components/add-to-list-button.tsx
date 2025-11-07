"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addMangaToList } from "@/app/(app)/manga/[id]/actions";
import { PlusCircle } from "lucide-react";

// Update the props to include the 'type'
interface AddToListButtonProps {
  mangaData: {
    id: number;
    title: string;
    imageUrl: string;
    type: string;
  };
}

export const AddToListButton = ({ mangaData }: AddToListButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addMangaToList(mangaData); // The full data is now passed
      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending} size="lg" className="w-full">
      <PlusCircle className="mr-2 h-5 w-5" />
      {isPending ? "Adding..." : "Add to List"}
    </Button>
  );
};