"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  addMangaToList,
  findNextChapterUrl,
  getChaptersForSource,
  linkSourceToManga,
  refreshSourceChapters,
  removeMangaFromList,
  unlinkSourceFromManga,
} from "@/src/lib/server-actions";
import {
  ArrowUpRight,
  Badge,
  Check,
  ChevronsUpDown,
  Command,
  LinkIcon,
  Loader2,
  OctagonXIcon,
  Plus,
  PlusCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "cmdk";
import { UserMangaWithDetails } from "../app/(app)/dashboard/page";
import { Tag, Source } from "@prisma/client";

interface AddToListButtonProps {
  mangaData: {
    id: number;
    title: string;
    imageUrl: string;
    type?: string;
    status?: string;
  };
}

interface AddToListIconButtonProps {
  mangaData: {
    id: number;
    title: string;
    imageUrl: string;
    type?: string;
    status?: string;
  };
}

interface ChapterSelectorProps {
  item: UserMangaWithDetails;
  progress: number;
  setProgress: (progress: number) => void;
}

export const AddToListButton = ({ mangaData }: AddToListButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addMangaToList(mangaData); // The full data is now passed
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      size="lg"
      className="w-full"
    >
      <PlusCircle className="mr-2 h-5 w-5" />
      {isPending ? "Adding..." : "Add to List"}
    </Button>
  );
};

export const AddToListIconButton = ({
  mangaData,
}: AddToListIconButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addMangaToList(mangaData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </Button>
  );
};

export const RemoveMangaButton = ({ userMangaId }: { userMangaId: string }) => {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeMangaFromList(userMangaId);
      if (result.success) {
        // --- Use a success toast but with a custom, destructive icon ---
        toast.success(result.message, {
          icon: (
            <OctagonXIcon className="size-4 text-red-600 dark:text-red-400" />
          ),
        });
        // -----------------------------------------------------------------
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenuItem
      className="text-red-500"
      onClick={handleRemove}
      disabled={isPending}
      onSelect={(e) => e.preventDefault()}
    >
      {isPending ? "Removing..." : "Remove from list"}
    </DropdownMenuItem>
  );
};

export const CopyLinkButton = ({ id }: { id: number }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/manga/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-8 w-8 rounded-md hover:bg-accent/50"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <LinkIcon className="h-3.5 w-3.5" />
      )}
    </Button>
  );
};

interface GoToSourceButtonProps {
  item: UserMangaWithDetails;
}

export const GoToSourceButton = ({ item }: GoToSourceButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const hasMangaDexSource = item.sources.some(
    (s) => s.source.name === "MangaDex"
  );

  const handleClick = () => {
    startTransition(async () => {
      const result = await findNextChapterUrl(item.id);
      if (result.success && result.url) {
        // Open the found URL in a new tab
        window.open(result.url, "_blank", "noopener,noreferrer");
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

export const ChapterSelector = ({
  item,
  progress,
  setProgress,
}: ChapterSelectorProps) => {
  const [chapters, setChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mangaDexSource = item.sources.find((s) => s.source.name === "MangaDex");

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
        {chapters.map((chapter) => (
          <SelectItem key={chapter} value={chapter}>
            Chapter {chapter}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface MultiSelectTagProps {
  allUserTags: Tag[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  className?: string;
}

export const MultiSelectTag = ({
  allUserTags,
  selectedTags,
  setSelectedTags,
  className,
}: MultiSelectTagProps) => {
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
                {selectedTags.slice(0, 1).map((tag) => (
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
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedTags.includes(tag.name)
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
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

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export const TagInput = ({ tags, setTags }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter..."
      />
    </div>
  );
};

interface SourceManagerProps {
  item: UserMangaWithDetails;
  availableSources: Source[];
}

export const SourceManager = ({
  item,
  availableSources,
}: SourceManagerProps) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddOrUpdateSource = () => {
    if (!selectedSourceId || !url.trim()) {
      toast.error("Please select a source and enter a URL.");
      return;
    }
    startTransition(async () => {
      const result = await linkSourceToManga(
        item.id,
        selectedSourceId,
        url.trim()
      );
      if (result?.success) {
        toast.success(result.message);
      } else {
        toast.error(result?.error || "An unknown error occurred.");
      }
    });
  };

  const handleRemoveSource = (userMangaSourceId: string) => {
    startTransition(async () => {
      const result = await unlinkSourceFromManga(userMangaSourceId);
      if (result?.success) {
        toast.success(result.message);
      } else {
        toast.error(result?.error || "An unknown error occurred.");
      }
    });
  };

  const handleRefreshSource = (userMangaSourceId: string) => {
    startTransition(async () => {
      const result = await refreshSourceChapters(userMangaSourceId);
      if (result?.success) {
        toast.success(result.message);
      } else {
        toast.error(result?.error || "An unknown error occurred.");
      }
    });
  };

  return (
    <div className="space-y-2">
      {/* List of currently linked sources */}
      {item.sources.map((linkedSource) => (
        <div
          key={linkedSource.id}
          className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          {linkedSource.source.icon && (
            <Image
              src={linkedSource.source.icon}
              alt={linkedSource.source.name}
              width={16}
              height={16}
            />
          )}
          <span className="text-sm font-medium truncate grow">
            {linkedSource.source.name}
          </span>
          <span className="text-sm text-muted-foreground">
            Ch. {linkedSource.latestChapter || "--"}
          </span>
          {linkedSource.source.name === "MangaDex" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleRefreshSource(linkedSource.id)}
              disabled={isPending}
            >
              <RefreshCw
                className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleRemoveSource(linkedSource.id)}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Form to add a new source */}
      <div className="flex items-center gap-2">
        <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
          <SelectTrigger className="w-[150px] shrink-0 h-10">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {availableSources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste URL here..."
          className="grow h-10"
        />
        <Button
          size="icon"
          className="h-10 w-10"
          onClick={handleAddOrUpdateSource}
          disabled={isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
