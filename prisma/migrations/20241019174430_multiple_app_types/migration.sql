/*
  Warnings:

  - Added the required column `type` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meta" TEXT
);
INSERT INTO "new_Application" ("domain", "id", "name", "slug") SELECT "domain", "id", "name", "slug" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_slug_key" ON "Application"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
