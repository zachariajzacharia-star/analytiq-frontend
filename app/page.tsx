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

  // HARD RESET: Futa localStorage zote za zamani ili kuanza safi
  useEffect(() => {
    localStorage.removeItem("analytiq_companyId");
    localStorage.removeItem("analytiq_companyName");
    localStorage.removeItem("analytiq_sectorId");
  }, []);

  // Fetch sectors moja kwa moja kutoka backend
  useEffect(() => {
    fetch(`${API_URL}/api/sectors`)
      .then(res => res.json())
      .then(data => {
        setSectors(data);
        setLoadingSectors(false);
      })
      .catch(err => {
        console.error("Error fetching sectors:", err);
        setLoadingSectors(false);
      });
  }, []);

  // Fetch template KWA SECTOR ULIYOAUCHAGUA
  useEffect(() => {
    if (step === "dashboard" && companyId) {
      const savedSectorId = localStorage.getItem("analytiq_sectorId") || "1";
      fetch(`${API_URL}/api/templates/${savedSectorId}`)
        .then(res => {
          if (!res.ok) throw new Error("Template not found");
          return res.json();
        })
        .then(data => setTemplate(data))
        .catch(err => console.error("Error fetching template:", err));
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
        localStorage.setItem("analytiq_sectorId", regFormData.sectorId); // HIFADHI SECTOR ID
        setCompanyId(data.company.id);
        setCompanyName(data.company.companyName);
        setStep("dashboard");
      } else {
        alert("Imeshindikana. Tafadhali tumia email tofauti.");
      }
    } catch (error) {
      alert("Hitilafu imetokea. Hakikisha backend inafanya kazi.");
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
    localStorage.removeItem("analytiq_sectorId");
    setStep("register");
    setCompanyId(null);
    setCompanyName("");
    setTemplate(null);
  };

  // --- VIEW 1: REGISTER ---
  if (step === "register") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌾</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">ANALYTIQ</h1>
            <p className="text-slate-500">Fungua akaunti ya kampuni yako</p>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <strong>Sectors zilizopo:</strong> {loadingSectors ? "Inapakia..." : `${sectors.length} sectors`}
            {sectors.length > 0 && (
              <ul className="mt-2 text-xs">
                {sectors.map((s: any) => <li key={s.id}>• {s.sectorName}</li>)}
              </ul>
            )}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <input required type="text" placeholder="Jina la Kampuni" className="w-full border border-slate-200 rounded-lg p-3" 
              value={regFormData.companyName} onChange={e => setRegFormData({...regFormData, companyName: e.target.value})} />
            
            <select required className="w-full border border-slate-200 rounded-lg p-3 bg-white"
              value={regFormData.sectorId} onChange={e => setRegFormData({...regFormData, sectorId: e.target.value})}>
              <option value="">-- Chagua Sector --</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.sectorName}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Jina la CEO" className="w-full border border-slate-200 rounded-lg p-3" 
                value={regFormData.ceoName} onChange={e => setRegFormData({...regFormData, ceoName: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full border border-slate-200 rounded-lg p-3" 
                value={regFormData.email} onChange={e => setRegFormData({...regFormData, email: e.target.value})} />
            </div>

            <button type="submit" disabled={registering} 
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
              {registering ? "Inatengeneza..." : "🚀 Anza Sasa"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">🌾 ANALYTIQ</h1>
            <p className="text-xs text-slate-500">Dashboard ya {companyName}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 font-medium">Ondoka</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {!template ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-xl">⏳ Inapakia template ya sector yako...</p>
            <p className="text-sm mt-2">Ikiwa hii itachukua muda, tafadhali refresh page (Ctrl + F5)</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-blue-100 mb-2">📈 Utabiri wa Faida</h3>
                <p className="text-3xl font-bold mb-1">TZS 450,000</p>
                <p className="text-sm text-blue-200">Muda bora: Baada ya siku 14</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-2">✅ Hali ya Biashara</h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">NZURI</p>
                <p className="text-sm text-slate-500">Hakuna tatizo lililorekodiwa leo</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-2">📊 Jumla ya Data</h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">1,560</p>
                <p className="text-sm text-slate-500">Wiki hii imepita</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                <h2 className="text-lg font-bold text-slate-900 mb-4">📝 Ingiza Data ya Leo</h2>
                
                {alertMessage && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 font-medium">
                    {alertMessage}
                  </div>
                )}
                
                {message && (
                  <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {message}
                  </div>
                )}

                <div className="space-y-4">
                  {template && template.defaultMetrics && Object.entries(template.defaultMetrics).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{value.label}</label>
                      <input type={value.type} value={dashFormData[key] || ""} onChange={(e) => handleDashInputChange(key, e.target.value)} 
                        className="w-full border border-slate-200 rounded-lg p-3" placeholder={`0 ${value.unit}`} />
                    </div>
                  ))}
                  <button onClick={handleSave} disabled={saving} 
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 disabled:bg-slate-300 mt-2">
                    {saving ? "Inahifadhi..." : "💾 Hifadhi Data"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">📊 Mwenendo wa Uzalishaji</h3>
                <div className="space-y-4">
                  {['Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa'].map((day, index) => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="w-20 text-sm font-medium text-slate-600">{day}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold" style={{ width: `${60 + (index * 5)}%` }}>
                          Target
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold" style={{ width: `${40 + (index * 8)}%` }}>
                          Actual
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