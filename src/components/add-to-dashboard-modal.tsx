"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { addMangaToList } from "@/app/(app)/manga/[id]/actions";
import { Status } from "@prisma/client";
import Image from "next/image";

interface AddToDashboardModalProps {
  mangaData: { id: number; title: string; imageUrl: string; };
  children: React.ReactNode;
}

export const AddToDashboardModal = ({ mangaData, children }: AddToDashboardModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>("PLAN_TO_READ");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      // We can reuse our existing server action!
      const result = await addMangaToList({ ...mangaData, status }); // Pass status if action is modified to accept it
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
          {/* Add more fields here like in the video (Notes, Score, etc.) */}
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