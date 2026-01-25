import React, { useState, useEffect } from 'react';
import { Loader } from '../components'; // הייבוא שלך

const StoreDesigner = ({ storeAddress, authFetch }) => {
    const [loading, setLoading] = useState(false);
    
    // State לעיצוב
    const [theme, setTheme] = useState({
        primaryColor: '#EAB308', // הצהוב שלך
        secondaryColor: '#1E293B',
        backgroundColor: '#0F172A',
        textColor: '#FFFFFF',
    });

    const [assets, setAssets] = useState({
        logoIpfs: '',
        bannerIpfs: ''
    });

    // טעינת העיצוב הקיים
    useEffect(() => {
        const loadDesign = async () => {
            try {
                // שים לב: כאן זה GET פומבי, אבל בתוך האדמין עדיף להשתמש ב-authFetch אם בנית route מתאים
                const res = await fetch(`${import.meta.env.VITE_MONGO_SERVER_API}/api/store/design/${storeAddress}`);
                const data = await res.json();
                if (data.design) {
                    setTheme(data.design.theme);
                    setAssets(data.design.assets);
                }
            } catch (e) {
                console.error("Failed to load design");
            }
        };
        if(storeAddress) loadDesign();
    }, [storeAddress]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await authFetch('/store/update-design', { theme, assets });
            alert("Design saved successfully! 🎨");
        } catch (e) {
            alert("Error saving design");
        }
        setLoading(false);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mt-6">
            <h2 className="text-2xl text-white font-bold mb-6">🎨 Store Appearance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* צבעים */}
                <div className="space-y-4">
                    <h3 className="text-gray-300 font-semibold">Theme Colors</h3>
                    
                    <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                        <span className="text-white">Primary Color (Buttons/Highlights)</span>
                        <input 
                            type="color" 
                            value={theme.primaryColor}
                            onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                        <span className="text-white">Background Color</span>
                        <input 
                            type="color" 
                            value={theme.backgroundColor}
                            onChange={(e) => setTheme({...theme, backgroundColor: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                        <span className="text-white">Card/Section Background</span>
                        <input 
                            type="color" 
                            value={theme.secondaryColor}
                            onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                    </div>
                    
                    <div className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                        <span className="text-white">Text Color</span>
                        <input 
                            type="color" 
                            value={theme.textColor}
                            onChange={(e) => setTheme({...theme, textColor: e.target.value})}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                    </div>
                </div>

                {/* תצוגה מקדימה חיה */}
                <div className="space-y-4">
                    <h3 className="text-gray-300 font-semibold">Live Preview (Mockup)</h3>
                    
                    {/* כאן אנו משתמשים ב-Style דינמי כדי להראות למשתמש איך זה ייראה */}
                    <div 
                        className="p-4 rounded-xl border border-white/10 shadow-xl"
                        style={{ backgroundColor: theme.backgroundColor }}
                    >
                        <div 
                            className="h-20 rounded-lg mb-4 flex items-end p-2"
                            style={{ backgroundColor: theme.secondaryColor, border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <h1 style={{ color: theme.textColor }} className="font-bold text-lg">My Store</h1>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                style={{ backgroundColor: theme.primaryColor, color: '#000' }}
                                className="px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
                            >
                                Buy Product
                            </button>
                            <div 
                                style={{ color: theme.textColor, opacity: 0.7 }}
                                className="text-sm flex items-center"
                            >
                                150 USDC
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Use the generic Image uploader above to get CIDs for Logo/Banner and paste them in the DB or add inputs here.</p>
                </div>
            </div>

            <button 
                onClick={handleSave} 
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-bold text-white shadow-lg hover:opacity-90"
            >
                {loading ? 'Saving...' : 'Save Design Settings'}
            </button>
        </div>
    );
};

export default StoreDesigner;