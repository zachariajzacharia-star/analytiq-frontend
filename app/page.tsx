"use client";

import { useState } from "react";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, 
  Package, Briefcase, FileText, BrainCircuit, 
  Settings, Bell, Search, ChevronDown, ArrowUpRight, 
  ArrowDownRight, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock Data for Charts
const chartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 5000, profit: 3800 },
  { name: 'Apr', revenue: 4780, profit: 3908 },
  { name: 'May', revenue: 5890, profit: 4800 },
  { name: 'Jun', revenue: 6390, profit: 5400 },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: TrendingUp, label: "Sales", active: false },
  { icon: DollarSign, label: "Finance", active: false },
  { icon: Users, label: "Customers", active: false },
  { icon: Briefcase, label: "HR", active: false },
  { icon: Package, label: "Inventory", active: false },
  { icon: FileText, label: "Reports", active: false },
  { icon: BrainCircuit, label: "Decision Lab", active: false, highlight: true },
  { icon: BrainCircuit, label: "AI Assistant", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const kpiCards = [
  { 
    title: "Total Revenue", 
    value: "TZS 450.5M", 
    change: "+12.5%", 
    trend: "up", 
    previous: "TZS 400.2M",
    status: "Healthy",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  { 
    title: "Net Profit Margin", 
    value: "24.8%", 
    change: "+2.1%", 
    trend: "up", 
    previous: "22.7%",
    status: "Excellent",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  { 
    title: "Active Customers", 
    value: "1,240", 
    change: "-3.2%", 
    trend: "down", 
    previous: "1,281",
    status: "Attention",
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  { 
    title: "Company Health Score", 
    value: "88/100", 
    change: "+5 pts", 
    trend: "up", 
    previous: "83/100",
    status: "Strong",
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
];

export default function AnalytiqDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* LEFT SIDEBAR (Premium, Minimalist) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ANALYTIQ</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.label 
                  ? "bg-slate-900 text-white shadow-md" 
                  : item.highlight 
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">ZM</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Zacharia M.</p>
              <p className="text-xs text-slate-500 truncate">CEO, Bugota Farms</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-semibold text-slate-800">{activeTab}</h1>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Ask AI: 'Why did profit decrease last month?'" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition shadow-sm">
              + New Report
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map((kpi, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <TrendingUp className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    kpi.status === "Healthy" || kpi.status === "Excellent" || kpi.status === "Strong" 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {kpi.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{kpi.value}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`flex items-center font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {kpi.change}
                  </span>
                  <span className="text-slate-400">vs last period ({kpi.previous})</span>
                </div>
              </div>
            ))}
          </div>

          {/* MAIN CHART & AI INSIGHTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Revenue vs Profit Trend</h3>
                  <p className="text-sm text-slate-500">Last 6 months performance</p>
                </div>
                <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights Panel (The "Decision Intelligence" Core) */}
            <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">AI Decision Insight</h3>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Root Cause Analysis</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Profit margin increased by 2.1% despite a 3.2% drop in active customers. This indicates higher retention of high-value clients and successful cost-optimization in operations.
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">AI Recommendation</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Reallocate 15% of the general marketing budget to a targeted retention campaign for the top 20% of customers to reverse the active user decline.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Confidence Score: 94%</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2">
                Simulate in Decision Lab <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DECISION LAB TEASER */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  Decision Lab (Signature Feature)
                </h3>
                <p className="text-sm text-slate-500">Simulate business decisions and see immediate impact forecasts.</p>
              </div>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Open Full Lab →</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">Increase Marketing Budget</span>
                  <span className="font-bold text-slate-900">+20%</span>
                </div>
                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>-50%</span>
                  <span>+50%</span>
                </div>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Expected Revenue Impact</p>
                  <p className="text-xl font-bold text-emerald-800">+ TZS 45.2M</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Business Risk Level</p>
                  <p className="text-xl font-bold text-amber-800">Low (12%)</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}