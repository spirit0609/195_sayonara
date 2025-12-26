import React, { useState } from 'react';
import { Key, Save, AlertCircle } from 'lucide-react';

interface ApiKeyInputProps {
    onSave: (key: string) => void;
    initialKey?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave, initialKey = '' }) => {
    const [key, setKey] = useState(initialKey);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!key.trim()) {
            setError('APIキーを入力してください');
            return;
        }
        // Basic validation (optional, can be improved)
        if (!key.startsWith('AIza')) {
            // Just a warning or strict check? Gemini keys usually start with AIza. 
            // Let's not be too strict in case it changes, but 'AIza' is standard.
        }
        onSave(key.trim());
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-royal-100 rounded-lg">
                    <Key className="w-6 h-6 text-royal-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">APIキーの設定</h2>
            </div>

            <p className="text-slate-600 mb-6 text-sm">
                Google Gemini APIを利用するために、APIキーが必要です。<br />
                キーはブラウザにのみ一時保存され、ブラウザを閉じると削除されます。
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
                        Gemini API Key
                    </label>
                    <input
                        type="password"
                        id="apiKey"
                        value={key}
                        onChange={(e) => {
                            setKey(e.target.value);
                            setError(null);
                        }}
                        placeholder="AIza..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500 outline-none transition-all"
                    />
                </div>

                {error && (
                    <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex justify-center items-center py-2.5 px-4 bg-royal-600 hover:bg-royal-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-royal-200"
                >
                    <Save className="w-4 h-4 mr-2" />
                    保存して開始
                </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-royal-600 hover:text-royal-800 underline"
                >
                    APIキーを取得する (Google AI Studio)
                </a>
            </div>
        </div>
    );
};

export default ApiKeyInput;
