import Image from "next/image";

type InvoiceItem = {
  id: number;
  quantity: number;
  price: number;
  total: number;
  product: {
    title: string;
    productCode: string | null;
  } | null;
  variant: {
    size: string | null;
    color: string | null;
    barcode: string | null;
  } | null;
};

export type OrderInvoiceData = {
  id: number;
  customerName: string;
  customerPhone: string | null;
  address: string;
  orderedAt: string;
  subtotal: number;
  discount: number;
  afterDiscount: number;
  deliveryFee: number;
  note: string;
  trackingLabel?: string | null;
  items: InvoiceItem[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function formatRiel(value: number) {
  return new Intl.NumberFormat("km-KH", {
    style: "currency",
    currency: "KHR",
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function InvoiceContent({
  order,
  exchangeRate,
  preview,
}: {
  order: OrderInvoiceData;
  exchangeRate: number;
  preview?: boolean;
}) {
  const invoiceNumber = String(order.id).padStart(6, "0");
  const grandTotal = order.afterDiscount + order.deliveryFee;

  return (
    <div className={preview ? "invoice-preview-root" : "invoice-sheet"}>
      <div className="invoice-header">
        <div className="invoice-logo">
          <Image
            src="/logo.png"
            alt="T-Sport Cambodia"
            width={72}
            height={72}
            className="invoice-logo-image"
            priority={preview}
          />
        </div>
        <div>
          <div className="invoice-company">ធីស្ពតកម្ពុជា T-Sport Cambodia</div>
          <div>អាស័យដ្ឋាន: #30C, St.70 Sangkat Srah Chak, Khan Doun Penh, Phnom Penh</div>
          <div>លេខទូរស័ព្ទ: 098 84 74 27 / 010 51 03 53 / 089 345 679 / 088 999 5534</div>
        </div>
      </div>

      <div className="invoice-title">វិក្កយបត្រ / INVOICE</div>

      <div className="invoice-meta">
        <table className="invoice-table">
          <tbody>
            <tr>
              <td>អតិថិជន/customer</td>
              <td>{order.customerName || "Customer"}</td>
            </tr>
            <tr>
              <td>អាស័យដ្ឋាន/Address</td>
              <td>{order.address || "-"}</td>
            </tr>
            <tr>
              <td>លេខទូរស័ព្ទ/Telephone</td>
              <td>{order.customerPhone || "-"}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <div>
            <strong>លេខ​វិក្កយបត្រ: {invoiceNumber}</strong>
          </div>
          <div>កាលបរិច្ឆេទចេញ: {formatDate(order.orderedAt)}</div>
          {order.trackingLabel ? <div>Tracking: {order.trackingLabel}</div> : null}
        </div>
      </div>

      <table className="invoice-table">
        <tbody>
          <tr>
            <th>
              ល.រ
              <br />
              No
            </th>
            <th>
              លេខកូដ
              <br />
              Barcode
            </th>
            <th>
              បរិយាយ
              <br />
              Description
            </th>
            <th>
              ទំហំ-ពណ៏
              <br />
              Size-Color
            </th>
            <th>
              បរិមាណ
              <br />
              Quantity
            </th>
            <th>
              តម្លៃឯកតា
              <br />
              Unit Price
            </th>
            <th>
              តម្លៃចុះហើយ
              <br />
              After Dis
            </th>
            <th>
              តម្លៃសរុប
              <br />
              Amount
            </th>
          </tr>
          {order.items.map((item, index) => {
            const afterDiscountUnit = item.quantity ? item.total / item.quantity : item.total;

            return (
              <tr key={item.id}>
                <td className="center">{index + 1}</td>
                <td>{item.variant?.barcode || item.product?.productCode || "-"}</td>
                <td>{item.product?.title || "Unknown product"}</td>
                <td>
                  Size: {item.variant?.size || "-"}
                  <br />
                  Color: {item.variant?.color || "-"}
                </td>
                <td className="center">{item.quantity}</td>
                <td className="right">{formatMoney(item.price)}</td>
                <td className="right">{formatMoney(afterDiscountUnit)}</td>
                <td className="right">{formatMoney(item.total)}</td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={4} rowSpan={6} className="invoice-note">
              - ទំនិញដែលទិញហើយមិនអាចប្តូរជាលុយវិញបានទេ
              <br />
              - អតិថិជនបោះដុំអាចបង្វិលទំនិញដែលមានបញ្ហាខុសពីការកម្ម៉ុងក្នុងរយះពេល១ខែដោយគិតចាប់ពីថ្ងៃទិញនិងភ្ចាប់វិក្កយបត្រមកជាមួយ
              <br />
              - ការវេរលុយអាចផ្ញើរតាម TrueMoney, Wing, ឬតាមធនាគារ(ABA, ACLEDA)
            </td>
            <td>Sub-Total</td>
            <td colSpan={2} className="right">
              {formatRiel(order.subtotal * exchangeRate)}
            </td>
            <td className="right">{formatMoney(order.subtotal)}</td>
          </tr>
          <tr>
            <td>Discount</td>
            <td colSpan={2} className="right">
              {formatRiel(order.discount * exchangeRate)}
            </td>
            <td className="right">{formatMoney(order.discount)}</td>
          </tr>
          <tr>
            <td>After Discount</td>
            <td colSpan={2} className="right">
              {formatRiel(order.afterDiscount * exchangeRate)}
            </td>
            <td className="right">{formatMoney(order.afterDiscount)}</td>
          </tr>
          <tr>
            <td>Delivery Fee</td>
            <td colSpan={2} className="right">
              {formatRiel(order.deliveryFee * exchangeRate)}
            </td>
            <td className="right">{formatMoney(order.deliveryFee)}</td>
          </tr>
          <tr>
            <td>Balance</td>
            <td colSpan={2} className="right">
              {formatRiel(grandTotal * exchangeRate)}
            </td>
            <td className="right">{formatMoney(grandTotal)}</td>
          </tr>
          <tr>
            <td>Note</td>
            <td colSpan={3}>{order.note || "-"}</td>
          </tr>
        </tbody>
      </table>

      <div className="invoice-sign">
        <div className="invoice-sign-line">អនុម័តដោយ/Approved By</div>
        <div className="invoice-sign-line">ផ្នែកឃ្លាំង/Stock</div>
        <div className="invoice-sign-line">ផ្នែកលក់/The Seller</div>
        <div className="invoice-sign-line">អតិថិជន/Customer</div>
      </div>
    </div>
  );
}

export function OrderInvoicePreview({
  order,
  exchangeRate,
}: {
  order: OrderInvoiceData;
  exchangeRate: number;
}) {
  return (
    <div className="rounded-lg border bg-white p-6 text-[12px] text-slate-900 shadow-sm">
      <style>{`
        .invoice-preview-root,
        .invoice-sheet {
          width: 100%;
          color: #111827;
          font-family: Arial, "Khmer OS", "Noto Sans Khmer", sans-serif;
          font-size: 12px;
          line-height: 1.35;
        }
        .invoice-header {
          display: grid;
          grid-template-columns: 76px 1fr;
          gap: 14px;
          align-items: center;
          border-bottom: 2px solid #111827;
          padding-bottom: 12px;
        }
        .invoice-logo {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .invoice-logo-image {
          width: 72px;
          height: 72px;
          object-fit: contain;
        }
        .invoice-company { font-size: 15px; font-weight: 700; }
        .invoice-title { text-align: center; font-size: 20px; margin: 18px 0; font-weight: 800; }
        .invoice-meta {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
          margin-bottom: 16px;
        }
        .invoice-table { width: 100%; border-collapse: collapse; }
        .invoice-table th, .invoice-table td {
          border: 1px solid #111827;
          padding: 6px;
          vertical-align: top;
        }
        .invoice-table th { text-align: center; font-weight: 700; }
        .invoice-table .right { text-align: right; }
        .invoice-table .center { text-align: center; }
        .invoice-note { text-align: left; line-height: 1.5; }
        .invoice-sign {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
          margin-top: 56px;
          text-align: center;
        }
        .invoice-sign-line { border-top: 1px solid #111827; padding-top: 8px; }
      `}</style>
      <InvoiceContent order={order} exchangeRate={exchangeRate} preview />
    </div>
  );
}

export function PrintableInvoice({
  order,
  exchangeRate,
}: {
  order: OrderInvoiceData;
  exchangeRate: number;
}) {
  return (
    <div className="invoice-print-root">
      <style>{`
        .invoice-print-root { display: none; }
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden !important; }
          .invoice-print-root, .invoice-print-root * { visibility: visible !important; }
          .invoice-print-root {
            display: block !important;
            position: absolute;
            inset: 0;
            width: 100%;
            background: white;
            color: #111827;
            font-family: Arial, "Khmer OS", "Noto Sans Khmer", sans-serif;
            font-size: 12px;
            line-height: 1.35;
          }
          .invoice-sheet { width: 100%; }
          .invoice-header {
            display: grid;
            grid-template-columns: 76px 1fr;
            gap: 14px;
            align-items: center;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
          }
          .invoice-logo {
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .invoice-logo-image {
            width: 72px;
            height: 72px;
            object-fit: contain;
          }
          .invoice-company { font-size: 15px; font-weight: 700; }
          .invoice-title { text-align: center; font-size: 20px; margin: 18px 0; font-weight: 800; }
          .invoice-meta {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 24px;
            margin-bottom: 16px;
          }
          .invoice-table { width: 100%; border-collapse: collapse; }
          .invoice-table th, .invoice-table td {
            border: 1px solid #111827;
            padding: 6px;
            vertical-align: top;
          }
          .invoice-table th { text-align: center; font-weight: 700; }
          .invoice-table .right { text-align: right; }
          .invoice-table .center { text-align: center; }
          .invoice-note { text-align: left; line-height: 1.5; }
          .invoice-sign {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 28px;
            margin-top: 56px;
            text-align: center;
          }
          .invoice-sign-line { border-top: 1px solid #111827; padding-top: 8px; }
        }
      `}</style>
      <InvoiceContent order={order} exchangeRate={exchangeRate} />
    </div>
  );
}
