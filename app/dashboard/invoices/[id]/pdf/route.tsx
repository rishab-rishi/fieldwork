import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { InvoiceDocument } from "@/lib/pdf";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { accountId } = await requireTeamSession();

  const invoice = await prisma.invoice.findFirst({
    where: { id, accountId },
    include: { client: true, account: true, items: true },
  });

  if (!invoice) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <InvoiceDocument invoice={invoice} accountName={invoice.account.name} client={invoice.client} />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
