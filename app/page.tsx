"use client";

import { useState } from "react";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, 
  Package, Briefcase, FileText, BrainCircuit, 
  Settings, Bell, Search, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, MessageSquare, Sliders
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const chartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 5000, profit: 3800 },
  { name: 'Apr', revenue: 4780, profit: 3908 },
  { name: 'May', revenue: 5890, profit: 4800 },
  { name: 'Jun', revenue: 6390, profit: 5400 },
];

const sidebarItems = [
  { id: "Dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "Sales", icon: TrendingUp, label: "Sales" },
  { id: "Finance", icon: DollarSign, label: "Finance" },
  { id: "Customers", icon: Users, label: "Customers" },
  { id: "HR", icon: Briefcase, label: "HR" },
  { id: "Inventory", icon: Package, label: "Inventory" },
  { id: "Reports", icon: FileText, label: "Reports" },
  { id: "Decision Lab", icon: Sliders, label: "Decision Lab", highlight: true },
  { id: "AI Assistant", icon: BrainCircuit, label: "AI Assistant" },
  { id: "Settings", icon: Settings, label: "Settings" },
];

const kpiCards = [
  { title: "Total Revenue", value: "TZS 450.5M", change: "+12.5%", trend: "up", previous: "TZS 400.2M", status: "Healthy", color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Net Profit Margin", value: "24.8%", change: "+2.1%", trend: "up", previous: "22.7%", status: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Active Customers", value: "1,240", change: "-3.2%", trend: "down", previous: "1,281", status: "Attention", color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Company Health Score", value: "88/100", change: "+5 pts", trend: "up", previous: "83/100", status: "Strong", color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function AnalytiqDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [marketingSpend, setMarketingSpend] = useState(20);

  // Dynamic Content Renderer
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiCards.map((kpi, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${kpi.bg}`}><TrendingUp className={`w-5 h-5 ${kpi.color}`} /></div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.status === "Healthy" || kpi.status === "Excellent" || kpi.status === "Strong" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{kpi.status}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{kpi.value}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`flex items-center font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}{kpi.change}
                    </span>
                    <span className="text-slate-400">vs last period</span>
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

      case "Sales":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Top Performing Products</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{name: 'Product A', sales: 4000}, {name: 'Product B', sales: 3000}, {name: 'Product C', sales: 2000}, {name: 'Product D', sales: 2780}, {name: 'Product E', sales: 1890}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="sales" fill="#0f172a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Region</th><th className="px-6 py-4">Total Spent</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="px-6 py-4 font-medium text-slate-900">Bugota Integrated Farms</td><td className="px-6 py-4">Dar es Salaam</td><td className="px-6 py-4">TZS 120M</td><td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Active</span></td></tr>
                  <tr><td className="px-6 py-4 font-medium text-slate-900">TechSolutions Ltd</td><td className="px-6 py-4">Arusha</td><td className="px-6 py-4">TZS 85M</td><td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Active</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Decision Lab":
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><Sliders className="w-6 h-6" /> Decision Lab</h2>
              <p className="text-indigo-100">Simulate business decisions and see immediate impact forecasts powered by Operations Research models.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-base font-bold text-slate-900">Marketing Budget Adjustment</label>
                  <span className="text-xl font-bold text-indigo-600">{marketingSpend > 0 ? '+' : ''}{marketingSpend}%</span>
                </div>
                <input type="range" min="-50" max="50" value={marketingSpend} onChange={(e) => setMarketingSpend(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-2"><span>-50% (Cut)</span><span>0% (Current)</span><span>+50% (Increase)</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expected Revenue Impact</p>
                  <p className={`text-2xl font-bold ${marketingSpend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {marketingSpend > 0 ? '+' : ''}TZS {(marketingSpend * 2.5).toFixed(1)}M
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Customer Acquisition</p>
                  <p className="text-2xl font-bold text-slate-900">+{Math.max(0, Math.floor(marketingSpend * 1.2))} New</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">AI Risk Assessment</p>
                  <p className={`text-2xl font-bold ${Math.abs(marketingSpend) < 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Math.abs(marketingSpend) < 20 ? 'Low' : 'Moderate'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "AI Assistant":
        return (
          <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center"><BrainCircuit className="w-4 h-4 text-white" /></div>
              <div><p className="font-bold text-slate-900">ANALYTIQ AI</p><p className="text-xs text-slate-500">Powered by Operations Research & ML</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0"><BrainCircuit className="w-4 h-4 text-indigo-600" /></div>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 max-w-[80%]">
                  <p className="text-sm text-slate-700">Habari Zacharia. Nimechambua data ya mwezi uliopita. Je, ungependa nijibu swali lolote kama: <br/><br/>• "Kwanini faida ilipungua wiki iliyopita?"<br/>• "Ni bidhaa gani inaleta hasara zaidi?"<br/>• "Nipe utabiri wa mauzo ya mwezi ujao."</p>
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
            <p className="text-sm">This module is currently under development for your specific business logic.</p>
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
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> New Report</button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}