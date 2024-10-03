-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lecture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "speakerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "registeredCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Lecture_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lecture" ("capacity", "date", "description", "id", "speakerId", "title") SELECT "capacity", "date", "description", "id", "speakerId", "title" FROM "Lecture";
DROP TABLE "Lecture";
ALTER TABLE "new_Lecture" RENAME TO "Lecture";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
