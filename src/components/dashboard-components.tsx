"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tag } from "@prisma/client";
import { PlusCircle, List, LayoutGrid, Search, ArrowDownUp, ArrowDown, ArrowUp } from "lucide-react";
import { formatStatus } from "@/src/lib/utils";
import { Status } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MANGA_TYPES = ["Manga", "Manhwa", "Manhua"];
const PUBLICATION_STATUSES = ["Publishing", "Finished", "On Hiatus", "Discontinued"];
const SORT_OPTIONS = [
  { value: "updatedAt", label: "Last Updated" },
  { value: "title", label: "Title" },
  { value: "progress", label: "Progress" },
  { value: "score", label: "My Score" },
];

interface DashboardFiltersProps {
  userTags: Tag[];
}

export const DashboardFilters = ({ userTags }: DashboardFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "ALL";
  const currentType = searchParams.get("type") || "";
  const currentPubStatus = searchParams.get("pub_status") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentView = searchParams.get("view") || 'list';
  const currentSortBy = searchParams.get("sortBy") || "updatedAt";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const handleUrlChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Always set sortOrder and sortBy explicitly
    if (key === 'sortOrder' || key === 'sortBy') {
        params.set(key, value);
    } 
    // Handle toggling for checkbox-style filters
    else if (key === 'type' || key === 'pub_status' || key === 'tag') {
        if (params.get(key) === value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
    }
    // Handle regular filters and defaults
    else if (value && value !== "ALL" && value !== "list") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // If clicking the same sort option, toggle the order
    if (newSortBy === currentSortBy) {
      const newOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
      params.set('sortOrder', newOrder);
    } else {
      // If clicking a different sort option, set it with default desc order
      params.set('sortBy', newSortBy);
      params.set('sortOrder', 'desc');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleUrlChange("q", query);
  };

  // Get the current sort icon
  const getSortIcon = () => {
    if (currentSortOrder === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === currentSortBy)?.label || "Sort";

  return (
    <div className="flex flex-col gap-4">
      {/* --- TOP ROW: SEARCH, VIEW, SORT --- */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="relative grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your list..." className="pl-9 h-10" />
        </form>
        <ToggleGroup type="single" value={currentView} variant="outline" onValueChange={(view) => { if (view) handleUrlChange("view", view)}}>
          <ToggleGroupItem value="list"><List className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="grid"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <ArrowDownUp className="mr-2 h-4 w-4" />
              {currentSortLabel}
              {getSortIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {SORT_OPTIONS.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{option.label}</span>
                <div className="flex items-center gap-1">
                  {currentSortBy === option.value && (
                    currentSortOrder === 'asc' ? 
                      <ArrowUp className="h-4 w-4" /> : 
                      <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* --- BOTTOM ROW: FILTERS --- */}
      <div className="flex items-center gap-2">
        <Select value={currentStatus} onValueChange={(status) => handleUrlChange("status", status)}>
          <SelectTrigger className="w-auto sm:w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(Status).map((s) => (<SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />{currentType || "Content Type"}</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel><DropdownMenuSeparator />
            {MANGA_TYPES.map((type) => (<DropdownMenuCheckboxItem key={type} checked={currentType === type} onCheckedChange={() => handleUrlChange("type", type)}>{type}</DropdownMenuCheckboxItem>))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />{currentPubStatus || "Pub. Status"}</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Publication Status</DropdownMenuLabel><DropdownMenuSeparator />
            {PUBLICATION_STATUSES.map((status) => (<DropdownMenuCheckboxItem key={status} checked={currentPubStatus === status} onCheckedChange={() => handleUrlChange("pub_status", status)}>{status}</DropdownMenuCheckboxItem>))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={userTags.length === 0}><Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />{currentTag || "Tags"}</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel><DropdownMenuSeparator />
            {userTags.map((tag) => (<DropdownMenuCheckboxItem key={tag.id} checked={currentTag === tag.name} onCheckedChange={() => handleUrlChange("tag", tag.name)}>{tag.name}</DropdownMenuCheckboxItem>))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
}

export const PaginationControls = ({ currentPage, hasNextPage }: PaginationControlsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <span className="text-sm font-medium">
        Page {currentPage}
      </span>
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};