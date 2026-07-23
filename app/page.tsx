"use client";

import { useEffect, useState } from "react";

const API_URL = "https://analytiq-backend-1.onrender.com";

export default function Home() {
  const [step, setStep] = useState<"register" | "dashboard">("register");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState("");
  
  const [regFormData, setRegFormData] = useState({ companyName: "", email: "" });
  const [registering, setRegistering] = useState(false);

  const [dashFormData, setDashFormData] = useState({
    revenue: "",
    expenses: "",
    customers: "",
    units_sold: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Calculate profit automatically
  const revenue = Number(dashFormData.revenue) || 0;
  const expenses = Number(dashFormData.expenses) || 0;
  const profit = revenue - expenses;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  useEffect(() => {
    localStorage.removeItem("analytiq_companyId");
    localStorage.removeItem("analytiq_companyName");
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const response = await fetch(`${API_URL}/api/companies-simple`, {
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
    } catch {
      alert("Hitilafu imetokea.");
    } finally {
      setRegistering(false);
    }
  };

  const handleDashInputChange = (key: string, value: string) => {
    setDashFormData((prev) => ({ ...prev, [key]: value }));
    
    // Check for alerts
    if (key === "expenses" && Number(value) > revenue) {
      setAlertMessage("🚨 ONYO: Gharama zimezidi mapato! Kagua biashara yako.");
    } else {
      setAlertMessage("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/records-simple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          companyId, 
          recordDate: new Date().toISOString().split("T")[0], 
          metricsData: dashFormData 
        }),
      });
      if (response.ok) {
        setMessage("✅ Data imehifadhiwa!");
        setDashFormData({ revenue: "", expenses: "", customers: "", units_sold: "" });
        setAlertMessage("");
      } else {
        setMessage("❌ Imeshindikana.");
      }
    } catch {
      setMessage("❌ Hitilafu.");
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

  // --- VIEW 1: REGISTER (Rahisi) ---
  if (step === "register") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white text-2xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-slate-900">ANALYTIQ</h1>
            <p className="text-slate-500 text-sm mt-1">Fuatilia biashara yako kwa urahisi</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jina la Kampuni</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Mfano: Kleev Technologies"
                value={regFormData.companyName} onChange={e => setRegFormData({...regFormData, companyName: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="ceo@kampuni.com"
                value={regFormData.email} onChange={e => setRegFormData({...regFormData, email: e.target.value})} />
            </div>

            <button type="submit" disabled={registering} 
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-slate-300">
              {registering ? "Inatengeneza..." : "🚀 Anza Sasa"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- VIEW 2: DASHBOARD (Rahisi kama Excel) ---
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">📊 ANALYTIQ</h1>
            <p className="text-xs text-slate-500">{companyName}</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 font-medium">Ondoka</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Mapato</p>
            <p className="text-2xl font-bold text-slate-900">TZS {revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Gharama</p>
            <p className="text-2xl font-bold text-slate-900">TZS {expenses.toLocaleString()}</p>
          </div>
          <div className={`p-6 rounded-2xl border ${profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Faida</p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              TZS {profit.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Margin</p>
            <p className="text-2xl font-bold text-slate-900">{margin}%</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">📝 Ingiza Data ya Leo</h2>
          
          {alertMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
              {alertMessage}
            </div>
          )}
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl font-medium ${message.includes("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">💰 Mapato (Revenue)</label>
              <input type="number" value={dashFormData.revenue} onChange={(e) => handleDashInputChange("revenue", e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">💸 Gharama (Expenses)</label>
              <input type="number" value={dashFormData.expenses} onChange={(e) => handleDashInputChange("expenses", e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">👥 Wateja (Customers)</label>
              <input type="number" value={dashFormData.customers} onChange={(e) => handleDashInputChange("customers", e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">📦 Bidhaa Zilizouzwa (Units Sold)</label>
              <input type="number" value={dashFormData.units_sold} onChange={(e) => handleDashInputChange("units_sold", e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="0" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} 
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-slate-300 mt-6">
            {saving ? "Inahifadhi..." : "💾 Hifadhi Data"}
          </button>
        </div>

        {/* Simple Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">📊 Mwenendo wa Wiki</h3>
          <div className="space-y-4">
            {['Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa'].map((day, index) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-slate-600">{day}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-end pr-3 text-white text-xs font-bold" 
                    style={{ width: `${50 + (index * 10)}%` }}>
                    {50 + (index * 10)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}