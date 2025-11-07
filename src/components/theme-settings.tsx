"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

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