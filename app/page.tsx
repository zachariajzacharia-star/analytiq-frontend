"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

  // Dummy data for charts (will be replaced by real DB data later)
  const chartData = [
    { name: 'Jumatatu', Mayai: 280, Vifo: 1 },
    { name: 'Jumanne', Mayai: 310, Vifo: 0 },
    { name: 'Jumatano', Mayai: 290, Vifo: 2 },
    { name: 'Alhamisi', Mayai: 330, Vifo: 1 },
    { name: 'Ijumaa', Mayai: 300, Vifo: 0 },
  ];

  useEffect(() => {
    fetch("http://localhost:4000/api/sectors").then(res => res.json()).then(setSectors);
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
      fetch("http://localhost:4000/api/templates/1").then(res => res.json()).then(setTemplate);
    }
  }, [step, companyId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const response = await fetch("http://localhost:4000/api/companies", {
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
      setAlertMessage("🚨 ALERT: Vifo vimezidi 2 leo! Kagua afya ya kuku mara moja.");
    } else {
      setAlertMessage("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost:4000/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, recordDate: new Date().toISOString().split("T")[0], metricsData: dashFormData }),
      });
      if (response.ok) {
        setMessage("✅ Data imehifadhiwa kwa mafanikio!");
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

  if (step === "register") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
          <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">🌾 ANALYTIQ</h1>
          <p className="text-gray-600 text-center mb-6">Fungua akaunti ya kampuni yako</p>
          <form onSubmit={handleRegister} className="space-y-4">
            <input required type="text" placeholder="Jina la Kampuni (Mf: Bugota Farms)" className="w-full border rounded-lg p-3" value={regFormData.companyName} onChange={e => setRegFormData({...regFormData, companyName: e.target.value})} />
            <select required className="w-full border rounded-lg p-3" value={regFormData.sectorId} onChange={e => setRegFormData({...regFormData, sectorId: e.target.value})}>
              <option value="">-- Chagua Sector --</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.sectorName}</option>)}
            </select>
            <input required type="text" placeholder="Jina la CEO" className="w-full border rounded-lg p-3" value={regFormData.ceoName} onChange={e => setRegFormData({...regFormData, ceoName: e.target.value})} />
            <input required type="email" placeholder="Email (Mf: mzee@bugota.com)" className="w-full border rounded-lg p-3" value={regFormData.email} onChange={e => setRegFormData({...regFormData, email: e.target.value})} />
            <button type="submit" disabled={registering} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
              {registering ? "Inatengeneza..." : "🚀 Fungua Akaunti"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🌾 ANALYTIQ</h1>
            <p className="text-gray-600">Karibu, <span className="font-semibold text-blue-700">{companyName}</span></p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1 rounded">Ondoka</button>
        </div>
        
        {template && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">📊 Ingiza Data ya Leo</h2>
              {alertMessage && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold animate-pulse">{alertMessage}</div>}
              {message && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message}</div>}
              
              <div className="space-y-4">
                {Object.entries(template.defaultMetrics).map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{value.label}</label>
                    <input type={value.type} value={dashFormData[key] || ""} onChange={(e) => handleDashInputChange(key, e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                ))}
                <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 mt-2">
                  {saving ? "Inahifadhi..." : "💾 Hifadhi Data"}
                </button>
              </div>
            </div>

            {/* Right Column: Analytics & Predictive */}
            <div className="lg:col-span-2 space-y-6">
              {/* Predictive Calculator Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">🧠 Predictive Profitability (Utabiri wa Faida)</h3>
                <p className="text-blue-100 text-sm mb-4">Kulingana na mwenendo wa data yako ya sasa na bei za soko:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-blue-200 uppercase">Muda Bora wa Kuuza</p>
                    <p className="text-2xl font-bold">Baada ya siku 14</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-blue-200 uppercase">Faida Inayotarajiwa</p>
                    <p className="text-2xl font-bold">TZS 450,000</p>
                  </div>
                </div>
              </div>

              {/* Charts Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">📈 Mwenendo wa Uzalishaji (Siku 5 Zilizopita)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Legend />
                      <Bar dataKey="Mayai" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Vifo" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}