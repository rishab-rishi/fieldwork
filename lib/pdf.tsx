import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { toNumber } from "@/lib/format";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  h1: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  muted: { color: "#6b7280" },
  section: { marginBottom: 20 },
  label: { fontSize: 8, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 },
  twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  table: { marginTop: 12, borderTop: "1px solid #e5e7eb" },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    paddingVertical: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  colDesc: { flex: 5 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 2, textAlign: "right" },
  colAmount: { flex: 2, textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 4 },
  totalsLabel: { color: "#6b7280" },
  grandTotal: { fontSize: 12, fontWeight: 700 },
  badge: {
    fontSize: 9,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    alignSelf: "flex-start",
  },
  notes: { marginTop: 24, fontSize: 9, color: "#6b7280" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#9ca3af" },
});

type PdfInvoice = {
  number: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: unknown;
  tax: unknown;
  total: unknown;
  notes: string | null;
  items: { description: string; quantity: unknown; unitPrice: unknown; amount: unknown }[];
};

function money(value: unknown) {
  return `$${toNumber(value as never).toFixed(2)}`;
}

function date(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function InvoiceDocument({
  invoice,
  accountName,
  client,
}: {
  invoice: PdfInvoice;
  accountName: string;
  client: { name: string; email: string; company: string | null };
}) {
  return (
    <Document title={`Invoice ${invoice.number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.h1}>{accountName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.h1}>Invoice</Text>
            <Text style={styles.muted}>{invoice.number}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View>
            <Text style={styles.label}>Billed to</Text>
            <Text>{client.name}</Text>
            {client.company && <Text style={styles.muted}>{client.company}</Text>}
            <Text style={styles.muted}>{client.email}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.badge}>
                <Text>{invoice.status}</Text>
              </View>
            </View>
            <Text style={styles.label}>Issue date</Text>
            <Text style={{ marginBottom: 6 }}>{date(invoice.issueDate)}</Text>
            <Text style={styles.label}>Due date</Text>
            <Text>{date(invoice.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDesc, styles.label]}>Description</Text>
            <Text style={[styles.colQty, styles.label]}>Qty</Text>
            <Text style={[styles.colPrice, styles.label]}>Unit price</Text>
            <Text style={[styles.colAmount, styles.label]}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{toNumber(item.quantity as never)}</Text>
              <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
              <Text style={styles.colAmount}>{money(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{money(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text>{money(invoice.tax)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.grandTotal}>Total</Text>
            <Text style={styles.grandTotal}>{money(invoice.total)}</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.label}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Generated by Fieldwork — {accountName}</Text>
        </View>
      </Page>
    </Document>
  );
}
