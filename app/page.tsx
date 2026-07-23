"use client";
import { useEffect, useState } from "react";

const API_URL = "https://analytiq-backend-1.onrender.com";

export default function Home() {
  const [step, setStep] = useState<"register" | "dashboard">("register");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState("");
  
  const [regFormData, setRegFormData] = useState({ companyName: "", email: "" });
  const [registering, setRegistering] = useState(false);

  const [dashFormData, setDashFormData] = useState({ revenue: "", expenses: "", customers: "", units_sold: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Auto-calculate profit
  const revenue = Number(dashFormData.revenue) || 0;
  const expenses = Number(dashFormData.expenses) || 0;
  const profit = revenue - expenses;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";

  useEffect(() => {
    localStorage.removeItem("analytiq_companyId");
    localStorage.removeItem("analytiq_companyName");
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const response = await fetch(`${API_URL}/api/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regFormData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("analytiq_companyId", data.company.id.toString());
        localStorage.setItem("analytiq_companyName", data.company.companyName);
        setCompanyId(data.company.id);
        setCompanyName(data.company.companyName);
        setStep("dashboard");
      } else {
        alert(data.error || "Imeshindikana.");
      }
    } catch {
      alert("Hakikisha backend inafanya kazi. Subiri sekunde 30 kisha jaribu tena.");
    } finally {
      setRegistering(false);
    }
  };

  const handleDashInputChange = (key: string, value: string) => {
    setDashFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "expenses" && Number(value) > revenue && revenue > 0) {
      setAlertMessage("🚨 ONYO: Gharama zimezidi mapato! Kagua biashara yako mara moja.");
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
        setDashFormData({ revenue: "", expenses: "", customers: "", units_sold: "" });
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
    setStep("register");
    setCompanyId(null);
    setCompanyName("");
  };

  if (step === "register") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-3xl mb-4 shadow-lg shadow-indigo-600/20">📊</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ANALYTIQ</h1>
            <p className="text-slate-500 mt-2">Fuatilia biashara yako kwa data, si nadharia.</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jina la Kampuni</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                placeholder="Mfano: Bugota Integrated Farms" value={regFormData.companyName} onChange={e => setRegFormData({...regFormData, companyName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email ya CEO</label>
              <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                placeholder="ceo@kampuni.com" value={regFormData.email} onChange={e => setRegFormData({...regFormData, email: e.target.value})} />
            </div>
            <button type="submit" disabled={registering} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:bg-slate-300 mt-2">
              {registering ? "Inatengeneza..." : "🚀 Anza Sasa"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-md">📊</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">ANALYTIQ</h1>
              <p className="text-xs text-slate-500 font-medium">{companyName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50">Ondoka</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">💰 Mapato</p>
            <p className="text-2xl font-bold text-slate-900">TZS {revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">💸 Gharama</p>
            <p className="text-2xl font-bold text-slate-900">TZS {expenses.toLocaleString()}</p>
          </div>
          <div className={`p-6 rounded-2xl border shadow-sm ${profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">📈 Faida Halisi</p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>TZS {profit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">📊 Profit Margin</p>
            <p className="text-2xl font-bold text-slate-900">{margin}%</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span> Ingiza Data ya Leo</h2>
          
          {alertMessage && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold flex items-center gap-3">🚨 {alertMessage}</div>}
          {message && <div className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-3 ${message.includes("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{message}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mapato (Revenue)</label>
              <input type="number" value={dashFormData.revenue} onChange={(e) => handleDashInputChange("revenue", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gharama (Expenses)</label>
              <input type="number" value={dashFormData.expenses} onChange={(e) => handleDashInputChange("expenses", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wateja Waliohudumiwa</label>
              <input type="number" value={dashFormData.customers} onChange={(e) => handleDashInputChange("customers", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bidhaa Zilizouzwa</label>
              <input type="number" value={dashFormData.units_sold} onChange={(e) => handleDashInputChange("units_sold", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="0" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:bg-slate-300 mt-8">
            {saving ? "Inahifadhi..." : "💾 Hifadhi Data"}
          </button>
        </div>
      </div>
    </main>
  );
}