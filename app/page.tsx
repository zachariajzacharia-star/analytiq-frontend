"use client";

import { useState } from "react";
import Solver from "javascript-lp-solver";
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, 
  Package, Briefcase, FileText, BrainCircuit, 
  Settings, Bell, Search, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, Sliders, Upload, X, 
  FileSpreadsheet, Target, AlertTriangle, Shield, 
  Activity, BarChart3, Lightbulb, MessageSquare,
  ChevronRight, Zap, Award, Calculator, GitBranch, Dice5,
  Truck, Calendar, RotateCcw, Play
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const chartData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 5000, profit: 3800 },
  { name: 'Apr', revenue: 4780, profit: 3908 },
  { name: 'May', revenue: 5890, profit: 4800 },
  { name: 'Jun', revenue: 6390, profit: 5400 },
];

const sidebarItems = [
  { id: "Dashboard", icon: LayoutDashboard, label: "Dashboard", section: "Operations" },
  { id: "Sales", icon: TrendingUp, label: "Sales", section: "Operations" },
  { id: "Finance", icon: DollarSign, label: "Finance", section: "Operations" },
  { id: "Customers", icon: Users, label: "Customers", section: "Operations" },
  { id: "HR", icon: Briefcase, label: "HR", section: "Operations" },
  { id: "Inventory", icon: Package, label: "Inventory", section: "Operations" },
  { id: "Reports", icon: FileText, label: "Reports", section: "Operations" },
  { id: "Decision Center", icon: Target, label: "Decision Center", section: "Decision Intelligence", highlight: true },
  { id: "Forecast Center", icon: TrendingUp, label: "Forecast Center", section: "Decision Intelligence" },
  { id: "Scenario Studio", icon: Sliders, label: "Scenario Studio", section: "Decision Intelligence" },
  { id: "Risk Center", icon: Shield, label: "Risk Center", section: "Decision Intelligence" },
  { id: "Business Health", icon: Activity, label: "Business Health", section: "Decision Intelligence" },
  { id: "Benchmarking", icon: BarChart3, label: "Benchmarking", section: "Decision Intelligence" },
  { id: "Recommendations", icon: Lightbulb, label: "Recommendations", section: "Decision Intelligence" },
  { id: "AI Assistant", icon: BrainCircuit, label: "AI Assistant", section: "Decision Intelligence" },
  { id: "Optimization Lab", icon: Calculator, label: "Optimization Lab", section: "Operations Research", highlight: true },
  { id: "Simulation Lab", icon: Dice5, label: "Simulation Lab", section: "Operations Research" },
  { id: "Decision Trees", icon: GitBranch, label: "Decision Trees", section: "Operations Research" },
  { id: "Monte Carlo", icon: Activity, label: "Monte Carlo", section: "Operations Research" },
  { id: "Resource Allocation", icon: Users, label: "Resource Allocation", section: "Operations Research" },
  { id: "Routing", icon: Truck, label: "Routing Engine", section: "Operations Research" },
  { id: "Scheduling", icon: Calendar, label: "Scheduling", section: "Operations Research" },
  { id: "Sensitivity", icon: TrendingUp, label: "Sensitivity Analysis", section: "Operations Research" },
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
  const [marketingSpend, setMarketingSpend] = useState(20);
  
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

  const openKPIDetail = (kpi: any) => {
    setSelectedKPI(kpi);
  };

  const closeKPIDetail = () => {
    setSelectedKPI(null);
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
      alert("Error solving LP problem. Check your constraints.");
    }
  };

  const resetLP = () => {
    setSolution(null);
    setShowResults(false);
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

      case "Optimization Lab":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <Calculator className="w-7 h-7 text-emerald-400" />
                    Optimization Lab
                  </h2>
                  <p className="text-slate-300">Linear Programming Solver • Operations Research Engine</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={resetLP} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                  <button onClick={solveLP} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                    <Play className="w-4 h-4" /> Solve Optimization
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Objective Function
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <select 
                      value={objectiveType} 
                      onChange={(e) => setObjectiveType(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                            className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="text-sm font-mono text-slate-700">{v.name}</span>
                          {i < variables.length - 1 && <span className="text-slate-400">+</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={addVariable} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    + Add Variable
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    Constraints
                  </h3>
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
                                className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                          className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button onClick={() => removeConstraint(c.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addConstraint} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    + Add Constraint
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {showResults && solution ? (
                  <>
                    <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <h3 className="text-base font-bold text-emerald-900">Optimal Solution Found</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-white rounded-xl border border-emerald-200">
                          <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Objective Value</p>
                          <p className="text-3xl font-bold text-emerald-900 font-mono">
                            {solution.result?.toFixed(2)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {variables.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                              <span className="text-sm font-semibold text-slate-700">{v.name}</span>
                              <span className="text-lg font-bold text-emerald-700 font-mono">
                                {solution[v.name]?.toFixed(2) || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-4">Solution Status</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">Feasible</span>
                          <span className="text-sm font-bold text-emerald-600">{solution.feasible ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">Bounded</span>
                          <span className="text-sm font-bold text-emerald-600">{solution.bounded ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center">
                    <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-slate-600 mb-2">No Solution Yet</p>
                    <p className="text-xs text-slate-500">Define your objective function and constraints, then click "Solve Optimization"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Example Optimization Problems
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => {
                    setObjectiveType("maximize");
                    setVariables([
                      { name: "Product_A", coefficient: 5 },
                      { name: "Product_B", coefficient: 4 },
                    ]);
                    setConstraints([
                      { id: 1, coefficients: [6, 4], type: "<=", rhs: 24 },
                      { id: 2, coefficients: [1, 2], type: "<=", rhs: 6 },
                    ]);
                    resetLP();
                  }}
                  className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition"
                >
                  <p className="text-sm font-bold text-slate-900 mb-1">Production Mix</p>
                  <p className="text-xs text-slate-500">Maximize profit with resource constraints</p>
                </button>
                <button 
                  onClick={() => {
                    setObjectiveType("minimize");
                    setVariables([
                      { name: "Route_1", coefficient: 10 },
                      { name: "Route_2", coefficient: 15 },
                      { name: "Route_3", coefficient: 12 },
                    ]);
                    setConstraints([
                      { id: 1, coefficients: [1, 1, 1], type: ">=", rhs: 100 },
                      { id: 2, coefficients: [1, 0, 0], type: "<=", rhs: 50 },
                    ]);
                    resetLP();
                  }}
                  className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition"
                >
                  <p className="text-sm font-bold text-slate-900 mb-1">Transportation</p>
                  <p className="text-xs text-slate-500">Minimize delivery cost</p>
                </button>
                <button 
                  onClick={() => {
                    setObjectiveType("maximize");
                    setVariables([
                      { name: "Campaign_A", coefficient: 8 },
                      { name: "Campaign_B", coefficient: 6 },
                      { name: "Campaign_C", coefficient: 10 },
                    ]);
                    setConstraints([
                      { id: 1, coefficients: [100, 80, 120], type: "<=", rhs: 1000 },
                      { id: 2, coefficients: [1, 1, 1], type: "<=", rhs: 15 },
                    ]);
                    resetLP();
                  }}
                  className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition"
                >
                  <p className="text-sm font-bold text-slate-900 mb-1">Marketing Budget</p>
                  <p className="text-xs text-slate-500">Maximize ROI with budget constraint</p>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <Settings className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-slate-600">{activeTab} Module</h3>
            <p className="text-sm">Coming in next update...</p>
          </div>
        );
    }
  };

  const groupedItems = sidebarItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof sidebarItems>);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ANALYTIQ</span>
        </div>
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">{section}</p>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.id
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
              </div>
            </div>
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-semibold text-slate-800">{activeTab}</h1>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search modules..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">{renderContent()}</div>
      </main>

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
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-indigo-900 mb-2">AI Recommended Action</p>
                    <p className="text-sm text-indigo-700 mb-4">Launch immediate retention campaign targeting the top 20% of customers in Dar es Salaam branch.</p>
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
    </div>
  );
}