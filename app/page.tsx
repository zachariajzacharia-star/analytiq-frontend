"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import Solver from "javascript-lp-solver";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, Package, Briefcase, FileText, BrainCircuit, 
  Settings, Bell, Search, ArrowUpRight, ArrowDownRight, CheckCircle2, Sliders, X, 
  Target, Shield, Activity, BarChart3, Lightbulb, ChevronRight, Calculator, 
  Truck, Calendar, RotateCcw, Play, Upload, UploadCloud, AlertTriangle, Zap, 
  Eye, Download, Send, MapPin, Clock, Database, Sparkles
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const API_URL = "https://analytiq-backend-production.up.railway.app";

const sidebarItems = [
  { id: "Overview", icon: LayoutDashboard, label: "Overview" },
  { id: "Decisions", icon: Target, label: "Decisions" },
  { id: "Analytics", icon: TrendingUp, label: "Analytics" },
  { id: "Models", icon: Calculator, label: "Models" },
  { id: "Operations", icon: Truck, label: "Operations" },
  { id: "AI Assistant", icon: BrainCircuit, label: "AI Assistant" },
  { id: "Reports", icon: FileText, label: "Reports" },
  { id: "Settings", icon: Settings, label: "Settings" },
];

const kpiRootCauses: Record<string, any> = {
  "Total Revenue": {
    drillDown: [
      { level: "Region", finding: "Coastal region down 12% due to logistics issues", impact: "high" },
      { level: "Product", finding: "Egg sales declined 8% (market saturation)", impact: "medium" },
      { level: "Customer", finding: "Top 3 buyers reduced orders by 25%", impact: "critical" },
      { level: "Season", finding: "Low season for poultry (rainy months)", impact: "medium" },
    ],
    recommendation: "Diversify to dairy and aquaculture products. Launch B2B contracts with hotels in Dar es Salaam to stabilize revenue.",
    impact: "+TZS 45M/quarter", confidence: 89, risk: "Low"
  },
  "Total Expenses": {
    drillDown: [
      { level: "Feed Cost", finding: "Maize prices up 22% (drought effect)", impact: "critical" },
      { level: "Transport", finding: "Fuel costs +18% this quarter", impact: "high" },
      { level: "Labor", finding: "Overtime costs up 15% due to disease outbreak", impact: "medium" },
      { level: "Vet Services", finding: "Emergency treatments TZS 8M unbudgeted", impact: "high" },
    ],
    recommendation: "Sign forward contracts with maize suppliers for 6 months. Invest in solar-powered feed mill to cut costs 30%.",
    impact: "-TZS 32M/quarter", confidence: 84, risk: "Medium"
  },
  "Net Profit": {
    drillDown: [
      { level: "Margin", finding: "Gross margin dropped from 35% to 28%", impact: "high" },
      { level: "Product Mix", finding: "Piggery unit has -5% margin", impact: "critical" },
      { level: "Overhead", finding: "Admin costs 18% above budget", impact: "medium" },
    ],
    recommendation: "Restructure piggery operations or exit. Renegotiate admin contracts. Focus on high-margin aquaculture.",
    impact: "+TZS 58M/year", confidence: 91, risk: "Medium"
  },
  "Total Customers": {
    drillDown: [
      { level: "Segment", finding: "Wholesale buyers down 15%", impact: "high" },
      { level: "Region", finding: "Arusha market share lost to competitor", impact: "critical" },
      { level: "Product", finding: "Egg customers churning to alternatives", impact: "medium" },
    ],
    recommendation: "Launch loyalty program for wholesale buyers. Differentiate with 'farm-fresh' branding in Arusha.",
    impact: "+85 customers", confidence: 78, risk: "Low"
  }
};

const CSV_SAMPLE = `date,revenue,expenses,customers,units_sold,eggs_collected,feed_kg,mortality,milk_liters,fish_kg,pigs_sold
2026-01-15,2850000,1850000,65,420,1250,580,2,180,55,2
2026-01-16,2920000,1890000,72,445,1320,610,1,195,62,1
2026-01-17,3100000,2010000,78,480,1400,640,3,210,70,2
2026-01-18,2780000,1820000,61,395,1180,560,2,175,48,1
2026-01-19,3250000,2120000,85,510,1480,680,1,225,75,3`;

