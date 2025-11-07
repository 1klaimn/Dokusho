"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Tag } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { createTag, deleteTag } from "../lib/server-actions";

export function ThemeSettings() {
  const { setTheme } = useTheme();
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Theme</h3>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setTheme("light")}>Light</Button>
        <Button variant="outline" onClick={() => setTheme("dark")}>Dark</Button>
        <Button variant="outline" onClick={() => setTheme("system")}>System</Button>
      </div>
    </div>
  );
}

interface TagManagerSettingsProps {
  userTags: Tag[];
}

export const TagManagerSettings = ({ userTags }: TagManagerSettingsProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreateTag = () => {
    startTransition(async () => {
      const result = await createTag(newTagName);
      if (result.success) {
        toast.success(result.message);
        setNewTagName("");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteTag = (tagId: string) => {
    startTransition(async () => {
      const result = await deleteTag(tagId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name..."
          disabled={isPending}
        />
        <Button onClick={handleCreateTag} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Tag"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {userTags.length > 0 ? (
          userTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
              {tag.name}
              <button
                type="button"
                onClick={() => handleDeleteTag(tag.id)}
                disabled={isPending}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">You haven't created any tags yet.</p>
        )}
      </div>
    </div>
  );
};