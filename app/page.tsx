"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, 
  Package, Briefcase, FileText, BrainCircuit, 
  Settings, Bell, Search, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, Sliders, Upload, X, 
  FileSpreadsheet, Target, AlertTriangle, Shield, 
  Activity, BarChart3, Lightbulb, MessageSquare,
  ChevronRight, ChevronDown, Zap, Award, TrendingDown
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Mock Data
const chartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 5000, profit: 3800 },
  { name: 'Apr', revenue: 4780, profit: 3908 },
  { name: 'May', revenue: 5890, profit: 4800 },
  { name: 'Jun', revenue: 6390, profit: 5400 },
];

const forecastData = [
  { month: 'Jul', actual: 6390, forecast: 6800, lower: 6200, upper: 7400 },
  { month: 'Aug', actual: null, forecast: 7200, lower: 6500, upper: 7900 },
  { month: 'Sep', actual: null, forecast: 7800, lower: 6900, upper: 8700 },
  { month: 'Oct', actual: null, forecast: 8400, lower: 7300, upper: 9500 },
];

const riskData = [
  { category: 'Financial', score: 72, trend: 'down', probability: 'Medium', impact: 'High', mitigation: 'Diversify revenue streams' },
  { category: 'Operational', score: 85, trend: 'up', probability: 'Low', impact: 'Medium', mitigation: 'Automate manual processes' },
  { category: 'People', score: 68, trend: 'down', probability: 'Medium', impact: 'Medium', mitigation: 'Improve retention programs' },
  { category: 'Supply Chain', score: 91, trend: 'up', probability: 'Low', impact: 'High', mitigation: 'Multi-source critical materials' },
  { category: 'Customer', score: 78, trend: 'stable', probability: 'Medium', impact: 'Medium', mitigation: 'Enhance customer success team' },
  { category: 'Market', score: 65, trend: 'down', probability: 'High', impact: 'High', mitigation: 'Accelerate product innovation' },
  { category: 'Cyber', score: 88, trend: 'up', probability: 'Low', impact: 'Critical', mitigation: 'Implement zero-trust architecture' },
];

const radarData = [
  { subject: 'Sales', A: 88, fullMark: 100 },
  { subject: 'Finance', A: 92, fullMark: 100 },
  { subject: 'HR', A: 75, fullMark: 100 },
  { subject: 'Inventory', A: 85, fullMark: 100 },
  { subject: 'Projects', A: 79, fullMark: 100 },
  { subject: 'Customer', A: 83, fullMark: 100 },
];

const sidebarItems = [
  { id: "Decision Center", icon: Target, label: "Decision Center", highlight: true },
  { id: "Forecast Center", icon: TrendingUp, label: "Forecast Center" },
  { id: "Scenario Studio", icon: Sliders, label: "Scenario Studio" },
  { id: "Risk Center", icon: Shield, label: "Risk Center" },
  { id: "Business Health", icon: Activity, label: "Business Health" },
  { id: "Benchmarking", icon: BarChart3, label: "Benchmarking" },
  { id: "Recommendations", icon: Lightbulb, label: "Recommendations" },
  { id: "AI Assistant", icon: BrainCircuit, label: "AI Assistant" },
];

