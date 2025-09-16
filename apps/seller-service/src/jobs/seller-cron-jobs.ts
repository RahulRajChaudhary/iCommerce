import prisma from "../../../../packages/lib/prisma";
import cron from "node-cron";

// Run daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    // Find all sellers marked deleted and past the deletedAt date
    const expiredSellers = await prisma.sellers.findMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
      include: { shop: true },
    });

    for (const seller of expiredSellers) {
      // Delete shop if exists
      if (seller.shop) {
        await prisma.shops.delete({
          where: { id: seller.shop.id },
        });
      }

      // Delete seller
      await prisma.sellers.delete({
        where: { id: seller.id },
      });
    }
  } catch (error) {
    console.error("Error deleting expired sellers and shops:", error);
  }
});