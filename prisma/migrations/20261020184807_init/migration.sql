CREATE TABLE "Entrega" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "motoristaId" INTEGER,
    CONSTRAINT "Entrega_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "Motorista" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Motorista" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "placaVeiculo" TEXT,
    "status" TEXT NOT NULL
);

CREATE TABLE "Evento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "descricao" TEXT NOT NULL,
    "entregaId" INTEGER NOT NULL,
    CONSTRAINT "Evento_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "Entrega" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Motorista_cpf_key" ON "Motorista"("cpf");

CREATE INDEX "Evento_entregaId_id_idx" ON "Evento"("entregaId", "id");
