const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetWalletTable() {
  try {
    // Truncate the Wallet table and reset the id sequence
    await prisma.$executeRaw`TRUNCATE TABLE "TransactionSignature" RESTART IDENTITY CASCADE;`;
    console.log("Wallet table truncated and id sequence reset successfully.");
  } catch (error) {
    console.error("Error resetting Wallet table sequence:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetWalletTable();
