"use client";

import { useState } from "react";
import { Tag } from "@prisma/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectTagProps {
  allUserTags: Tag[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  className?: string;
}

export const MultiSelectTag = ({ allUserTags, selectedTags, setSelectedTags, className }: MultiSelectTagProps) => {
  const [open, setOpen] = useState(false);

  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-10 font-normal", className)}
        >
          <div className="flex gap-1 flex-wrap items-center">
            {selectedTags.length > 0 ? (
              <>
                {selectedTags.slice(0, 1).map(tag => (
                   <Badge
                    variant="secondary"
                    key={tag}
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTag(tag);
                    }}
                  >
                    {tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
                {selectedTags.length > 1 && (
                  <Badge variant="outline" className="font-normal">
                    +{selectedTags.length - 1}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Choose a tag</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {allUserTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.name}
                  onSelect={() => handleToggleTag(tag.name)}
                >
                  <Check className={`mr-2 h-4 w-4 ${selectedTags.includes(tag.name) ? "opacity-100" : "opacity-0"}`} />
                  {tag.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};