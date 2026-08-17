-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deviseCode" TEXT NOT NULL DEFAULT 'HTG',
ADD COLUMN     "tauxApplique" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Devise" (
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "symbole" TEXT NOT NULL,
    "taux" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "decimales" INTEGER NOT NULL DEFAULT 2,
    "base" BOOLEAN NOT NULL DEFAULT false,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devise_pkey" PRIMARY KEY ("code")
);

