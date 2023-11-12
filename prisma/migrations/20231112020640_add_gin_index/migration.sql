-- CreateIndex
CREATE INDEX "Manga_name_gin_index" ON "Manga" USING GIN ("name" gin_trgm_ops);
