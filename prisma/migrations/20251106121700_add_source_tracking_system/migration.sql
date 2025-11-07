-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMangaSource" (
    "id" TEXT NOT NULL,
    "userMangaId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "latestChapter" TEXT,

    CONSTRAINT "UserMangaSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserMangaSource_userMangaId_sourceId_key" ON "UserMangaSource"("userMangaId", "sourceId");

-- AddForeignKey
ALTER TABLE "UserMangaSource" ADD CONSTRAINT "UserMangaSource_userMangaId_fkey" FOREIGN KEY ("userMangaId") REFERENCES "UserManga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMangaSource" ADD CONSTRAINT "UserMangaSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
