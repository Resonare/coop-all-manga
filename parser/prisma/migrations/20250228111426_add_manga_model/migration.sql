-- CreateTable
CREATE TABLE "mangas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mangalib_url" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "mangas_mangalib_url_key" ON "mangas"("mangalib_url");
