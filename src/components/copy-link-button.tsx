"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Check } from "lucide-react";

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