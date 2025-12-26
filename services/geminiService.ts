import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InvoiceData, LineItem } from "../types";

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export const parseInvoiceWithGemini = async (
  file: File,
  mimeType: string,
  base64Data: string
): Promise<InvoiceData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define the schema for structured output
  const itemSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Product name or description. Keep important model numbers." },
      quantity: { type: Type.NUMBER, description: "Quantity of the item." },
      unit: { type: Type.STRING, description: "Unit of measure (e.g., 個, 式, 箱). Default to '個' if unknown." },
      unitPriceIncTax: { type: Type.NUMBER, description: "Unit price including tax." },
    },
    required: ["name", "quantity", "unitPriceIncTax"],
  };

  const invoiceSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: "Invoice or Order date in YYYY-MM-DD format." },
      vendorName: { type: Type.STRING, description: "Name of the vendor/supplier." },
      requesterName: { type: Type.STRING, description: "Name of the person ordering (if visible)." },
      deliveryDestination: { type: Type.STRING, description: "Delivery address or department name." },
      items: {
        type: Type.ARRAY,
        items: itemSchema,
        description: "List of purchased items.",
      },
    },
    required: ["date", "vendorName", "items"],
  };

  const model = "gemini-3-flash-preview"; 

  const systemInstruction = `
    あなたは大学の経理事務の専門家です。
    渡された請求書・納品書・領収書の画像/PDFから、会計システム入力に必要な情報を抽出してください。
    
    以下のルールを厳守してください：
    1. 日付は YYYY-MM-DD 形式に統一してください。不明な場合は本日の日付を入れてください。
    2. 商品名が長すぎる場合は、重要な型番やキーワードを残して要約してください。
    3. 広告、クーポン、注釈などの明細以外のテキストは無視してください。
    4. 金額はすべて「税込単価」として抽出してください。
    5. 数量が明記されていない場合は 1 としてください。
    6. 単位が不明な場合は「個」または「式」としてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Extract invoice data specifically specifically adhering to the JSON schema.",
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: invoiceSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);

    // Post-process to add IDs and ensure safety
    return {
      date: parsed.date || new Date().toISOString().split('T')[0],
      vendorName: parsed.vendorName || "",
      requesterName: parsed.requesterName || "",
      deliveryDestination: parsed.deliveryDestination || "",
      items: Array.isArray(parsed.items)
        ? parsed.items.map((item: any) => ({
            id: generateId(),
            name: item.name || "不明な商品",
            quantity: Number(item.quantity) || 1,
            unit: item.unit || "個",
            unitPriceIncTax: Number(item.unitPriceIncTax) || 0,
          }))
        : [],
    };
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    throw new Error("AI解析に失敗しました。もう一度試すか、手動で入力してください。");
  }
};