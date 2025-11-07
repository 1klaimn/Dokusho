import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define a type for the new detailed info lines
interface InfoLine {
  label: string;
  value: string;
}

// Update the props to be more flexible
interface MangaCardProps {
  title: string;
  imageUrl: string;
  href: string;
  badgeText?: string; // For the simple corner badge
  infoLines?: InfoLine[]; // For the detailed view
}

export const MangaCard = ({ title, imageUrl, href, badgeText, infoLines }: MangaCardProps) => {
  return (
    <Link href={href} className="group flex flex-col h-full">
      <Card className="overflow-hidden grow flex flex-col">
        <CardContent className="p-0 relative">
          <Image
            src={imageUrl}
            alt={title}
            width={300}
            height={450}
            className="w-full h-auto object-cover aspect-2/3 group-hover:scale-105 transition-transform duration-300"
          />
          {badgeText && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2"
            >
              {badgeText}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="p-3 flex flex-col items-start w-full">
          <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors mb-2 w-full truncate">
            {title}
          </h3>
          {infoLines && (
            <div className="space-y-1 w-full">
              {infoLines.map((line, index) => (
                <div key={index} className="flex items-center justify-between text-xs w-full">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">
                    {line.label}
                  </Badge>
                  <span className="text-muted-foreground">{line.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};