export default function AnalytiqDashboard() {
  const [step, setStep] = useState<"register" | "dashboard">("register");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [regFormData, setRegFormData] = useState({ companyName: "", email: "" });
  const [registering, setRegistering] = useState(false);

  const [activeModule, setActiveModule] = useState("Overview");
  const [activeSubTab, setActiveSubTab] = useState("Dashboard");
  const [selectedKPI, setSelectedKPI] = useState<any>(null);

  const [kpis, setKpis] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [importedData, setImportedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dashForm, setDashForm] = useState({ revenue: "", expenses: "", customers: "", units_sold: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [objectiveType, setObjectiveType] = useState("maximize");
  const [variables, setVariables] = useState([{ name: "x1", coefficient: 5 }, { name: "x2", coefficient: 4 }]);
  const [constraints, setConstraints] = useState([
    { id: 1, coefficients: [6, 4], type: "<=", rhs: 24 },
    { id: 2, coefficients: [1, 2], type: "<=", rhs: 6 },
  ]);
  const [solution, setSolution] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: "ai", text: "Habari Zacharia! Mimi ni ANALYTIQ AI. Nimechambua data ya Bugota Farms ya miezi 6 iliyopita. Unaweza kuniuliza maswali kama:\n\n• 'Kwanini faida ilipungua mwezi uliopita?'\n• 'Ni bidhaa gani inaleta hasara?'\n• 'Nipe utabiri wa mauzo ya mwezi ujao'\n• 'Ni wapi ninapaswa kupunguza gharama?'" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const fetchKPIs = async () => {
    if (!companyId) return;
    setLoadingData(true);
    try {
      const res = await fetch(`${API_URL}/api/kpis/${companyId}`);
      const data = await res.json();
      setKpis(data);
    } catch (e) { console.error(e); }
    setLoadingData(false);
  };

  useEffect(() => { if (step === "dashboard" && companyId) fetchKPIs(); }, [step, companyId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await fetch(`${API_URL}/api/companies`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regFormData),
      });
      const data = await res.json();
      if (res.ok) { setCompanyId(data.company.id); setCompanyName(data.company.companyName); setStep("dashboard"); }
      else alert(data.error || "Imeshindikana.");
    } catch { alert("Hitilafu."); }
    finally { setRegistering(false); }
  };

  const handleSaveRecord = async () => {
    if (!companyId) return;
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/api/records`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, recordDate: new Date().toISOString().split("T")[0], metricsData: dashForm }),
      });
      if (res.ok) { setSaveMsg("✅ Data imehifadhiwa!"); setDashForm({ revenue: "", expenses: "", customers: "", units_sold: "" }); fetchKPIs(); }
      else setSaveMsg("❌ Imeshindikana.");
    } catch { setSaveMsg("❌ Hitilafu."); }
    finally { setSaving(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setImportedData(XLSX.utils.sheet_to_json(ws) as any[]);
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (!companyId || importedData.length === 0) return;
    setUploading(true); setUploadMsg("");
    const records = importedData.map((row: any) => ({
      date: row.date || row.Date || new Date().toISOString().split("T")[0],
      data: {
        revenue: row.revenue || row.Revenue || 0,
        expenses: row.expenses || row.Expenses || 0,
        customers: row.customers || row.Customers || 0,
        units_sold: row.units_sold || row.Units || 0,
        eggs_collected: row.eggs_collected || row.Eggs || 0,
        feed_kg: row.feed_kg || row.Feed || 0,
        mortality: row.mortality || row.Mortality || 0,
        milk_liters: row.milk_liters || row.Milk || 0,
        fish_kg: row.fish_kg || row.Fish || 0,
        pigs_sold: row.pigs_sold || row.Pigs || 0,
      }
    }));
    try {
      const res = await fetch(`${API_URL}/api/records/bulk`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, records }),
      });
      const data = await res.json();
      if (res.ok) { setUploadMsg(`✅ ${data.count} records zimeongezwa!`); setImportedData([]); setFileName(""); fetchKPIs(); }
      else setUploadMsg("❌ Upload failed.");
    } catch { setUploadMsg("❌ Hitilafu."); }
    finally { setUploading(false); }
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([CSV_SAMPLE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bugota_farms_sample.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput };
    const lower = chatInput.toLowerCase();
    let aiResponse = "";
    
    if (lower.includes("faida") || lower.includes("profit")) {
      aiResponse = "Faida ilipungua 12% mwezi uliopita kwa sababu kuu 3:\n\n📉 **Gharama ya chakula cha mifugo** iliongezeka 22% (ukame wa maize)\n📉 **Disease outbreak** siku 45-50 ilisababisha vifo 8-13 kwa siku\n📉 **Fuel costs** ziliongezeka 18%\n\n💡 **Pendekezo:** Sign forward contract na maize suppliers kwa miezi 6. Hii itapunguza gharama 15-20%.";
    } else if (lower.includes("hasara") || lower.includes("loss")) {
      aiResponse = "Kulingana na data, **Piggery unit** ina hasara ya -5% margin. Sababu:\n\n• Feed cost kubwa (65% ya revenue)\n• Mortality rate ya 8% (juu ya industry average ya 3%)\n• Market price imeshuka 12%\n\n💡 **Pendekezo:** Punguza idadi ya nguruwe 30% au exit kabisa. Reallocate resources kwenye aquaculture (tilapia) ambayo ina margin ya 42%.";
    } else if (lower.includes("utabiri") || lower.includes("forecast")) {
      aiResponse = "📊 **Utabiri wa Mwezi Ujao:**\n\n• Revenue: TZS 98M (±8% confidence)\n• Expenses: TZS 65M\n• Profit: TZS 33M\n• Customers: 1,850 (±150)\n\n🎯 **Key Driver:** Seasonal increase kwa dairy products (msimu wa mvua unamalizika). Egg production itaongezeka 15%.";
    } else if (lower.includes("gharama") || lower.includes("cost")) {
      aiResponse = "🔍 **Top 3 Areas za Kupunguza Gharama:**\n\n1️⃣ **Feed (45% ya expenses)** - Wekeza solar-powered mill: ROI 14 months\n2️⃣ **Transport (18%)** - Optimize delivery routes: save TZS 8M/month\n3️⃣ **Labor overtime (12%)** - Hire 3 permanent staff badala ya casuals\n\n💰 **Total savings potential:** TZS 32M/quarter";
    } else {
      aiResponse = "Nimechambua swali lako. Kulingana na data ya Bugota Farms ya siku 180 zilizopita:\n\n• Revenue trend: ↗ +18% growth\n• Profit margin: 28% (industry avg: 32%)\n• Top risk: Feed cost volatility\n• Top opportunity: Aquaculture expansion\n\nJe, ungependa nichambue eneo maalum zaidi?";
    }
    
    setChatMessages([...chatMessages, userMsg, { role: "ai", text: aiResponse }]);
    setChatInput("");
  };

  const getSubTabs = (m: string): string[] => {
    const t: Record<string, string[]> = {
      "Overview": ["Dashboard", "Data Entry", "Import Data"],
      "Decisions": ["Decision Center", "Recommendations", "Root Cause"],
      "Analytics": ["Forecast", "Benchmarking", "Sensitivity"],
      "Models": ["Optimization", "Simulation", "Monte Carlo", "Decision Trees"],
      "Operations": ["Routing", "Scheduling", "Resource Allocation"],
      "AI Assistant": ["Chat"],
      "Reports": ["Generate", "History"],
      "Settings": ["Company", "Users"],
    };
    return t[m] || [];
  };

  const handleModuleClick = (id: string) => { setActiveModule(id); setActiveSubTab(getSubTabs(id)[0]); };

  const getKPICards = () => {
    if (kpis?.hasData) {
      return [
        { title: "Total Revenue", value: `TZS ${Number(kpis.revenue).toLocaleString()}`, change: `${kpis.totalRecords} records`, trend: "up", status: "Live", color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Total Expenses", value: `TZS ${Number(kpis.expenses).toLocaleString()}`, change: `${kpis.totalRecords} records`, trend: "down", status: "Live", color: "text-red-600", bg: "bg-red-50" },
        { title: "Net Profit", value: `TZS ${Number(kpis.profit).toLocaleString()}`, change: `${kpis.margin}% margin`, trend: kpis.profit >= 0 ? "up" : "down", status: kpis.profit >= 0 ? "Healthy" : "Warning", color: kpis.profit >= 0 ? "text-emerald-600" : "text-red-600", bg: kpis.profit >= 0 ? "bg-emerald-50" : "bg-red-50" },
        { title: "Total Customers", value: Number(kpis.customers).toLocaleString(), change: `${kpis.totalRecords} records`, trend: "up", status: "Live", color: "text-indigo-600", bg: "bg-indigo-50" },
      ];
    }
    return [
      { title: "Total Revenue", value: "TZS 0", change: "No data", trend: "up", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
      { title: "Total Expenses", value: "TZS 0", change: "No data", trend: "down", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
      { title: "Net Profit", value: "TZS 0", change: "No data", trend: "up", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
      { title: "Total Customers", value: "0", change: "No data", trend: "up", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
    ];
  };

  const solveLP = () => {
    const model: any = { optimize: "objective", opType: objectiveType, constraints: {}, variables: {} };
    variables.forEach((v) => { model.variables[v.name] = { objective: v.coefficient }; });
    constraints.forEach((c, i) => {
      const cn = `c${i + 1}`; model.constraints[cn] = {};
      if (c.type === "<=") model.constraints[cn].max = c.rhs;
      else if (c.type === ">=") model.constraints[cn].min = c.rhs;
      else model.constraints[cn].equal = c.rhs;
      variables.forEach((v, j) => { model.variables[v.name][cn] = c.coefficients[j]; });
    });
    try { setSolution(Solver.Solve(model)); setShowResults(true); } catch { alert("Error."); }
  };

  const getHistoricalData = (key: string) => {
    if (!kpis?.hasData || !kpis.records) return [];
    return kpis.records.slice(0, 14).reverse().map((r: any) => ({
      date: new Date(r.recordDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: Number(r.metricsData?.[key]) || 0
    }));
  };

  const getMetricKey = (title: string) => {
    if (title === "Total Revenue") return "revenue";
    if (title === "Total Expenses") return "expenses";
    if (title === "Net Profit") return "revenue";
    if (title === "Total Customers") return "customers";
    return "revenue";
  };

  const renderContent = () => {
    // ============ OVERVIEW ============
    if (activeModule === "Overview") {
      if (activeSubTab === "Dashboard") {
        const cards = getKPICards();
        return (
          <div className="space-y-6">
            {loadingData && <div className="text-center py-4 text-indigo-600 font-semibold">⏳ Inapakia...</div>}
            
            {!kpis?.hasData && (
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl"><Database className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Karibu kwenye ANALYTIQ!</h3>
                    <p className="text-indigo-100">Data za miezi 6 zimejazwa tayari. Anza kuongeza data ya leo kupitia Data Entry au Import Excel.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((kpi, i) => (
                <div key={i} onClick={() => setSelectedKPI(kpi)} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${kpi.bg}`}><TrendingUp className={`w-5 h-5 ${kpi.color}`} /></div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.status === "Live" || kpi.status === "Healthy" ? "bg-emerald-50 text-emerald-700" : kpi.status === "Warning" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"}`}>{kpi.status}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">{kpi.value}</h3>
                  <p className="text-xs text-slate-400">{kpi.change}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Click for deep analysis</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            {kpis?.hasData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-6">Revenue vs Profit Trend</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpis.records.slice(0, 14).reverse().map((r: any) => ({ name: new Date(r.recordDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }), revenue: Number(r.metricsData?.revenue) || 0, profit: (Number(r.metricsData?.revenue) || 0) - (Number(r.metricsData?.expenses) || 0) }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={0.1} fill="#0f172a" />
                        <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
                  <div className="flex items-center gap-2 mb-4"><BrainCircuit className="w-5 h-5 text-indigo-400" /><h3 className="text-base font-bold">AI Insight</h3></div>
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <p className="text-xs font-semibold text-indigo-300 uppercase mb-2">Analysis</p>
                      <p className="text-sm text-slate-300">Based on {kpis.totalRecords} days, profit margin ni {kpis.margin}%. {Number(kpis.margin) > 25 ? "Excellent performance." : Number(kpis.margin) > 15 ? "Healthy, but room for improvement." : "Needs immediate attention."}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <p className="text-xs font-semibold text-emerald-300 uppercase mb-2">Recommendation</p>
                      <p className="text-sm text-slate-300">{Number(kpis.profit) > 0 ? "Scale aquaculture operations - highest margin unit." : "Urgent: Review cost structure."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      if (activeSubTab === "Data Entry") {
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">📝 Ingiza Data ya Leo</h2>
              {saveMsg && <div className={`mb-4 p-3 rounded-xl text-sm font-semibold ${saveMsg.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{saveMsg}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "revenue", label: "💰 Mapato (Revenue)", ph: "2500000" },
                  { key: "expenses", label: "💸 Gharama (Expenses)", ph: "1800000" },
                  { key: "customers", label: "👥 Wateja", ph: "65" },
                  { key: "units_sold", label: "📦 Bidhaa Zilizouzwa", ph: "420" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{f.label}</label>
                    <input type="number" value={(dashForm as any)[f.key]} onChange={(e) => setDashForm({...dashForm, [f.key]: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder={f.ph} />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveRecord} disabled={saving} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold mt-6 hover:bg-indigo-700 disabled:bg-slate-300">
                {saving ? "Inahifadhi..." : "💾 Hifadhi Data"}
              </button>
            </div>
          </div>
        );
      }

      if (activeSubTab === "Import Data") {
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">📥 Import Excel / CSV</h2>
              <p className="text-sm text-slate-500 mb-6">Columns: date, revenue, expenses, customers, units_sold, eggs_collected, feed_kg, mortality, milk_liters, fish_kg, pigs_sold</p>
              {uploadMsg && <div className={`mb-4 p-3 rounded-xl text-sm font-semibold ${uploadMsg.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{uploadMsg}</div>}
              {!importedData.length ? (
                <>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer group mb-4">
                    <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-indigo-500" />
                    <p className="font-semibold text-slate-700">Click to upload Excel or CSV</p>
                    <p className="text-sm text-slate-500 mt-1">.xlsx, .xls, .csv</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                  </div>
                  <button onClick={downloadSampleCSV} className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download Sample CSV (Bugota Farms format)
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div><p className="font-semibold text-emerald-900">{fileName}</p><p className="text-sm text-emerald-700">{importedData.length} rows detected</p></div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>{Object.keys(importedData[0]).map((k) => <th key={k} className="px-4 py-2 text-left font-semibold text-slate-700">{k}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedData.slice(0, 5).map((row, i) => (
                          <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="px-4 py-2 text-slate-600">{String(v)}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={handleBulkUpload} disabled={uploading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300">
                    {uploading ? "Uploading..." : `🚀 Upload ${importedData.length} Records`}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    // ============ DECISIONS ============
    if (activeModule === "Decisions") {
      if (activeSubTab === "Decision Center") {
        const cards = getKPICards();
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Decision Center</h2>
              <p className="text-indigo-100">Bonyeza KPI kupata Root Cause Analysis na AI Recommendation</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((kpi, i) => (
                <div key={i} onClick={() => setSelectedKPI(kpi)} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-sm font-bold text-slate-700">{kpi.title}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.status === "Live" || kpi.status === "Healthy" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{kpi.status}</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{kpi.value}</p>
                  <p className="text-xs text-slate-500">{kpi.change}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-semibold text-indigo-600">Click for Root Cause Analysis</p>
                    <ChevronRight className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (activeSubTab === "Recommendations") {
        const recs = [
          { p: 1, t: "Expand aquaculture operations (tilapia)", roi: "4.2x", cost: "TZS 45M", benefit: "TZS 189M", impact: "High", time: "6 months" },
          { p: 2, t: "Sign forward contracts for maize feed", roi: "2.8x", cost: "TZS 10M", benefit: "TZS 28M", impact: "High", time: "3 months" },
          { p: 3, t: "Install solar-powered feed mill", roi: "2.1x", cost: "TZS 85M", benefit: "TZS 178M", impact: "High", time: "14 months" },
          { p: 4, t: "Launch B2B hotel supply contracts", roi: "1.9x", cost: "TZS 15M", benefit: "TZS 28M", impact: "Medium", time: "4 months" },
          { p: 5, t: "Restructure piggery unit (exit or reduce)", roi: "1.5x", cost: "TZS 5M", benefit: "TZS 8M", impact: "Medium", time: "2 months" },
        ];
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Top 5 Strategic Recommendations</h2>
              <p className="text-emerald-100">AI-generated based on your 6-month data analysis</p>
            </div>
            <div className="space-y-4">
              {recs.map((r, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">{r.p}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-slate-900 text-lg">{r.t}</h4>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${r.impact === 'High' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{r.impact} Impact</span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                        <div><p className="text-xs text-slate-500 uppercase">ROI</p><p className="font-bold text-emerald-600 text-lg">{r.roi}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase">Cost</p><p className="font-bold text-slate-900">{r.cost}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase">Benefit</p><p className="font-bold text-emerald-600">{r.benefit}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase">Timeline</p><p className="font-bold text-slate-900">{r.time}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (activeSubTab === "Root Cause") {
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Root Cause Explorer</h2>
              <p className="text-slate-300">Drill-down kutoka macro hadi micro - kila KPI</p>
            </div>
            <div className="space-y-4">
              {Object.entries(kpiRootCauses).map(([title, data]: [string, any], i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> {title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    {data.drillDown.map((item: any, j: number) => (
                      <div key={j} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${item.impact === 'critical' ? 'bg-red-500' : item.impact === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                        <span className="text-xs font-bold text-slate-500 uppercase w-24">{item.level}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700 flex-1">{item.finding}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.impact === 'critical' ? 'bg-red-100 text-red-700' : item.impact === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{item.impact}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <p className="text-xs font-bold text-indigo-700 uppercase mb-1">💡 Recommendation</p>
                    <p className="text-sm text-indigo-900">{data.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }

    // ============ ANALYTICS ============
    if (activeModule === "Analytics") {
      if (activeSubTab === "Forecast") {
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Forecast - Next 6 Months</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{m:'Jul',a:98,f:105,l:92,u:118},{m:'Aug',a:null,f:112,l:96,u:128},{m:'Sep',a:null,f:121,l:101,u:141},{m:'Oct',a:null,f:128,l:105,u:151},{m:'Nov',a:null,f:135,l:108,u:162},{m:'Dec',a:null,f:148,l:115,u:181}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} />
                    <Area type="monotone" dataKey="u" stroke="none" fill="#e0e7ff" fillOpacity={0.5} />
                    <Area type="monotone" dataKey="l" stroke="none" fill="#ffffff" fillOpacity={1} />
                    <Area type="monotone" dataKey="f" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    <Area type="monotone" dataKey="a" stroke="#0f172a" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center p-4 bg-emerald-50 rounded-xl"><p className="text-xs text-emerald-700 uppercase">Accuracy</p><p className="text-2xl font-bold text-emerald-800">94.2%</p></div>
                <div className="text-center p-4 bg-indigo-50 rounded-xl"><p className="text-xs text-indigo-700 uppercase">Confidence</p><p className="text-2xl font-bold text-indigo-800">±12%</p></div>
                <div className="text-center p-4 bg-blue-50 rounded-xl"><p className="text-xs text-blue-700 uppercase">Growth</p><p className="text-2xl font-bold text-blue-800">+51%</p></div>
              </div>
            </div>
          </div>
        );
      }
      if (activeSubTab === "Benchmarking") {
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Industry Benchmarking - Integrated Farms</h3>
              <div className="h-80 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{n:'Revenue Growth',y:18,i:12},{n:'Profit Margin',y:28,i:32},{n:'Feed Efficiency',y:85,i:88},{n:'Mortality Rate',y:3,i:4},{n:'Customer Retention',y:78,i:72}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:11}} />
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} />
                    <Bar dataKey="y" fill="#6366f1" radius={[6,6,0,0]} name="Bugota Farms" />
                    <Bar dataKey="i" fill="#cbd5e1" radius={[6,6,0,0]} name="Industry Avg" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-700 uppercase">Above Industry</p>
                  <p className="text-2xl font-bold text-emerald-800">3 Metrics</p>
                  <p className="text-xs text-emerald-600 mt-1">Revenue Growth, Mortality, Retention</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 uppercase">Below Industry</p>
                  <p className="text-2xl font-bold text-amber-800">2 Metrics</p>
                  <p className="text-xs text-amber-600 mt-1">Profit Margin, Feed Efficiency</p>
                </div>
              </div>
            </div>
          </div>
        );
      }
      if (activeSubTab === "Sensitivity") {
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sensitivity Analysis</h3>
              <p className="text-sm text-slate-500 mb-6">How changes in variables affect profit</p>
              <div className="space-y-3">
                {[
                  { v: "Feed Cost", c: -10, impact: "+TZS 18M profit", color: "emerald" },
                  { v: "Feed Cost", c: +10, impact: "-TZS 18M profit", color: "red" },
                  { v: "Egg Price", c: +5, impact: "+TZS 12M profit", color: "emerald" },
                  { v: "Egg Price", c: -5, impact: "-TZS 12M profit", color: "red" },
                  { v: "Mortality Rate", c: +1, impact: "-TZS 8M profit", color: "red" },
                  { v: "Customer Base", c: +10, impact: "+TZS 22M profit", color: "emerald" },
                  { v: "Fuel Cost", c: +15, impact: "-TZS 6M profit", color: "red" },
                  { v: "Milk Production", c: +20, impact: "+TZS 15M profit", color: "emerald" },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 bg-${s.color}-50 border border-${s.color}-200 rounded-xl`}>
                    <div>
                      <p className="font-bold text-slate-900">{s.v}</p>
                      <p className="text-sm text-slate-600">Change: {s.c > 0 ? '+' : ''}{s.c}%</p>
                    </div>
                    <p className={`text-lg font-bold text-${s.color}-700`}>{s.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
    }

    // ============ MODELS ============
    if (activeModule === "Models" && activeSubTab === "Optimization") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Calculator className="w-7 h-7 text-emerald-400" />Optimization Lab</h2><p className="text-slate-300">Linear Programming Solver</p></div>
              <div className="flex gap-3">
                <button onClick={() => { setSolution(null); setShowResults(false); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reset</button>
                <button onClick={solveLP} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg flex items-center gap-2"><Play className="w-4 h-4" /> Solve</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Objective Function</h3>
                <div className="flex items-center gap-4 mb-4">
                  <select value={objectiveType} onChange={(e) => setObjectiveType(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold">
                    <option value="maximize">Maximize</option><option value="minimize">Minimize</option>
                  </select>
                  <span className="text-sm text-slate-500">Z =</span>
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    {variables.map((v, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <input type="number" value={v.coefficient} onChange={(e) => { const nv = [...variables]; nv[i].coefficient = parseFloat(e.target.value) || 0; setVariables(nv); }} className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" />
                        <span className="text-sm font-mono text-slate-700">{v.name}</span>
                        {i < variables.length - 1 && <span className="text-slate-400">+</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setVariables([...variables, { name: `x${variables.length+1}`, coefficient: 0 }]); setConstraints(constraints.map(c => ({...c, coefficients: [...c.coefficients, 0]}))); }} className="text-sm font-semibold text-indigo-600">+ Add Variable</button>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Constraints</h3>
                <div className="space-y-3">
                  {constraints.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 flex-1">
                        {c.coefficients.map((coeff, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <input type="number" value={coeff} onChange={(e) => { const nc = constraints.map(con => con.id === c.id ? {...con, coefficients: con.coefficients.map((c,idx) => idx === i ? parseFloat(e.target.value)||0 : c)} : con); setConstraints(nc); }} className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono" />
                            <span className="text-xs font-mono text-slate-600">{variables[i]?.name}</span>
                            {i < c.coefficients.length - 1 && <span className="text-slate-400">+</span>}
                          </div>
                        ))}
                      </div>
                      <select value={c.type} onChange={(e) => setConstraints(constraints.map(con => con.id === c.id ? {...con, type: e.target.value} : con))} className="px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-semibold">
                        <option value="<=">≤</option><option value=">=">≥</option><option value="=">=</option>
                      </select>
                      <input type="number" value={c.rhs} onChange={(e) => setConstraints(constraints.map(con => con.id === c.id ? {...con, rhs: parseFloat(e.target.value)||0} : con))} className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono" />
                      <button onClick={() => constraints.length > 1 && setConstraints(constraints.filter(x => x.id !== c.id))} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setConstraints([...constraints, { id: constraints.length+1, coefficients: variables.map(()=>0), type: "<=", rhs: 0 }])} className="mt-4 text-sm font-semibold text-indigo-600">+ Add Constraint</button>
              </div>
            </div>
            <div>
              {showResults && solution ? (
                <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200">
                  <div className="flex items-center gap-2 mb-4"><CheckCircle2 className="w-6 h-6 text-emerald-600" /><h3 className="font-bold text-emerald-900">Optimal Solution</h3></div>
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 mb-3"><p className="text-xs text-emerald-700 uppercase">Objective</p><p className="text-3xl font-bold text-emerald-900 font-mono">{solution.result?.toFixed(2)}</p></div>
                  {variables.map((v,i) => <div key={i} className="flex justify-between p-3 bg-white rounded-lg border border-emerald-200 mb-2"><span className="text-sm font-semibold">{v.name}</span><span className="font-bold text-emerald-700 font-mono">{solution[v.name]?.toFixed(2)||0}</span></div>)}
                </div>
              ) : (
                <div className="bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center">
                  <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-sm font-semibold text-slate-600">Click Solve</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ============ OPERATIONS ============
    if (activeModule === "Operations") {
      if (activeSubTab === "Routing") {
        const routes = [
          { id: "R001", dest: "Dar es Salaam - 5 hotels", dist: "450km", time: "7h 30m", cost: "TZS 380K", status: "Optimized" },
          { id: "R002", dest: "Arusha - 3 supermarkets", dist: "620km", time: "9h 15m", cost: "TZS 520K", status: "Optimized" },
          { id: "R003", dest: "Mwanza - 2 wholesalers", dist: "850km", time: "12h", cost: "TZS 710K", status: "Pending" },
          { id: "R004", dest: "Dodoma - 4 restaurants", dist: "480km", time: "8h", cost: "TZS 405K", status: "Optimized" },
        ];
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><MapPin className="w-7 h-7" />Route Optimization</h2>
              <p className="text-blue-100">AI-optimized delivery routes saving TZS 8M/month</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Distance</p>
                <p className="text-2xl font-bold text-slate-900">2,400 km</p>
                <p className="text-xs text-emerald-600 mt-1">↘ -18% vs last month</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fuel Cost</p>
                <p className="text-2xl font-bold text-slate-900">TZS 2.01M</p>
                <p className="text-xs text-emerald-600 mt-1">↘ -22% saved</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">On-Time Delivery</p>
                <p className="text-2xl font-bold text-slate-900">94%</p>
                <p className="text-xs text-emerald-600 mt-1">↗ +6% improvement</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Route ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Destination</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Distance</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Cost</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{r.id}</td>
                      <td className="px-6 py-4 text-slate-700">{r.dest}</td>
                      <td className="px-6 py-4 text-slate-700">{r.dist}</td>
                      <td className="px-6 py-4 text-slate-700">{r.time}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{r.cost}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'Optimized' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      if (activeSubTab === "Scheduling") {
        const tasks = [
          { task: "Feed Mixing", dept: "Production", start: "06:00", end: "08:00", assignee: "John M.", status: "On Track" },
          { task: "Egg Collection", dept: "Poultry", start: "07:00", end: "09:00", assignee: "Mary K.", status: "On Track" },
          { task: "Fish Feeding", dept: "Aquaculture", start: "08:00", end: "09:30", assignee: "Peter J.", status: "On Track" },
          { task: "Milk Processing", dept: "Dairy", start: "10:00", end: "13:00", assignee: "Anna S.", status: "Delayed" },
          { task: "Delivery - Dar", dept: "Logistics", start: "14:00", end: "21:30", assignee: "Driver Team", status: "On Track" },
          { task: "Vet Check-up", dept: "Health", start: "15:00", end: "17:00", assignee: "Dr. Mushi", status: "Scheduled" },
        ];
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Calendar className="w-7 h-7" />Daily Schedule</h2>
              <p className="text-purple-100">Optimized task allocation across all farm units</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Task</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Assignee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{t.task}</td>
                      <td className="px-6 py-4 text-slate-700">{t.dept}</td>
                      <td className="px-6 py-4 text-slate-700 font-mono text-sm">{t.start} - {t.end}</td>
                      <td className="px-6 py-4 text-slate-700">{t.assignee}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : t.status === 'Delayed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      if (activeSubTab === "Resource Allocation") {
        const resources = [
          { name: "Poultry Unit", value: 35, color: "#6366f1" },
          { name: "Aquaculture", value: 25, color: "#10b981" },
          { name: "Dairy", value: 20, color: "#f59e0b" },
          { name: "Piggery", value: 12, color: "#ef4444" },
          { name: "Crops", value: 8, color: "#8b5cf6" },
        ];
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Resource Allocation</h2>
              <p className="text-emerald-100">Optimal distribution across farm units</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-6">Budget Distribution</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={resources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e) => `${e.name}: ${e.value}%`}>
                        {resources.map((r, i) => <Cell key={i} fill={r.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-6">AI Recommendations</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-sm font-bold text-emerald-900 mb-1">↗ Increase Aquaculture to 30%</p>
                    <p className="text-xs text-emerald-700">Highest ROI unit (42% margin)</p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-bold text-amber-900 mb-1">↘ Reduce Piggery to 8%</p>
                    <p className="text-xs text-amber-700">Negative margin (-5%)</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-bold text-blue-900 mb-1">→ Maintain Poultry at 35%</p>
                    <p className="text-xs text-blue-700">Stable performer, core business</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // ============ AI ASSISTANT ============
    if (activeModule === "AI Assistant") {
      return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><BrainCircuit className="w-5 h-5" /></div>
            <div><p className="font-bold">ANALYTIQ AI Decision Assistant</p><p className="text-xs text-indigo-100">Powered by Operations Research & ML • Bugota Farms Data</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'ai' && <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0"><BrainCircuit className="w-4 h-4 text-indigo-600" /></div>}
                <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'}`}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-600">ZM</div>}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2 mb-3">
              {["Kwanini faida ilipungua?", "Bidhaa gani ina hasara?", "Utabiri wa mwezi ujao", "Wapi nipunguze gharama?"].map((q, i) => (
                <button key={i} onClick={() => { setChatInput(q); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 transition">{q}</button>
              ))}
            </div>
            <div className="relative flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} placeholder="Uliza AI Assistant yako..." className="flex-1 pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              <button onClick={handleSendChat} className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      );
    }

    // ============ REPORTS ============
    if (activeModule === "Reports") {
      if (activeSubTab === "Generate") {
        return (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Generate Report</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Report Type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                    <option>Executive Summary</option>
                    <option>Financial Performance</option>
                    <option>Operational Analysis</option>
                    <option>Risk Assessment</option>
                    <option>Board Report</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Period</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                      <option>Last 30 Days</option>
                      <option>Last Quarter</option>
                      <option>Last 6 Months</option>
                      <option>Year to Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Format</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>PowerPoint</option>
                    </select>
                  </div>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Generate Report
                </button>
              </div>
            </div>
          </div>
        );
      }
      if (activeSubTab === "History") {
        const reports = [
          { name: "Executive Summary - July 2026", date: "Jul 24, 2026", type: "PDF", size: "2.4 MB" },
          { name: "Financial Performance Q2", date: "Jul 15, 2026", type: "Excel", size: "1.8 MB" },
          { name: "Board Report - June 2026", date: "Jul 01, 2026", type: "PowerPoint", size: "5.2 MB" },
          { name: "Risk Assessment Q2", date: "Jun 28, 2026", type: "PDF", size: "3.1 MB" },
        ];
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Report Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Generated</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Format</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Size</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{r.date}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-700">{r.type}</span></td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{r.size}</td>
                      <td className="px-6 py-4"><button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"><Download className="w-4 h-4" /> Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
    }

    // ============ SETTINGS ============
    if (activeModule === "Settings") {
      if (activeSubTab === "Company") {
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Company Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Name</label>
                  <input type="text" defaultValue={companyName} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Industry</label>
                  <input type="text" defaultValue="Integrated Farming" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location</label>
                  <input type="text" defaultValue="Bugota, Mwanza, Tanzania" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700">Save Changes</button>
              </div>
            </div>
          </div>
        );
      }
      if (activeSubTab === "Users") {
        const users = [
          { name: "Zacharia M.", email: "ceo@bugota.com", role: "CEO", status: "Active" },
          { name: "Mary K.", email: "manager@bugota.com", role: "Manager", status: "Active" },
          { name: "John P.", email: "finance@bugota.com", role: "Finance", status: "Active" },
        ];
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">+ Invite User</button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">{u.role}</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Settings className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-semibold text-slate-600">{activeModule} - {activeSubTab}</h3>
        <p className="text-sm">Coming soon...</p>
      </div>
    );
  };

  // REGISTER
  if (step === "register") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 transform rotate-45 rounded-xl shadow-lg"></div>
              <span className="relative text-white text-2xl font-bold">A</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">ANALYTIQ</h1>
            <p className="text-sm text-slate-500 mt-1">Decisions, Not Dashboards</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jina la Kampuni</label>
              <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Bugota Integrated Farms" value={regFormData.companyName} onChange={e => setRegFormData({...regFormData, companyName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
              <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="ceo@kampuni.com" value={regFormData.email} onChange={e => setRegFormData({...regFormData, email: e.target.value})} />
            </div>
            <button type="submit" disabled={registering} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300">
              {registering ? "Inatengeneza..." : "🚀 Anza Sasa"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // DASHBOARD
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 transform rotate-45 rounded-lg shadow-lg shadow-indigo-600/20"></div>
            <span className="relative text-white text-lg font-bold">A</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ANALYTIQ</span>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">DECISIONS, NOT DASHBOARDS</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => handleModuleClick(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeModule === item.id ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}>
              <item.icon className="w-4 h-4" />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">ZM</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">Zacharia M.</p><p className="text-xs text-slate-500 truncate">{companyName}</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-semibold text-slate-800">{activeModule}</h1>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex gap-2">
              {getSubTabs(activeModule).map((tab) => (
                <button key={tab} onClick={() => setActiveSubTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeSubTab === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{tab}</button>
              ))}
            </div>
          </div>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
        </header>
        <div className="flex-1 overflow-y-auto p-8">{renderContent()}</div>
      </main>

      {/* KPI DEEP INSIGHT MODAL */}
      {selectedKPI && (() => {
        const rootCause = kpiRootCauses[selectedKPI.title] || {
          drillDown: [{ level: "Data", finding: "Insufficient data", impact: "medium" }],
          recommendation: "Upload more data for deeper analysis.", impact: "N/A", confidence: 0, risk: "Unknown"
        };
        const historicalData = getHistoricalData(getMetricKey(selectedKPI.title));
        const hasHistory = historicalData.length > 1;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedKPI(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${selectedKPI.bg}`}><TrendingUp className={`w-6 h-6 ${selectedKPI.color}`} /></div>
                  <div><h3 className="text-xl font-bold text-slate-900">{selectedKPI.title}</h3><p className="text-sm text-slate-500 mt-1">Executive Decision Panel</p></div>
                </div>
                <button onClick={() => setSelectedKPI(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Current Value</p>
                    <p className="text-3xl font-bold text-slate-900">{selectedKPI.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedKPI.change}</p>
                  </div>
                  <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Historical Trend (Last 14 Days)</p>
                    {hasHistory ? (
                      <div className="h-20"><ResponsiveContainer width="100%" height="100%"><LineChart data={historicalData}><Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} /><Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} /></LineChart></ResponsiveContainer></div>
                    ) : <div className="h-20 flex items-center justify-center text-sm text-slate-400"><p>Upload more data to see trend</p></div>}
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl text-white">
                  <div className="flex items-center gap-2 mb-5"><AlertTriangle className="w-5 h-5 text-amber-400" /><h4 className="text-base font-bold">Root Cause Analysis</h4></div>
                  <div className="space-y-2">
                    {rootCause.drillDown.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className={`w-2 h-2 rounded-full ${item.impact === 'critical' ? 'bg-red-400' : item.impact === 'high' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">{item.level}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-200 flex-1">{item.finding}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.impact === 'critical' ? 'bg-red-500/20 text-red-300' : item.impact === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>{item.impact.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 rounded-2xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-indigo-600 rounded-lg flex-shrink-0"><Lightbulb className="w-5 h-5 text-white" /></div>
                    <div className="flex-1"><p className="font-bold text-indigo-900 mb-1">AI Recommended Action</p><p className="text-sm text-indigo-700 leading-relaxed">{rootCause.recommendation}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-indigo-200">
                    <div className="p-3 bg-white rounded-lg border border-indigo-200"><p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Expected Impact</p><p className="text-lg font-bold text-indigo-900">{rootCause.impact}</p></div>
                    <div className="p-3 bg-white rounded-lg border border-indigo-200"><p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Confidence</p><p className="text-lg font-bold text-indigo-900">{rootCause.confidence}%</p></div>
                    <div className="p-3 bg-white rounded-lg border border-indigo-200"><p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Risk Level</p><p className={`text-lg font-bold ${rootCause.risk === 'Low' ? 'text-emerald-700' : rootCause.risk === 'Medium' ? 'text-amber-700' : 'text-red-700'}`}>{rootCause.risk}</p></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800"><Zap className="w-4 h-4" /> Simulate in Decision Lab</button>
                  <button className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"><Eye className="w-4 h-4" /> View Full Report</button>
                  <button className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50"><Download className="w-4 h-4" /> Export PDF</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}