"use client";

import { useEffect, useState } from "react";

const API_URL = "https://analytiq-backend-1.onrender.com";

export default function Home() {
  const [step, setStep] = useState<"register" | "dashboard">("register");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState("");
  
  const [sectors, setSectors] = useState<any[]>([]);
  const [regFormData, setRegFormData] = useState({ companyName: "", sectorId: "", ceoName: "", email: "" });
  const [registering, setRegistering] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(true);

  const [template, setTemplate] = useState<any>(null);
  const [dashFormData, setDashFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    localStorage.removeItem("analytiq_companyId");
    localStorage.removeItem("analytiq_companyName");
    localStorage.removeItem("analytiq_sectorId");
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/sectors`)
      .then(res => res.json())
      .then(data => {
        setSectors(data);
        setLoadingSectors(false);
      })
      .catch(() => setLoadingSectors(false));
  }, []);

  useEffect(() => {
    if (step === "dashboard" && companyId) {
      const savedSectorId = localStorage.getItem("analytiq_sectorId") || "1";
      fetch(`${API_URL}/api/templates/${savedSectorId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setTemplate(data))
        .catch(() => {});
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
        localStorage.setItem("analytiq_sectorId", regFormData.sectorId);
        setCompanyId(data.company.id);
        setCompanyName(data.company.companyName);
        setStep("dashboard");
      } else {
        alert("Imeshindikana. Tafadhali tumia email tofauti.");
      }
    } catch {
      alert("Hitilafu imetokea.");
    } finally {
      setRegistering(false);
    }
  };

  const handleDashInputChange = (key: string, value: any) => {
    setDashFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "mortality" && Number(value) > 2) {
      setAlertMessage("🚨 ALERT: Vifo vimezidi 2 leo! Tafadhali kagua haraka.");
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
    } catch {
      setMessage("❌ Hitilafu imetokea.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("analytiq_companyId");
    localStorage.removeItem("analytiq_companyName");
    localStorage.removeItem("analytiq_sectorId");
    setStep("register");
    setCompanyId(null);
    setCompanyName("");
    setTemplate(null);
  };

  // --- VIEW 1: REGISTER (Premium) ---
  if (step === "register") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white text-2xl mb-4 shadow-lg shadow-indigo-600/20">🌾</div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ANALYTIQ</h1>
            <p className="text-slate-500 text-sm mt-1">Jenga biashara yako kwa data, si nadharia.</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Jina la Kampuni</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                placeholder="Mfano: Kleev Technologies"
                value={regFormData.companyName} onChange={e => setRegFormData({...regFormData, companyName: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sector ya Biashara</label>
              <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                value={regFormData.sectorId} onChange={e => setRegFormData({...regFormData, sectorId: e.target.value})}>
                <option value="">-- Chagua Sector --</option>
                {sectors.map(s => <option key={s.id} value={s.id}>{s.sectorName}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Jina la CEO</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                  placeholder="Jina kamili"
                  value={regFormData.ceoName} onChange={e => setRegFormData({...regFormData, ceoName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                  placeholder="ceo@kampuni.com"
                  value={regFormData.email} onChange={e => setRegFormData({...regFormData, email: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={registering} 
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:bg-slate-300 mt-2">
              {registering ? "Inatengeneza..." : "🚀 Anza Sasa"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- VIEW 2: DASHBOARD ($100M Look) ---
  return (
    <main className="min-h-screen bg-slate-50/50">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-md shadow-indigo-600/20">🌾</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">ANALYTIQ</h1>
              <p className="text-xs text-slate-500 font-medium">Dashboard ya {companyName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
            Ondoka
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {!template ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium">Inapakia data ya sector yako...</p>
          </div>
        ) : (
          <>
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">Utabiri wa Faida</span>
                  <span className="text-emerald-500 text-xs font-bold">↗ +12%</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">TZS 450,000</p>
                <p className="text-sm text-slate-500 mt-1">Muda bora wa kuuza: Baada ya siku 14</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">Hali ya Biashara</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">NZURI</p>
                <p className="text-sm text-slate-500 mt-1">Hakuna tatizo lililorekodiwa leo</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2 py-1 rounded-md">Jumla ya Data</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">1,560</p>
                <p className="text-sm text-slate-500 mt-1">Pointi za data zilizokusanywa wiki hii</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Premium Form */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-fit">
                <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
                  Ingiza Data ya Leo
                </h2>
                
                {alertMessage && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start">
                    <span className="text-lg">🚨</span>
                    <p className="text-sm font-medium text-red-700 leading-snug">{alertMessage}</p>
                  </div>
                )}
                
                {message && (
                  <div className={`mb-6 p-4 rounded-xl flex gap-3 items-center text-sm font-medium ${message.includes("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {message}
                  </div>
                )}

                <div className="space-y-5">
                  {template && template.defaultMetrics && Object.entries(template.defaultMetrics).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{value.label}</label>
                      <div className="relative">
                        <input type={value.type} value={dashFormData[key] || ""} onChange={(e) => handleDashInputChange(key, e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                          placeholder={`0 ${value.unit}`} />
                        <span className="absolute right-4 top-3.5 text-xs font-medium text-slate-400">{value.unit}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSave} disabled={saving} 
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:bg-slate-300 mt-4">
                    {saving ? "Inahifadhi..." : "💾 Hifadhi Data"}
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Chart */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
                    Mwenendo wa Uzalishaji
                  </h3>
                  <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Target</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Actual</div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {['Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa'].map((day, index) => (
                    <div key={day} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700 w-20">{day}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-100 rounded-full h-3 relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 group-hover:from-indigo-400 group-hover:to-indigo-500" style={{ width: `${60 + (index * 5)}%` }}></div>
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 group-hover:from-emerald-300 group-hover:to-emerald-400" style={{ width: `${40 + (index * 8)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}