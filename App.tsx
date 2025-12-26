import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import InvoiceEditor from './components/InvoiceEditor';
import ApiKeyInput from './components/ApiKeyInput';
import { InvoiceData } from './types';
import { parseInvoiceWithGemini } from './services/geminiService';
import { AlertTriangle, Key } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('gemini_api_key', key);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    sessionStorage.removeItem('gemini_api_key');
    setData(null);
  };

  const handleFileSelect = async (file: File) => {
    if (!apiKey) {
      setError("API Keyが設定されていません。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];

        try {
          const parsedData = await parseInvoiceWithGemini(file, file.type, base64Data, apiKey);
          setData(parsedData);
        } catch (err: any) {
          setError(err.message || "解析中に不明なエラーが発生しました。");
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("ファイルの読み込みに失敗しました。");
        setLoading(false);
      };

    } catch (e) {
      setError("処理を開始できませんでした。");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!apiKey ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <ApiKeyInput onSave={handleSaveApiKey} />
          </div>
        ) : !data ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4 mt-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                書類から<span className="text-royal-600">購入依頼データ</span>を自動作成
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-600">
                請求書や納品書をアップロードするだけで、AIが品名・金額・日付を解析。<br />
                大学の会計システムに対応した形式でCSVを出力します。
              </p>
            </div>

            <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />

            {error && (
              <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 text-center text-sm text-slate-500">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1">OCR & AI解析</div>
                Geminiが手書きや複雑なレイアウトも高精度に読み取ります。
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1">自動税計算</div>
                税込単価から本体価格と消費税を自動で逆算・端数処理します。
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1">CSVエクスポート</div>
                文字化けしないUTF-8(BOM)形式で購入依頼CSVを出力します。
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-300">
            <InvoiceEditor initialData={data} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <div>&copy; {new Date().getFullYear()} Order Parser. Powered by Google Gemini.</div>
          {apiKey && (
            <button
              onClick={handleClearApiKey}
              className="mt-2 md:mt-0 flex items-center text-slate-400 hover:text-royal-600 transition-colors text-xs"
            >
              <Key className="w-3 h-3 mr-1" />
              APIキー再設定
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;