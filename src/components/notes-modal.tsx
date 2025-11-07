"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotesModalProps {
  notes: string;
  setNotes: (notes: string) => void;
}

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