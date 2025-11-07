"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { linkSourceToManga, unlinkSourceFromManga, refreshSourceChapters } from "@/app/(app)/dashboard/actions";
import { Source } from "@prisma/client";
import { UserMangaWithDetails } from "@/app/(app)/dashboard/page";
import Image from "next/image";
import { X, Plus, RefreshCw } from "lucide-react";

interface SourceManagerProps {
  item: UserMangaWithDetails;
  availableSources: Source[];
}

export const SourceManager = ({ item, availableSources }: SourceManagerProps) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddOrUpdateSource = () => {
    if (!selectedSourceId || !url.trim()) {
      toast.error("Please select a source and enter a URL.");
      return;
    }
    startTransition(async () => {
      const result = await linkSourceToManga(item.id, selectedSourceId, url.trim());
      if (result?.success) { toast.success(result.message); } 
      else { toast.error(result?.error || "An unknown error occurred."); }
    });
  };
  
  const handleRemoveSource = (userMangaSourceId: string) => {
    startTransition(async () => {
      const result = await unlinkSourceFromManga(userMangaSourceId);
      if (result?.success) { toast.success(result.message); } 
      else { toast.error(result?.error || "An unknown error occurred."); }
    });
  };

  const handleRefreshSource = (userMangaSourceId: string) => {
    startTransition(async () => {
      const result = await refreshSourceChapters(userMangaSourceId);
      if (result?.success) { toast.success(result.message); } 
      else { toast.error(result?.error || "An unknown error occurred."); }
    });
  };

  return (
    <div className="space-y-2">
      {/* List of currently linked sources */}
      {item.sources.map((linkedSource) => (
        <div key={linkedSource.id} className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
          {linkedSource.source.icon && <Image src={linkedSource.source.icon} alt={linkedSource.source.name} width={16} height={16} />}
          <span className="text-sm font-medium truncate flex-grow">{linkedSource.source.name}</span>
          <span className="text-sm text-muted-foreground">Ch. {linkedSource.latestChapter || '--'}</span>
          {linkedSource.source.name === 'MangaDex' && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRefreshSource(linkedSource.id)} disabled={isPending}>
              <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveSource(linkedSource.id)} disabled={isPending}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Form to add a new source */}
      <div className="flex items-center gap-2">
        <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
          <SelectTrigger className="w-[150px] flex-shrink-0 h-10"><SelectValue placeholder="Select source" /></SelectTrigger>
          <SelectContent>
            {availableSources.map((source) => (<SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste URL here..." className="flex-grow h-10" />
        <Button size="icon" className="h-10 w-10" onClick={handleAddOrUpdateSource} disabled={isPending}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};