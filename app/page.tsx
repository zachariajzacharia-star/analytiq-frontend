"use client";

import { useState } from "react";
import Solver from "javascript-lp-solver";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, 
  Package, Briefcase, FileText, BrainCircuit, 
  Settings, Bell, Search, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, Sliders, X, 
  Target, Shield, Activity, BarChart3, Lightbulb,
  ChevronRight, Calculator, GitBranch, Dice5,
  Truck, Calendar, RotateCcw, Play, Download
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 5000, profit: 3800 },
  { name: 'Apr', revenue: 4780, profit: 3908 },
  { name: 'May', revenue: 5890, profit: 4800 },
  { name: 'Jun', revenue: 6390, profit: 5400 },
];

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

const kpiCards = [
  { id: "revenue", title: "Total Revenue", value: "TZS 450.5M", change: "+12.5%", trend: "up", previous: "TZS 400.2M", target: "TZS 500M", variance: "-9.9%", status: "Healthy", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "profit", title: "Net Profit Margin", value: "24.8%", change: "+2.1%", trend: "up", previous: "22.7%", target: "25%", variance: "-0.8%", status: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "customers", title: "Active Customers", value: "1,240", change: "-3.2%", trend: "down", previous: "1,281", target: "1,500", variance: "-17.3%", status: "Attention", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "health", title: "Company Health Score", value: "88/100", change: "+5 pts", trend: "up", previous: "83/100", target: "90/100", variance: "-2.2%", status: "Strong", color: "text-indigo-600", bg: "bg-indigo-50" },
];

// NEW PREMIUM LOGO COMPONENT
const AnalytiqLogo = () => (
  <div className="flex items-center gap-3">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0f172a"/>
      <path d="M8 22L16 10L24 22" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="18" r="2" fill="#10b981"/>
      <path d="M12 22H20" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
    <div>
      <div className="text-xl font-bold tracking-tight text-slate-900">ANALYTIQ</div>
      <div className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">Precision in Every Data Point</div>
    </div>
  </div>
);

