-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Speaker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Lecture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "speakerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    CONSTRAINT "Lecture_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserLecture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "lectureId" INTEGER NOT NULL,
    CONSTRAINT "UserLecture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserLecture_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserLecture_userId_lectureId_idx" ON "UserLecture"("userId", "lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLecture_userId_lectureId_key" ON "UserLecture"("userId", "lectureId");

-- 제약 조건
ALTER TABLE "Lecture"
ADD CONSTRAINT "Lecture_capacity_check" CHECK ("registeredCount" <= "capacity");
