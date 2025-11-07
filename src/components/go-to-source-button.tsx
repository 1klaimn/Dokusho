"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UserMangaWithDetails } from "@/app/(app)/dashboard/page";
import { findNextChapterUrl } from "@/app/(app)/dashboard/actions";
import { ArrowUpRight, Loader2 } from "lucide-react";

interface GoToSourceButtonProps {
  item: UserMangaWithDetails;
}

export const GoToSourceButton = ({ item }: GoToSourceButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const hasMangaDexSource = item.sources.some(s => s.source.name === 'MangaDex');

  const handleClick = () => {
    startTransition(async () => {
      const result = await findNextChapterUrl(item.id);
      if (result.success && result.url) {
        // Open the found URL in a new tab
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(result.error || "Could not find source URL.");
      }
    });
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      disabled={!hasMangaDexSource || isPending}
      onSelect={(e) => e.preventDefault()}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ArrowUpRight className="mr-2 h-4 w-4" />
      )}
      <span>{hasMangaDexSource ? "Go to Source" : "No MangaDex Source"}</span>
    </DropdownMenuItem>
  );
};