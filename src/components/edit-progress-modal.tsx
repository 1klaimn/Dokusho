"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { updateUserMangaEntry } from "@/app/(app)/dashboard/actions";
import { Source, Status, Tag } from "@prisma/client";
import { UserMangaWithDetails } from "@/app/(app)/dashboard/page";
import { SourceManager } from "@/src/components/source-manager";
import { ChapterSelector } from "@/src/components/chapter-selector";
import { MultiSelectTag } from "@/src/components/multi-select-tag";
import { NotesModal } from "@/src/components/notes-modal";
import { ScorePopover } from "@/src/components/score-popover";
import { formatStatus } from "@/src/lib/utils";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EditProgressModalProps {
  item: UserMangaWithDetails;
  availableSources: Source[];
  userTags: Tag[];
  children: React.ReactNode;
}

export const EditProgressModal = ({ item, availableSources, userTags, children }: EditProgressModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(item.progress);
  const [status, setStatus] = useState<Status>(item.status);
  const [tags, setTags] = useState<string[]>(item.tags.map(t => t.name));
  const [notes, setNotes] = useState(item.notes || "");
  const [score, setScore] = useState(item.score || 0);
  const [isHidden, setIsHidden] = useState(item.isHidden);
  const [isFavourite, setIsFavourite] = useState(item.isFavourite);
  const [isPending, startTransition] = useTransition();
  const [trackingMode, setTrackingMode] = useState<'auto' | 'manual'>('auto');

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateUserMangaEntry(item.id, { 
        progress, status, tags, notes, score: score || null, isHidden, isFavourite 
      });
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0" showCloseButton={false}>
        <div className="flex">
          <div className="hidden sm:block w-[400px] flex-shrink-0">
            <Image 
              src={item.manga.imageUrl || ''} 
              alt={item.manga.title} 
              width={300} 
              height={450}
              className="rounded-l-lg w-full h-full"
            />
          </div>
          <div className="w-full relative overflow-y-auto max-h-[85vh]">
            <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 h-8 w-8 text-muted-foreground" 
                onClick={() => setIsOpen(false)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <DialogHeader className="text-left p-0">
                <DialogTitle className="text-xl font-semibold leading-tight pr-8">
                  {item.manga.title}
                </DialogTitle>
              </DialogHeader>
            </div>
            
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Last Read Chapter</Label>
                {trackingMode === 'auto' ? (
                  <ChapterSelector item={item} progress={progress} setProgress={setProgress} />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="number" placeholder="Volume" className="h-10" />
                    <Input type="number" value={progress} onChange={(e) => setProgress(Number(e.target.value))} placeholder="Chapter" className="h-10" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  Or track chapter <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setTrackingMode(trackingMode === 'auto' ? 'manual' : 'auto')}>{trackingMode === 'auto' ? 'manually' : 'automatically'}</Button>
                </p>
              </div>
            
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Source</Label>
                <SourceManager item={item} availableSources={availableSources} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={status} onValueChange={(value: Status) => setStatus(value)}>
                    <SelectTrigger className="w-54 h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(Status).map((s) => (
                        <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <MultiSelectTag allUserTags={userTags} selectedTags={tags} setSelectedTags={setTags} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <NotesModal notes={notes} setNotes={setNotes} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Score</Label>
                  <ScorePopover score={score} setScore={setScore} />
                </div>
              </div>
            
              <Separator className="my-4" />

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="hidden-switch" checked={isHidden} onCheckedChange={(checked) => setIsHidden(checked as boolean)} />
                  <Label htmlFor="hidden-switch" className="text-sm font-medium cursor-pointer">Hidden</Label>
                </div>
                <p className="text-xs text-muted-foreground -mt-2 ml-7">Hides entry from your public profile</p>

                <div className="flex items-center gap-2">
                  <Checkbox id="favourite-switch" checked={isFavourite} onCheckedChange={(checked) => setIsFavourite(checked as boolean)} />
                  <Label htmlFor="favourite-switch" className="text-sm font-medium cursor-pointer">Favourite</Label>
                </div>
                <p className="text-xs text-muted-foreground -mt-2 ml-7">Display on your public profile</p>
              </div>
            
              <DialogFooter className="pt-4">
                <Button onClick={handleSubmit} disabled={isPending} className="w-full h-10 bg-blue-500 hover:bg-blue-600">
                  {isPending ? "Updating..." : "Update Entry"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};