export default function AnalytiqDashboard() {
  const [activeModule, setActiveModule] = useState("Overview");
  const [activeSubTab, setActiveSubTab] = useState("Dashboard");
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  
  const [objectiveType, setObjectiveType] = useState("maximize");
  const [variables, setVariables] = useState([
    { name: "x1", coefficient: 5 },
    { name: "x2", coefficient: 4 },
  ]);
  const [constraints, setConstraints] = useState([
    { id: 1, coefficients: [6, 4], type: "<=", rhs: 24 },
    { id: 2, coefficients: [1, 2], type: "<=", rhs: 6 },
  ]);
  const [solution, setSolution] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
    const tabs = getSubTabs(moduleId);
    if (tabs.length > 0) {
      setActiveSubTab(tabs[0]);
    }
  };

  const handleKPIClick = (kpi: any) => {
    setSelectedKPI(kpi);
  };

  const getSubTabs = (module: string): string[] => {
    const tabs: Record<string, string[]> = {
      "Overview": ["Dashboard", "Health Score", "AI Insights"],
      "Decisions": ["Decision Center", "Recommendations", "Root Cause"],
      "Analytics": ["Forecast", "Benchmarking", "Sensitivity"],
      "Models": ["Optimization", "Simulation", "Monte Carlo", "Decision Trees"],
      "Operations": ["Routing", "Scheduling", "Resource Allocation"],
      "AI Assistant": ["Chat"],
      "Reports": ["Generate", "History"],
      "Settings": ["Company", "Users", "Permissions"],
    };
    return tabs[module] || [];
  };

  const addVariable = () => {
    const newVar = { name: `x${variables.length + 1}`, coefficient: 0 };
    setVariables([...variables, newVar]);
    setConstraints(constraints.map(c => ({ ...c, coefficients: [...c.coefficients, 0] })));
  };

  const addConstraint = () => {
    const newConstraint = {
      id: constraints.length + 1,
      coefficients: variables.map(() => 0),
      type: "<=",
      rhs: 0
    };
    setConstraints([...constraints, newConstraint]);
  };

  const removeConstraint = (id: number) => {
    if (constraints.length <= 1) return;
    setConstraints(constraints.filter(c => c.id !== id));
  };

  const solveLP = () => {
    const model: any = {
      optimize: "objective",
      opType: objectiveType,
      constraints: {},
      variables: {}
    };

    variables.forEach((v) => {
      model.variables[v.name] = { objective: v.coefficient };
    });

    constraints.forEach((c, i) => {
      const constraintName = `c${i + 1}`;
      model.constraints[constraintName] = {};
      
      if (c.type === "<=") {
        model.constraints[constraintName].max = c.rhs;
      } else if (c.type === ">=") {
        model.constraints[constraintName].min = c.rhs;
      } else {
        model.constraints[constraintName].equal = c.rhs;
      }

      variables.forEach((v, j) => {
        model.variables[v.name][constraintName] = c.coefficients[j];
      });
    });

    try {
      const result = Solver.Solve(model);
      setSolution(result);
      setShowResults(true);
    } catch (error) {
      alert("Error solving LP problem.");
    }
  };

  const resetLP = () => {
    setSolution(null);
    setShowResults(false);
  };

  const renderContent = () => {
    if (activeModule === "Overview" && activeSubTab === "Dashboard") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi, index) => (
              <div 
                key={index} 
                onClick={() => handleKPIClick(kpi)}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
              >
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
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">
                  {kpi.value}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`flex items-center font-semibold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {kpi.change}
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
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="none" />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">AI Decision Insight</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">Root Cause</p>
                  <p className="text-sm text-slate-300">Profit margin increased despite customer drop.</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Recommendation</p>
                  <p className="text-sm text-slate-300">Reallocate 15% budget to retention campaign.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeModule === "Models" && activeSubTab === "Optimization") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <Calculator className="w-7 h-7 text-emerald-400" />
                  Optimization Lab
                </h2>
                <p className="text-slate-300">Linear Programming Solver</p>
              </div>
              <div className="flex gap-3">
                <button onClick={resetLP} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button onClick={solveLP} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                  <Play className="w-4 h-4" /> Solve
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Objective Function</h3>
                <div className="flex items-center gap-4 mb-4">
                  <select 
                    value={objectiveType} 
                    onChange={(e) => setObjectiveType(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
                  >
                    <option value="maximize">Maximize</option>
                    <option value="minimize">Minimize</option>
                  </select>
                  <span className="text-sm text-slate-500">Z =</span>
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    {variables.map((v, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <input
                          type="number"
                          value={v.coefficient}
                          onChange={(e) => {
                            const newVars = [...variables];
                            newVars[i].coefficient = parseFloat(e.target.value) || 0;
                            setVariables(newVars);
                          }}
                          className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                        />
                        <span className="text-sm font-mono text-slate-700">{v.name}</span>
                        {i < variables.length - 1 && <span className="text-slate-400">+</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={addVariable} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  + Add Variable
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Constraints</h3>
                <div className="space-y-3">
                  {constraints.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 flex-1">
                        {c.coefficients.map((coeff, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <input
                              type="number"
                              value={coeff}
                              onChange={(e) => {
                                const newConstraints = constraints.map(con => 
                                  con.id === c.id 
                                    ? { ...con, coefficients: con.coefficients.map((c, idx) => idx === i ? parseFloat(e.target.value) || 0 : c) }
                                    : con
                                );
                                setConstraints(newConstraints);
                              }}
                              className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono"
                            />
                            <span className="text-xs font-mono text-slate-600">{variables[i]?.name}</span>
                            {i < c.coefficients.length - 1 && <span className="text-slate-400">+</span>}
                          </div>
                        ))}
                      </div>
                      <select
                        value={c.type}
                        onChange={(e) => {
                          const newConstraints = constraints.map(con => 
                            con.id === c.id ? { ...con, type: e.target.value } : con
                          );
                          setConstraints(newConstraints);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-semibold"
                      >
                        <option value="<=">≤</option>
                        <option value=">=">≥</option>
                        <option value="=">=</option>
                      </select>
                      <input
                        type="number"
                        value={c.rhs}
                        onChange={(e) => {
                          const newConstraints = constraints.map(con => 
                            con.id === c.id ? { ...con, rhs: parseFloat(e.target.value) || 0 } : con
                          );
                          setConstraints(newConstraints);
                        }}
                        className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono"
                      />
                      <button onClick={() => removeConstraint(c.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addConstraint} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  + Add Constraint
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {showResults && solution ? (
                <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-base font-bold text-emerald-900">Optimal Solution</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-xl border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Objective Value</p>
                      <p className="text-3xl font-bold text-emerald-900 font-mono">{solution.result?.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2">
                      {variables.map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                          <span className="text-sm font-semibold text-slate-700">{v.name}</span>
                          <span className="text-lg font-bold text-emerald-700 font-mono">{solution[v.name]?.toFixed(2) || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center">
                  <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-600 mb-2">No Solution Yet</p>
                  <p className="text-xs text-slate-500">Click Solve to find optimal solution</p>
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <AnalytiqLogo />
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleModuleClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeModule === item.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">ZM</div>
            <div className="flex-1 min