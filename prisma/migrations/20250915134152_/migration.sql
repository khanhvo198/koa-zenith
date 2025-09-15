/*
  Warnings:

  - Added the required column `icon` to the `Deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mastered` to the `Deck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `definitions` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examples` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partOfSpeech` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Deck" ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "mastered" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Word" ADD COLUMN     "definitions" TEXT NOT NULL,
ADD COLUMN     "examples" TEXT NOT NULL,
ADD COLUMN     "partOfSpeech" TEXT NOT NULL;
