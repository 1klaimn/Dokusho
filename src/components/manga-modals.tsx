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
import { updateUserMangaEntry, addMangaToList } from "@/src/lib/server-actions";
import { Source, Status, Tag } from "@prisma/client";
import { UserMangaWithDetails } from "@/app/(app)/dashboard/page";
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatStatus } from "@/src/lib/utils";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { X } from 'lucide-react';
import { ChapterSelector, MultiSelectTag, SourceManager } from "./manga-controls";

interface EditProgressModalProps {
  item: UserMangaWithDetails;
  availableSources: Source[];
  userTags: Tag[];
  children: React.ReactNode;
}

interface AddToDashboardModalProps {
  mangaData: { 
    id: number; 
    title: string; 
    imageUrl: string;
    type?: string;
    status?: string;
  };
  children: React.ReactNode;
}

interface NotesModalProps {
  notes: string;
  setNotes: (notes: string) => void;
}

interface ScorePopoverProps {
  score: number;
  setScore: (score: number) => void;
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
          <div className="hidden sm:block w-[400px] shrink-0">
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

export const AddToDashboardModal = ({ mangaData, children }: AddToDashboardModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>("PLAN_TO_READ");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await addMangaToList({ 
        ...mangaData, 
        userStatus: status 
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
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Image src={mangaData.imageUrl} alt={mangaData.title} width={100} height={150} className="rounded-md object-cover mx-auto" />
          <DialogTitle className="text-center pt-2">{mangaData.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: Status) => setStatus(value)}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.values(Status).map((s) => (<SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          {}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending ? "Adding..." : "Add to Dashboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const NotesModal = ({ notes, setNotes }: NotesModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);

  const handleUpdate = () => {
    setNotes(localNotes);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-10 font-normal justify-start text-muted-foreground">
          {notes ? <p className="truncate">{notes}</p> : "Click to add a note"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notes</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="write">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write">
            <Textarea 
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Add your notes here"
              className="mt-2 min-h-[150px]"
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-2 min-h-[150px] border p-2 rounded-md">
            {localNotes || "Nothing to preview"}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={handleUpdate}>Update notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ScorePopover = ({ score, setScore }: ScorePopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // -----------------------

  const handleScoreChange = (value: number[]) => {
    setScore(value[0]);
  };

  const handleResetAndClose = () => {
    setScore(0);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full h-10 font-normal justify-start text-muted-foreground">
          {score > 0 ? `Score: ${score} / 10` : "Click to rate"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium leading-none">Score: {score} / 10</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleResetAndClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Slider
            value={[score]} 
            max={10}
            step={1}
            onValueChange={handleScoreChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};