const kpiCards = [
  { id: "revenue", title: "Total Revenue", value: "TZS 450.5M", change: "+12.5%", trend: "up", previous: "TZS 400.2M", target: "TZS 500M", variance: "-9.9%", status: "Healthy", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "profit", title: "Net Profit Margin", value: "24.8%", change: "+2.1%", trend: "up", previous: "22.7%", target: "25%", variance: "-0.8%", status: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "customers", title: "Active Customers", value: "1,240", change: "-3.2%", trend: "down", previous: "1,281", target: "1,500", variance: "-17.3%", status: "Attention", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "health", title: "Company Health Score", value: "88/100", change: "+5 pts", trend: "up", previous: "83/100", target: "90/100", variance: "-2.2%", status: "Strong", color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function AnalytiqDashboard() {
  const [activeTab, setActiveTab] = useState("Decision Center");
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [drillDownLevel, setDrillDownLevel] = useState(0);
  const [marketingSpend, setMarketingSpend] = useState(20);
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [headcountChange, setHeadcountChange] = useState(0);
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
      setImportedData(data);
    };
    reader.readAsBinaryString(file);
  };

  const clearImport = () => {
    setImportedData([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openKPIDetail = (kpi: any) => {
    setSelectedKPI(kpi);
    setDrillDownLevel(0);
  };

  const closeKPIDetail = () => {
    setSelectedKPI(null);
    setDrillDownLevel(0);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Decision Center":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiCards.map((kpi, index) => (
                <div 
                  key={index} 
                  onClick={() => openKPIDetail(kpi)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${kpi.bg}`}><TrendingUp className={`w-5 h-5 ${kpi.color}`} /></div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.status === "Healthy" || kpi.status === "Excellent" || kpi.status === "Strong" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{kpi.status}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">{kpi.value}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`flex items-center font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}{kpi.change}
                    </span>
                    <span className="text-slate-400">vs last period</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Target: {kpi.target}</span>
                    <span className={`font-semibold ${kpi.variance.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>{kpi.variance}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-6">Revenue vs Profit Trend</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="none" />
                      <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/><stop offset="95%" stopColor="#0f172a" stopOpacity={0}/></linearGradient></defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col">
                <div className="flex items-center gap-2 mb-4"><BrainCircuit className="w-5 h-5 text-indigo-400" /><h3 className="text-base font-bold">AI Decision Insight</h3></div>
                <div className="flex-1 space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Root Cause Analysis</p>
                    <p className="text-sm text-slate-300 leading-relaxed">Profit margin increased by 2.1% despite a 3.2% drop in active customers. This indicates higher retention of high-value clients.</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">AI Recommendation</p>
                    <p className="text-sm text-slate-300 leading-relaxed">Reallocate 15% of general marketing budget to a targeted retention campaign for the top 20% of customers.</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-xs font-medium text-emerald-400">Confidence Score: 94%</span></div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Forecast Center":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Revenue Forecast</h3>
                  <p className="text-sm text-slate-500">AI-powered prediction with confidence intervals</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg">6 Months</button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200">1 Year</button>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="#e0e7ff" fillOpacity={0.5} />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />
                    <Area type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                    <Area type="monotone" dataKey="actual" stroke="#0f172a" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Prediction Accuracy</p>
                  <p className="text-2xl font-bold text-emerald-600">94.2%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Confidence Interval</p>
                  <p className="text-2xl font-bold text-indigo-600">±12%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expected Growth</p>
                  <p className="text-2xl font-bold text-slate-900">+18.5%</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "Scenario Studio":
        const projectedRevenue = 450.5 + (marketingSpend * 2.5) + (priceAdjustment * 1.8) + (headcountChange * 0.5);
        const projectedProfit = projectedRevenue * 0.248;
        const riskLevel = Math.abs(marketingSpend) + Math.abs(priceAdjustment) + Math.abs(headcountChange);
        
        return (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Sliders className="w-6 h-6" /> Scenario Studio</h2>
              <p className="text-indigo-100">Simulate business decisions and see immediate impact forecasts powered by Operations Research models.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-base font-bold text-slate-900">Marketing Budget Adjustment</label>
                    <span className="text-xl font-bold text-indigo-600">{marketingSpend > 0 ? '+' : ''}{marketingSpend}%</span>
                  </div>
                  <input type="range" min="-50" max="50" value={marketingSpend} onChange={(e) => setMarketingSpend(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-base font-bold text-slate-900">Product Price Adjustment</label>
                    <span className="text-xl font-bold text-indigo-600">{priceAdjustment > 0 ? '+' : ''}{priceAdjustment}%</span>
                  </div>
                  <input type="range" min="-30" max="30" value={priceAdjustment} onChange={(e) => setPriceAdjustment(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-base font-bold text-slate-900">Headcount Change</label>
                    <span className="text-xl font-bold text-indigo-600">{headcountChange > 0 ? '+' : ''}{headcountChange} employees</span>
                  </div>
                  <input type="range" min="-20" max="20" value={headcountChange} onChange={(e) => setHeadcountChange(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t border-slate-100">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Projected Revenue</p>
                  <p className={`text-2xl font-bold ${projectedRevenue > 450.5 ? 'text-emerald-600' : 'text-red-600'}`}>
                    TZS {projectedRevenue.toFixed(1)}M
                  </p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Projected Profit</p>
                  <p className="text-2xl font-bold text-slate-900">TZS {projectedProfit.toFixed(1)}M</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Customer Impact</p>
                  <p className="text-2xl font-bold text-indigo-600">+{Math.max(0, Math.floor(marketingSpend * 1.2))} New</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Risk Level</p>
                  <p className={`text-2xl font-bold ${riskLevel < 30 ? 'text-emerald-600' : riskLevel < 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {riskLevel < 30 ? 'Low' : riskLevel < 60 ? 'Moderate' : 'High'}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-indigo-900 mb-1">AI Recommendation</p>
                    <p className="text-sm text-indigo-700">Based on your scenario, increasing marketing budget by 20% while maintaining current pricing shows the best risk-adjusted return. Expected ROI: 3.2x within 6 months.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Risk Center":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Enterprise Risk Assessment</h3>
              <div className="space-y-4">
                {riskData.map((risk, index) => (
                  <div key={index} className="p-5 border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${risk.score > 80 ? 'bg-emerald-50' : risk.score > 60 ? 'bg-amber-50' : 'bg-red-50'}`}>
                          <Shield className={`w-5 h-5 ${risk.score > 80 ? 'text-emerald-600' : risk.score > 60 ? 'text-amber-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{risk.category} Risk</h4>
                          <p className="text-xs text-slate-500">Probability: {risk.probability} • Impact: {risk.impact}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${risk.score > 80 ? 'text-emerald-600' : risk.score > 60 ? 'text-amber-600' : 'text-red-600'}`}>{risk.score}</p>
                        <p className="text-xs text-slate-500">Risk Score</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${risk.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : risk.trend === 'down' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {risk.trend === 'up' ? '↗ Improving' : risk.trend === 'down' ? '↘ Declining' : '→ Stable'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Suggested Mitigation</p>
                      <p className="text-sm text-slate-700">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Business Health":
        const healthScore = 88;
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-8">Company Health Score</h3>
              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray={`${healthScore * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold text-slate-900">{healthScore}</p>
                  <p className="text-sm text-slate-500">out of 100</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Excellent Health
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-6">Health Breakdown by Department</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 12}} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "Benchmarking":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Department Performance Benchmarking</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    {name: 'Sales', score: 88, industry: 75},
                    {name: 'Finance', score: 92, industry: 80},
                    {name: 'HR', score: 75, industry: 70},
                    {name: 'Operations', score: 85, industry: 78},
                    {name: 'Marketing', score: 79, industry: 72},
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} name="Your Company" />
                    <Bar dataKey="industry" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Industry Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Above Industry</p>
                  <p className="text-2xl font-bold text-emerald-800">4 Departments</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Overall Ranking</p>
                  <p className="text-2xl font-bold text-indigo-800">Top 15%</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "Recommendations":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Top 5 Strategic Recommendations</h3>
              <div className="space-y-4">
                {[
                  { priority: 1, title: "Launch targeted retention campaign for top 20% customers", roi: "3.2x", cost: "TZS 45M", benefit: "TZS 144M", impact: "High" },
                  { priority: 2, title: "Increase marketing budget by 20% in Q3", roi: "2.8x", cost: "TZS 60M", benefit: "TZS 168M", impact: "High" },
                  { priority: 3, title: "Automate inventory management system", roi: "2.1x", cost: "TZS 30M", benefit: "TZS 63M", impact: "Medium" },
                  { priority: 4, title: "Hire 5 additional sales representatives", roi: "1.9x", cost: "TZS 75M", benefit: "TZS 142M", impact: "Medium" },
                  { priority: 5, title: "Discontinue underperforming Product E", roi: "1.5x", cost: "TZS 10M", benefit: "TZS 15M", impact: "Low" },
                ].map((rec, index) => (
                  <div key={index} className="p-5 border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{rec.priority}</div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">{rec.title}</h4>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${rec.impact === 'High' ? 'bg-emerald-50 text-emerald-700' : rec.impact === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                            {rec.impact} Impact
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{rec.roi}</p>
                        <p className="text-xs text-slate-500">Expected ROI</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Estimated Cost</p>
                        <p className="text-sm font-semibold text-slate-900">{rec.cost}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expected Benefit</p>
                        <p className="text-sm font-semibold text-emerald-600">{rec.benefit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "AI Assistant":
        return (
          <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center"><BrainCircuit className="w-4 h-4 text-white" /></div>
              <div><p className="font-bold text-slate-900">ANALYTIQ AI Decision Assistant</p><p className="text-xs text-slate-500">Powered by Operations Research & Machine Learning</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0"><BrainCircuit className="w-4 h-4 text-indigo-600" /></div>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 max-w-[80%]">
                  <p className="text-sm text-slate-700">Habari Zacharia. Nimechambua data ya mwezi uliopita. Je, ungependa nijibu swali lolote kama: <br/><br/>• "Kwanini faida ilipungua wiki iliyopita?"<br/>• "Ni bidhaa gani inaleta hasara zaidi?"<br/>• "Nipe utabiri wa mauzo ya mwezi ujao."<br/>• "Ni nini hatari kubwa zaidi kwa biashara yetu?"</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative">
                <input type="text" placeholder="Uliza AI Assistant yako..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"><ArrowUpRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <Settings className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-slate-600">{activeTab} Module</h3>
            <p className="text-sm">This module is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center"><BrainCircuit className="text-white w-5 h-5" /></div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ANALYTIQ</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? "bg-slate-900 text-white shadow-md" : item.highlight ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "text-slate-600 hover:bg-slate-100"}`}>
              <item.icon className="w-4 h-4" />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">ZM</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">Zacharia M.</p><p className="text-xs text-slate-500 truncate">CEO, Bugota Farms</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-semibold text-slate-800">{activeTab}</h1>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Ask AI: 'Why did profit decrease?'" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition border border-indigo-200">
              <Upload className="w-4 h-4" /> Import Data
            </button>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>

      {/* KPI Detail Modal */}
      {selectedKPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedKPI.title}</h3>
                <p className="text-sm text-slate-500">Executive Decision Panel</p>
              </div>
              <button onClick={closeKPIDetail} className="p-2 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Current Value</p>
                  <p className="text-xl font-bold text-slate-900">{selectedKPI.value}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Previous Value</p>
                  <p className="text-xl font-bold text-slate-700">{selectedKPI.previous}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Target</p>
                  <p className="text-xl font-bold text-indigo-600">{selectedKPI.target}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Variance</p>
                  <p className={`text-xl font-bold ${selectedKPI.variance.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>{selectedKPI.variance}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-4"><BrainCircuit className="w-5 h-5 text-indigo-400" /><h4 className="text-base font-bold">Root Cause Analysis</h4></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><ChevronRight className="w-4 h-4 text-indigo-400" /><span>Revenue declined 3.2% in East Africa region</span></div>
                  <div className="flex items-center gap-2 text-sm"><ChevronRight className="w-4 h-4 text-indigo-400" /><span>Dar es Salaam branch underperformed by 15%</span></div>
                  <div className="flex items-center gap-2 text-sm"><ChevronRight className="w-4 h-4 text-indigo-400" /><span>Top salesperson missed target by 22%</span></div>
                  <div className="flex items-center gap-2 text-sm"><ChevronRight className="w-4 h-4 text-indigo-400" /><span>Key customer reduced orders by 40%</span></div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-indigo-900 mb-2">AI Recommended Action</p>
                    <p className="text-sm text-indigo-700 mb-4">Launch immediate retention campaign targeting the top 20% of customers in Dar es Salaam branch. Expected to recover 60% of lost revenue within 30 days.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-lg border border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Expected Impact</p>
                        <p className="text-lg font-bold text-indigo-900">+TZS 27M</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Confidence Score</p>
                        <p className="text-lg font-bold text-indigo-900">94%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg"><FileSpreadsheet className="w-6 h-6 text-indigo-600" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Import Data Source</h3>
                  <p className="text-sm text-slate-500">Upload Excel (.xlsx) or CSV files</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6">
              {!importedData.length ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition cursor-pointer group">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-indigo-500 transition" />
                  <p className="text-base font-semibold text-slate-700 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500">Supports .xlsx, .xls, and .csv files</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-emerald-900">File Parsed Successfully!</p>
                        <p className="text-sm text-emerald-700">{fileName} • {importedData.length - 1} rows detected</p>
                      </div>
                    </div>
                    <button onClick={clearImport} className="text-sm font-medium text-emerald-700 hover:text-emerald-900 underline">Remove</button>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          {importedData[0]?.map((header: any, i: number) => (
                            <th key={i} className="px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">{header || `Column ${i+1}`}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedData.slice(1, 6).map((row: any[], rowIndex: number) => (
                          <tr key={rowIndex} className="hover:bg-slate-50">
                            {row.map((cell: any, cellIndex: number) => (
                              <td key={cellIndex} className="px-4 py-3 text-slate-600">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <button onClick={() => { setShowImportModal(false); clearImport(); }} className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Sync to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}