import React, { useState, useEffect, useMemo } from 'react';
import { InvoiceData, LineItem, CalculatedLineItem } from '../types';
import { Trash2, Plus, Download, RefreshCw, Calculator, Save } from 'lucide-react';

interface InvoiceEditorProps {
  initialData: InvoiceData;
  onReset: () => void;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ initialData, onReset }) => {
  const [data, setData] = useState<InvoiceData>(initialData);

  // Auto-calculate derived values
  const calculatedItems: CalculatedLineItem[] = useMemo(() => {
    return data.items.map(item => {
      const amountIncTax = Math.floor(item.unitPriceIncTax * item.quantity);
      // Logic: Net = Amount / 1.1 (Truncated)
      const netPrice = Math.floor(amountIncTax / 1.1);
      const taxAmount = amountIncTax - netPrice;
      return {
        ...item,
        amountIncTax,
        netPrice,
        taxAmount
      };
    });
  }, [data.items]);

  const totalAmount = calculatedItems.reduce((sum, item) => sum + item.amountIncTax, 0);

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: "",
      quantity: 1,
      unit: "個",
      unitPriceIncTax: 0
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const deleteItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const downloadCSV = () => {
    // Header
    const headers = [
      "起案日", "依頼者", "納入先名", "相手先", 
      "品名", "数量", "単位", "税込単価", "金額(税込)", "本体価格", "消費税額"
    ];

    // Data rows
    const rows = calculatedItems.map(item => [
      data.date,
      data.requesterName,
      data.deliveryDestination,
      data.vendorName,
      item.name.replace(/,/g, "，"), // Handle commas in content
      item.quantity,
      item.unit,
      item.unitPriceIncTax,
      item.amountIncTax,
      item.netPrice,
      item.taxAmount
    ]);

    // Construct CSV content with BOM for Excel compatibility
    const csvContent = "\uFEFF" + 
      [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `purchase_request_${data.date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Action Bar */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-royal-600" />
          編集・確認
        </h2>
        <div className="flex space-x-3">
          <button 
            onClick={onReset}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            リセット
          </button>
          <button 
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-royal-600 rounded-lg hover:bg-royal-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            CSVダウンロード
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Global Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">起案日 (注文日)</label>
            <input 
              type="date" 
              name="date" 
              value={data.date} 
              onChange={handleGlobalChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">相手先 (業者名)</label>
            <input 
              type="text" 
              name="vendorName" 
              value={data.vendorName} 
              onChange={handleGlobalChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition-all"
              placeholder="例: Amazon Japan G.K."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">依頼者</label>
            <input 
              type="text" 
              name="requesterName" 
              value={data.requesterName} 
              onChange={handleGlobalChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition-all"
              placeholder="氏名を入力"
            />
          </div>
           <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">納入先</label>
            <input 
              type="text" 
              name="deliveryDestination" 
              value={data.deliveryDestination} 
              onChange={handleGlobalChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition-all"
              placeholder="学部・研究室など"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3 min-w-[200px]">品名</th>
                <th className="px-4 py-3 w-24 text-right">数量</th>
                <th className="px-4 py-3 w-20 text-center">単位</th>
                <th className="px-4 py-3 w-32 text-right">税込単価</th>
                <th className="px-4 py-3 w-32 text-right bg-royal-50 text-royal-800">金額(税込)</th>
                <th className="px-4 py-3 w-32 text-right text-slate-400 font-normal">本体(参考)</th>
                <th className="px-4 py-3 w-32 text-right text-slate-400 font-normal">税(参考)</th>
                <th className="px-4 py-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculatedItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-2 text-slate-400">{index + 1}</td>
                  <td className="px-4 py-2">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-800 font-medium placeholder-slate-300"
                      placeholder="品名を入力"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                     <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-right font-mono"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2">
                     <input 
                      type="text" 
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-center text-slate-500"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                     <input 
                      type="number" 
                      value={item.unitPriceIncTax}
                      onChange={(e) => handleItemChange(item.id, 'unitPriceIncTax', Number(e.target.value))}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-right font-mono"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-royal-700 bg-royal-50 font-mono">
                    ¥{item.amountIncTax.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono text-xs">
                    ¥{item.netPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400 font-mono text-xs">
                    ¥{item.taxAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="行を削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={9} className="px-4 py-3">
                  <button 
                    onClick={addItem}
                    className="flex items-center text-sm text-royal-600 hover:text-royal-800 font-medium transition-colors"
                  >
                    <Plus size={16} className="mr-1" />
                    行を追加
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-800 text-white">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right font-medium">合計金額 (税込)</td>
                <td className="px-4 py-3 text-right font-bold font-mono text-lg">
                  ¥{totalAmount.toLocaleString()}
                </td>
                <td colSpan={3} className="px-4 py-3 text-xs text-slate-400 text-right">
                  ※大学システム入力用計算済み
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;