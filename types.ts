export interface LineItem {
  id: string; // Unique ID for UI handling
  name: string;
  quantity: number;
  unit: string;
  unitPriceIncTax: number; // Single item price including tax
}

export interface InvoiceData {
  date: string;
  vendorName: string;
  requesterName: string;
  deliveryDestination: string;
  items: LineItem[];
}

// Derived interface for row calculations
export interface CalculatedLineItem extends LineItem {
  amountIncTax: number;
  netPrice: number;
  taxAmount: number;
}