-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isRunning" BOOLEAN NOT NULL DEFAULT true,
    "domain" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meta" TEXT
);
INSERT INTO "new_Application" ("domain", "id", "meta", "name", "slug", "type") SELECT "domain", "id", "meta", "name", "slug", "type" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_slug_key" ON "Application"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
