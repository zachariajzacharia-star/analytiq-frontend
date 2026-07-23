"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import Solver from "javascript-lp-solver";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, 
  Package, Briefcase, FileText, BrainCircuit, 
  Settings, Bell, Search, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, Sliders, X, 
  FileSpreadsheet, Target, Shield, Activity, BarChart3, Lightbulb,
  ChevronRight, Calculator, GitBranch, Dice5,
  Truck, Calendar, RotateCcw, Play, Upload, UploadCloud
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function AnalytiqDashboard() {
  const [step, setStep] = useState<"register" | "dashboard">("register");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [regFormData, setRegFormData] = useState({ companyName: "", email: "" });
  const [registering, setRegistering] = useState(false);

  const [activeModule, setActiveModule] = useState("Overview");
  const [activeSubTab, setActiveSubTab] = useState("Dashboard");
  const [selectedKPI, setSelectedKPI] = useState<any>(null);

  // Real Data State
  const [kpis, setKpis] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Excel Import
  const [showImport, setShowImport] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data Entry Form
  const [dashForm, setDashForm] = useState({ revenue: "", expenses: "", customers: "", units_sold: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Optimization
  const [objectiveType, setObjectiveType] = useState("maximize");
  const [variables, setVariables] = useState([{ name: "x1", coefficient: 5 }, { name: "x2", coefficient: 4 }]);
  const [constraints, setConstraints] = useState([
    { id: 1, coefficients: [6, 4], type: "<=", rhs: 24 },
    { id: 2, coefficients: [1, 2], type: "<=", rhs: 6 },
  ]);
  const [solution, setSolution] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Fetch KPIs from backend
  const fetchKPIs = async () => {
    if (!companyId) return;
    setLoadingData(true);
    try {
      const res = await fetch(`${API_URL}/api/kpis/${companyId}`);
      const data = await res.json();
      setKpis(data);
    } catch (e) {
      console.error("Failed to fetch KPIs");
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (step === "dashboard" && companyId) {
      fetchKPIs();
    }
  }, [step, companyId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await fetch(`${API_URL}/api/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regFormData),
      });
      const data = await res.json();
      if (res.ok) {
        setCompanyId(data.company.id);
        setCompanyName(data.company.companyName);
        setStep("dashboard");
      } else {
        alert(data.error || "Imeshindikana.");
      }
    } catch { alert("Hitilafu."); }
    finally { setRegistering(false); }
  };

  const handleSaveRecord = async () => {
    if (!companyId) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, recordDate: new Date().toISOString().split("T")[0], metricsData: dashForm }),
      });
      if (res.ok) {
        setSaveMsg("✅ Data imehifadhiwa!");
        setDashForm({ revenue: "", expenses: "", customers: "", units_sold: "" });
        fetchKPIs();
      } else { setSaveMsg("❌ Imeshindikana."); }
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
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      setImportedData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (!companyId || importedData.length === 0) return;
    setUploading(true);
    setUploadMsg("");
    const records = importedData.map((row: any) => ({
      date: row.date || row.Date || new Date().toISOString().split("T")[0],
      data: {
        revenue: row.revenue || row.Revenue || row.Mapato || 0,
        expenses: row.expenses || row.Expenses || row.Gharama || 0,
        customers: row.customers || row.Customers || row.Wateja || 0,
        units_sold: row.units_sold || row.Units || row.Bidhaa || 0,
      }
    }));
    try {
      const res = await fetch(`${API_URL}/api/records/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, records }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg(`✅ ${data.count} records uploaded!`);
        setImportedData([]);
        setFileName("");
        fetchKPIs();
      } else { setUploadMsg("❌ Upload failed."); }
    } catch { setUploadMsg("❌ Hitilafu."); }
    finally { setUploading(false); }
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

  const handleModuleClick = (id: string) => {
    setActiveModule(id);
    setActiveSubTab(getSubTabs(id)[0]);
  };

  // Build KPI cards from real or mock data
  const getKPICards = () => {
    if (kpis?.hasData) {
      return [
        { title: "Total Revenue", value: `TZS ${Number(kpis.revenue).toLocaleString()}`, change: "Real Data", trend: "up", status: "Live", color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Total Expenses", value: `TZS ${Number(kpis.expenses).toLocaleString()}`, change: "Real Data", trend: "down", status: "Live", color: "text-red-600", bg: "bg-red-50" },
        { title: "Net Profit", value: `TZS ${Number(kpis.profit).toLocaleString()}`, change: `${kpis.margin}% margin`, trend: kpis.profit >= 0 ? "up" : "down", status: kpis.profit >= 0 ? "Healthy" : "Warning", color: kpis.profit >= 0 ? "text-emerald-600" : "text-red-600", bg: kpis.profit >= 0 ? "bg-emerald-50" : "bg-red-50" },
        { title: "Total Customers", value: Number(kpis.customers).toLocaleString(), change: `${kpis.totalRecords} records`, trend: "up", status: "Live", color: "text-indigo-600", bg: "bg-indigo-50" },
      ];
    }
    return [
      { title: "Total Revenue", value: "TZS 0", change: "No data yet", trend: "up", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
      { title: "Total Expenses", value: "TZS 0", change: "No data yet", trend: "down", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
      { title: "Net Profit", value: "TZS 0", change: "No data yet", trend: "up", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
      { title: "Total Customers", value: "0", change: "No data yet", trend: "up", status: "Empty", color: "text-slate-400", bg: "bg-slate-50" },
    ];
  };

  const solveLP = () => {
    const model: any = { optimize: "objective", opType: objectiveType, constraints: {}, variables: {} };
    variables.forEach((v) => { model.variables[v.name] = { objective: v.coefficient }; });
    constraints.forEach((c, i) => {
      const cn = `c${i + 1}`;
      model.constraints[cn] = {};
      if (c.type === "<=") model.constraints[cn].max = c.rhs;
      else if (c.type === ">=") model.constraints[cn].min = c.rhs;
      else model.constraints[cn].equal = c.rhs;
      variables.forEach((v, j) => { model.variables[v.name][cn] = c.coefficients[j]; });
    });
    try { const r = Solver.Solve(model); setSolution(r); setShowResults(true); } catch { alert("Error."); }
  };

  const renderContent = () => {
    // OVERVIEW
    if (activeModule === "Overview") {
      if (activeSubTab === "Dashboard") {
        const cards = getKPICards();
        return (
          <div className="space-y-6">
            {loadingData && <div className="text-center py-4 text-indigo-600 font-semibold">⏳ Inapakia data...</div>}
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
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-6">Revenue vs Profit Trend</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpis?.hasData ? kpis.records.slice(0, 7).reverse().map((r: any) => ({ name: new Date(r.recordDate).toLocaleDateString('en', { weekday: 'short' }), revenue: Number(r.metricsData?.revenue) || 0, profit: (Number(r.metricsData?.revenue) || 0) - (Number(r.metricsData?.expenses) || 0) })) : [{ name: 'No Data', revenue: 0, profit: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
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
                    <p className="text-sm text-slate-300">{kpis?.hasData ? `Based on ${kpis.totalRecords} records, your profit margin is ${kpis.margin}%. ${Number(kpis.margin) > 20 ? "This is healthy." : "Consider reducing expenses."}` : "Upload data to get AI insights."}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-xs font-semibold text-emerald-300 uppercase mb-2">Recommendation</p>
                    <p className="text-sm text-slate-300">{kpis?.hasData ? Number(kpis.profit) > 0 ? "Continue current strategy. Consider scaling operations." : "Urgent: Expenses exceed revenue. Review cost structure immediately." : "Start by uploading your Excel data."}</p>
                  </div>
                </div>
              </div>
            </div>
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
                {["revenue", "expenses", "customers", "units_sold"].map((key) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{key.replace("_", " ")}</label>
                    <input type="number" value={(dashForm as any)[key]} onChange={(e) => setDashForm({...dashForm, [key]: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="0" />
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
              <p className="text-sm text-slate-500 mb-6">Upload your business data. Columns should include: date, revenue, expenses, customers, units_sold</p>
              {uploadMsg && <div className={`mb-4 p-3 rounded-xl text-sm font-semibold ${uploadMsg.includes("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{uploadMsg}</div>}
              {!importedData.length ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer group">
                  <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-indigo-500" />
                  <p className="font-semibold text-slate-700">Click to upload Excel or CSV</p>
                  <p className="text-sm text-slate-500 mt-1">.xlsx, .xls, .csv</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-900">{fileName}</p>
                      <p className="text-sm text-emerald-700">{importedData.length} rows detected</p>
                    </div>
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
                    {uploading ? "Uploading..." : `🚀 Upload ${importedData.length} Records to Database`}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    // DECISIONS
    if (activeModule === "Decisions") {
      if (activeSubTab === "Decision Center") {
        const cards = getKPICards();
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Decision Center</h2>
              <p className="text-indigo-100">Every metric answers: What happened? Why? What should be done?</p>
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
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-indigo-600">Click for Root Cause Analysis →</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (activeSubTab === "Recommendations") {
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Top Recommendations</h3>
              <div className="space-y-4">
                {[
                  { p: 1, t: "Increase marketing budget by 20%", roi: "3.2x", cost: "TZS 45M", benefit: "TZS 144M" },
                  { p: 2, t: "Automate inventory management", roi: "2.1x", cost: "TZS 30M", benefit: "TZS 63M" },
                  { p: 3, t: "Hire 5 sales representatives", roi: "1.9x", cost: "TZS 75M", benefit: "TZS 142M" },
                ].map((r, i) => (
                  <div key={i} className="p-5 border border-slate-200 rounded-xl hover:border-indigo-200 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{r.p}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-2">{r.t}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div><p className="text-xs text-slate-500">ROI</p><p className="font-bold text-emerald-600">{r.roi}</p></div>
                          <div><p className="text-xs text-slate-500">Cost</p><p className="font-bold text-slate-900">{r.cost}</p></div>
                          <div><p className="text-xs text-slate-500">Benefit</p><p className="font-bold text-emerald-600">{r.benefit}</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return <div className="text-center py-20 text-slate-400">{activeSubTab} coming soon...</div>;
    }

    // ANALYTICS
    if (activeModule === "Analytics") {
      if (activeSubTab === "Forecast") {
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Forecast</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{m:'Jul',a:6390,f:6800},{m:'Aug',a:null,f:7200},{m:'Sep',a:null,f:7800},{m:'Oct',a:null,f:8400}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                    <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} />
                    <Area type="monotone" dataKey="f" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    <Area type="monotone" dataKey="a" stroke="#0f172a" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center"><p className="text-xs text-slate-500 uppercase">Accuracy</p><p className="text-2xl font-bold text-emerald-600">94.2%</p></div>
                <div className="text-center"><p className="text-xs text-slate-500 uppercase">Confidence</p><p className="text-2xl font-bold text-indigo-600">±12%</p></div>
                <div className="text-center"><p className="text-xs text-slate-500 uppercase">Growth</p><p className="text-2xl font-bold text-slate-900">+18.5%</p></div>
              </div>
            </div>
          </div>
        );
      }
      if (activeSubTab === "Benchmarking") {
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Industry Benchmarking</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{n:'Sales',y:88,i:75},{n:'Finance',y:92,i:80},{n:'HR',y:75,i:70},{n:'Ops',y:85,i:78}]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                  <Tooltip contentStyle={{borderRadius:'12px',border:'none'}} />
                  <Bar dataKey="y" fill="#6366f1" radius={[6,6,0,0]} name="You" />
                  <Bar dataKey="i" fill="#cbd5e1" radius={[6,6,0,0]} name="Industry" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }
      return <div className="text-center py-20 text-slate-400">{activeSubTab} coming soon...</div>;
    }

    // MODELS
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
                      <select value={c.type} onChange={(e) => { setConstraints(constraints.map(con => con.id === c.id ? {...con, type: e.target.value} : con)); }} className="px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-semibold">
                        <option value="<=">≤</option><option value=">=">≥</option><option value="=">=</option>
                      </select>
                      <input type="number" value={c.rhs} onChange={(e) => { setConstraints(constraints.map(con => con.id === c.id ? {...con, rhs: parseFloat(e.target.value)||0} : con)); }} className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono" />
                      <button onClick={() => { if(constraints.length > 1) setConstraints(constraints.filter(x => x.id !== c.id)); }} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setConstraints([...constraints, { id: constraints.length+1, coefficients: variables.map(()=>0), type: "<=", rhs: 0 }]); }} className="mt-4 text-sm font-semibold text-indigo-600">+ Add Constraint</button>
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

    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <Settings className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-semibold text-slate-600">{activeModule} - {activeSubTab}</h3>
        <p className="text-sm">Coming soon...</p>
      </div>
    );
  };

  // REGISTER SCREEN
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

      {selectedKPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">{selectedKPI.title}</h3>
              <button onClick={() => setSelectedKPI(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6"><p className="text-4xl font-bold text-slate-900 mb-2">{selectedKPI.value}</p><p className="text-sm text-slate-500">{selectedKPI.change}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}