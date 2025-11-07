"use client";

import { useState } from "react"; // <-- Import useState
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { X } from 'lucide-react';

interface ScorePopoverProps {
  score: number;
  setScore: (score: number) => void;
}

export const ScorePopover = ({ score, setScore }: ScorePopoverProps) => {
  // --- THIS IS THE FIX ---
  // 1. Add state to control the open/closed status of the popover
  const [isOpen, setIsOpen] = useState(false);
  // -----------------------

  const handleScoreChange = (value: number[]) => {
    setScore(value[0]);
  };

  // 2. Create a handler that does both actions: resets the score and closes the popover
  const handleResetAndClose = () => {
    setScore(0);
    setIsOpen(false);
  };

  return (
    // 3. Pass the state to the Popover to make it a controlled component
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
            {/* 4. Use the new handler for the "X" button */}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleResetAndClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Slider
            value={[score]} // Use `value` for a controlled slider
            max={10}
            step={1}
            onValueChange={handleScoreChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};