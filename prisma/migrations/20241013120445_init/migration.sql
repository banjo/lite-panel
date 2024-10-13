-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "domain" TEXT NOT NULL
);
