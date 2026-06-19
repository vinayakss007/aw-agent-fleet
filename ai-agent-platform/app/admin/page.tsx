"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Key, Settings, BarChart3, Wrench, Save, CheckCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [groqKey, setGroqKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    loadConfig();
    loadStats();
  }, [user]);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      setConfig(data.config || {});
      setGroqKey(data.config?.api_keys?.groq || "");
    } catch (e) {
      console.error("Failed to load config", e);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data.stats || {});
    } catch (e) {
      console.error("Failed to load stats", e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      const newConfig = { ...config, api_keys: { ...config.api_keys, groq: groqKey } };
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save config", e);
    }
  };

  if (authLoading || !user) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "keys", label: "API Keys", icon: <Key className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">AgentFlow</span>
            </Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">Dashboard</Link>
            <Link href="/customers" className="text-slate-400 hover:text-white transition-colors text-sm">Customers</Link>
          </div>
          <div className="text-slate-400 text-sm">{user.email} • Admin</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 rounded-xl p-1 border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <StatBox label="Total Agents" value={String(stats.total_agents || 0)} />
              <StatBox label="Total Customers" value={String(stats.total_customers || 0)} />
              <StatBox label="Messages" value={String(stats.total_messages || 0)} />
              <StatBox label="Monthly Revenue" value={`₹${(stats.monthly_revenue || 0).toLocaleString()}`} />
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Start Guide</h3>
              <ol className="space-y-3 text-slate-400">
                <li className="flex items-start space-x-3">
                  <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center shrink-0">1</span>
                  <span>Set your <strong className="text-white">Groq API Key</strong> in the API Keys tab</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center shrink-0">2</span>
                  <span>Create an AI agent from the <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">Dashboard</Link></span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center shrink-0">3</span>
                  <span>Test your agent with the chat API — it uses Groq&apos;s free tier!</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center shrink-0">4</span>
                  <span>Add customers and deploy agents to start earning ₹2K-₹8K/month per customer</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "keys" && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">API Key Configuration</h2>
            <p className="text-slate-400 mb-6">
              Your Groq API key is used for AI responses. Get a free key at{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">console.groq.com</a>
              {" "}— no credit card required, 10K requests/day free.
            </p>

            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Groq API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="gsk_your_groq_api_key"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-1">Stored securely in server config</p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={saveConfig}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save API Key</span>
                </button>
                {saved && (
                  <span className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Saved successfully!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Default AI Provider</label>
                <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="groq">Groq (Free, Fast)</option>
                  <option value="openrouter">OpenRouter (50+ Models)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Default Model</label>
                <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Fast, Quality)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fastest)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (Large Context)</option>
                </select>
              </div>
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                <Save className="h-4 w-4 inline mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
