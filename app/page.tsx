"use client";

import { useState } from "react";
import * as Solver from "javascript-lp-solver";
import { 
  Target, TrendingUp, Sliders, Shield, Activity, BarChart3, 
  Lightbulb, BrainCircuit, Search, Upload, X, FileSpreadsheet,
  ChevronRight, Zap, Award, Calculator, GitBranch, Dice5,
  Truck, Users, Package, Calendar, ArrowUpRight, ArrowDownRight,
  CheckCircle2, AlertTriangle, TrendingDown, DollarSign,
  Settings, Bell, Download, Play, RotateCcw
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const sidebarItems = [
  { id: "Optimization Lab", icon: Calculator, label: "Optimization Lab", highlight: true },
  { id: "Simulation Lab", icon: Dice5, label: "Simulation Lab" },
  { id: "Decision Trees", icon: GitBranch, label: "Decision Trees" },
  { id: "Monte Carlo", icon: Activity, label: "Monte Carlo" },
  { id: "Resource Allocation", icon: Users, label: "Resource Allocation" },
  { id: "Routing", icon: Truck, label: "Routing Engine" },
  { id: "Scheduling", icon: Calendar, label: "Scheduling" },
  { id: "Sensitivity", icon: TrendingUp, label: "Sensitivity Analysis" },
];

export default function AnalytiqDashboard() {
  const [activeTab, setActiveTab] = useState("Optimization Lab");
  
  // Linear Programming State
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

  const addVariable = () => {
    const newVar = { name: `x${variables.length + 1}`, coefficient: 0 };
    setVariables([...variables, newVar]);
    setConstraints(constraints.map(c => ({ ...c, coefficients: [...c.coefficients, 0] })));
  };

  const removeVariable = (index: number) => {
    if (variables.length <= 2) return;
    setVariables(variables.filter((_, i) => i !== index));
    setConstraints(constraints.map(c => ({ ...c, coefficients: c.coefficients.filter((_, i) => i !== index) })));
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

    variables.forEach((v, i) => {
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
      case "Optimization Lab":
        return (
          <div className="space-y-6">
            {/* Header */}
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

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel: Model Definition */}
              <div className="lg:col-span-2 space-y-6">
                {/* Objective Function */}
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

                {/* Constraints */}
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

              {/* Right Panel: Results */}
              <div className="space-y-6">
                {showResults && solution ? (
                  <>
                    {/* Optimal Solution */}
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

                    {/* Feasibility */}
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

            {/* Example Problems */}
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
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

      {/* Main Content */}
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
    </div>
  );
}