/*
  Warnings:

  - You are about to drop the column `basicAuth` on the `Config` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "port" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "username" TEXT,
    "hashedPassword" TEXT
);
INSERT INTO "new_Config" ("domain", "id", "port", "serviceName") SELECT "domain", "id", "port", "serviceName" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
