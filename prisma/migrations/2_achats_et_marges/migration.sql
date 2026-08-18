-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "coutCentimes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "coutCentimes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'unite',
    "nombre" INTEGER NOT NULL,
    "quantiteParLot" INTEGER NOT NULL DEFAULT 1,
    "quantite" INTEGER NOT NULL,
    "prixTotalCentimes" INTEGER NOT NULL,
    "coutUnitaireCentimes" INTEGER NOT NULL,
    "fournisseur" TEXT,
    "note" TEXT,
    "achteLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteur" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Purchase_produitId_idx" ON "Purchase"("produitId");

-- CreateIndex
CREATE INDEX "Purchase_achteLe_idx" ON "Purchase"("achteLe");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

