"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sprout, TrendingUp, AlertTriangle, CheckCircle2, LogOut, LayoutDashboard } from "lucide-react";

// HII NI LINK MPYA YA BACKEND YAKO YA CLOUD (RENDER)
const API_URL = "https://analytiq-backend-1.onrender.com";

export default function Home() {
  const [step, setStep] = useState<"register" | "dashboard">("register");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState("");
  
  const [sectors, setSectors] = useState<any[]>([]);
  const [regFormData, setRegFormData] = useState({ companyName: "", sectorId: "", ceoName: "", email: "" });
  const [registering, setRegistering] = useState(false);

  const [template, setTemplate] = useState<any>(null);
  const [dashFormData, setDashFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const chartData = [
    { name: 'Jumatatu', Mayai: 280, Vifo: 1 },
    { name: 'Jumanne', Mayai: 310, Vifo: 0 },
    { name: 'Jumatano', Mayai: 290, Vifo: 2 },
    { name: 'Alhamisi', Mayai: 330, Vifo: 1 },
    { name: 'Ijumaa', Mayai: 350, Vifo: 0 },
  ];

  useEffect(() => {
    fetch(`${API_URL}/api/sectors`).then(res => res.json()).then(setSectors);
    const savedId = localStorage.getItem("analytiq_companyId");
    const savedName = localStorage.getItem("analytiq_companyName");
    if (savedId && savedName) {
      setCompanyId(parseInt(savedId));
      setCompanyName(savedName);
      setStep("dashboard");
    }
  }, []);

  useEffect(() => {
    if (step === "dashboard" && companyId) {
      fetch(`${API_URL}/api/templates/1`).then(res => res.json()).then(setTemplate);
    }
  }, [step, companyId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const response = await fetch(`${API_URL}/api/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regFormData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("analytiq_companyId", data.company.id.toString());
        localStorage.setItem("analytiq_companyName", data.company.companyName);
        setCompanyId(data.company.id);
        setCompanyName(data.company.companyName);
        setStep("dashboard");
      } else {
        alert("Imeshindikana. Tafadhali tumia email tofauti.");
      }
    } catch (error) {
      alert("Hitilafu imetokea. Hakikisha Backend inafanya kazi.");
    } finally {
      setRegistering(false);
    }
  };

  const handleDashInputChange = (key: string, value: any) => {
    setDashFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "mortality" && Number(value) > 2) {
      setAlertMessage("🚨 ALERT: Vifo vimezidi 2 leo! Tafadhali kagua afya ya kuku mara moja.");
    } else {
      setAlertMessage("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, recordDate: new Date().toISOString().split("T")[0], metricsData: dashFormData }),
      });
      if (response.ok) {
        setMessage("✅ Data imehifadhiwa kwenye database kwa mafanikio!");
        setDashFormData({});
        setAlertMessage("");
      } else {
        setMessage("❌ Imeshindikana kuhifadhi data.");
      }
    } catch (error) {
      setMessage("❌ Hitilafu imetokea.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("analytiq_companyId");
    localStorage.removeItem("analytiq_companyName");
    setStep("register");
    setCompanyId(null);
    setCompanyName("");
  };

  // --- VIEW 1: REGISTER (Premium Look) ---
  if (step === "register") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Sprout size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">ANALYTIQ</h1>
            <p className="text-slate-500">Fungua akaunti ya kampuni yako na anza kudhibiti faida yako.</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jina la Kampuni</label>
              <input required type="text" className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                placeholder="Mfano: Bugota Integrated Farms"
                value={regFormData.companyName} onChange={e => setRegFormData({...regFormData, companyName: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sector ya Biashara</label>
              <select required className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={regFormData.sectorId} onChange={e => setRegFormData({...regFormData, sectorId: e.target.value})}>
                <option value="">-- Chagua Sector --</option>
                {sectors.map(s => <option key={s.id} value={s.id}>{s.sectorName}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jina la CEO</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition" 
                  placeholder="Jina kamili"
                  value={regFormData.ceoName} onChange={e => setRegFormData({...regFormData, ceoName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition" 
                  placeholder="mzee@bugota.com"
                  value={regFormData.email} onChange={e => setRegFormData({...regFormData, email: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={registering} 
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:bg-blue-300 flex items-center justify-center gap-2">
              {registering ? "Inatengeneza..." : "🚀 Anza Sasa"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- VIEW 2: DASHBOARD (Premium Look) ---
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Sprout size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ANALYTIQ</h1>
              <p className="text-xs text-slate-500">Dashboard ya {companyName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition font-medium">
            <LogOut size={16} /> Ondoka
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {template && (
          <>
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-900/10">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-blue-200" size={24} />
                  <h3 className="font-semibold text-blue-100">Utabiri wa Faida</h3>
                </div>
                <p className="text-3xl font-bold mb-1">TZS 450,000</p>
                <p className="text-sm text-blue-200">Muda bora wa kuuza: Baada ya siku 14</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><CheckCircle2 size={20} /></div>
                  <h3 className="font-semibold text-slate-700">Hali ya Kuku</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">NZURI</p>
                <p className="text-sm text-slate-500">Hakuna tatizo lililorekodiwa leo</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-lg"><LayoutDashboard size={20} /></div>
                  <h3 className="font-semibold text-slate-700">Jumla ya Mayai</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">1,560</p>
                <p className="text-sm text-slate-500">Wiki hii imepita</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sprout size={20} className="text-blue-600" /> Ingiza Data ya Leo
                </h2>
                
                {alertMessage && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm font-medium text-red-700">{alertMessage}</p>
                  </div>
                )}
                
                {message && (
                  <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${message.includes("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    <CheckCircle2 size={16} /> {message}
                  </div>
                )}

                <div className="space-y-4">
                  {Object.entries(template.defaultMetrics).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{value.label}</label>
                      <input 
                        type={value.type} 
                        value={dashFormData[key] || ""} 
                        onChange={(e) => handleDashInputChange(key, e.target.value)} 
                        className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                        placeholder={`0 ${value.unit}`}
                      />
                    </div>
                  ))}
                  <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 disabled:bg-slate-300 mt-2"
                  >
                    {saving ? "Inahifadhi..." : "💾 Hifadhi Data"}
                  </button>
                </div>
              </div>

              {/* Right Column: Charts */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">📈 Mwenendo wa Uzalishaji (Siku 5 Zilizopita)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="Mayai" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                      <Bar dataKey="Vifo" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}