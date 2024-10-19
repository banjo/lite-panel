-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "port" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "basicAuth" TEXT
);
