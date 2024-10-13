/*
  Warnings:

  - You are about to drop the column `port` on the `Application` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ReverseProxy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "port" INTEGER NOT NULL,
    "subPath" TEXT,
    "description" TEXT,
    "applicationId" INTEGER NOT NULL,
    CONSTRAINT "ReverseProxy_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT NOT NULL
);
INSERT INTO "new_Application" ("domain", "id", "name", "slug") SELECT "domain", "id", "name", "slug" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_slug_key" ON "Application"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
