"use client";

import { useEffect, useState } from "react";
import { getChaptersForSource } from "@/app/(app)/dashboard/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UserMangaWithDetails } from "@/app/(app)/dashboard/page";

interface ChapterSelectorProps {
  item: UserMangaWithDetails;
  progress: number;
  setProgress: (progress: number) => void;
}

export const ChapterSelector = ({ item, progress, setProgress }: ChapterSelectorProps) => {
  const [chapters, setChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mangaDexSource = item.sources.find(s => s.source.name === 'MangaDex');

  useEffect(() => {
    if (mangaDexSource) {
      setIsLoading(true);
      getChaptersForSource(mangaDexSource.id)
        .then(setChapters)
        .finally(() => setIsLoading(false));
    }
  }, [mangaDexSource]);

  // If no MangaDex source, or still loading, show the original number input
  if (!mangaDexSource || isLoading) {
    return (
      <Input
        type="number"
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
        placeholder={isLoading ? "Fetching chapters..." : "Chapters Read"}
        disabled={isLoading}
        className="w-full h-9"
      />
    );
  }

  // If we have chapters, show the dropdown
  return (
    <Select 
      value={String(progress)}
      onValueChange={(value) => setProgress(Number(value))}
    >
      <SelectTrigger className="w-full h-9">
        <SelectValue placeholder="Select a chapter" />
      </SelectTrigger>
      <SelectContent 
        className="max-h-[300px]"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        {chapters.map(chapter => (
          <SelectItem key={chapter} value={chapter}>
            Chapter {chapter}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};