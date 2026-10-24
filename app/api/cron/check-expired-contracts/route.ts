import { deactivateExpiredContractsService } from "@/server/services/contract-expiration";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await deactivateExpiredContractsService();
    return Response.json({
      success: true,
      message: `Checked contracts: ${result.deactivatedCount} deactivated due to expiration.`,
      ...result,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to execute contract expiration job",
      },
      { status: 500 }
    );
  }
}
