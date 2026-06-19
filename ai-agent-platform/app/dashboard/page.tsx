"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, MessageSquare, BarChart3, Settings, Plus, Play, Pause, Trash2, Users, TrendingUp, LogOut, ExternalLink } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  channel: string;
  status: string;
  messages_count: number;
  created_at: string;
}

interface Stats {
  total_agents: number;
  active_agents: number;
  messages_today: number;
  total_messages: number;
  active_users: number;
  success_rate: string;
  monthly_revenue: number;
  recent_activity: { time: string; event: string; type: string }[];
}

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", type: "support", channel: "web", system_prompt: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, statsRes] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/dashboard"),
      ]);
      const agentsData = await agentsRes.json();
      const statsData = await statsRes.json();
      setAgents(agentsData.agents || []);
      setStats(statsData.stats || null);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!newAgent.name) return;
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgent),
      });
      const data = await res.json();
      if (data.success) {
        setAgents([...agents, data.agent]);
        setShowCreateModal(false);
        setNewAgent({ name: "", type: "support", channel: "web", system_prompt: "" });
      }
    } catch (e) {
      console.error("Failed to create agent", e);
    }
  };

  const toggleAgent = async (id: string, status: string) => {
    const newStatus = status === "active" ? "paused" : "active";
    const res = await fetch("/api/agents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) fetchData();
  };

  const deleteAgent = async (id: string) => {
    if (!confirm("Delete this agent?")) return;
    const res = await fetch(`/api/agents?agent_id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">AgentFlow</span>
          </Link>
        </div>
        <nav className="mt-8 space-y-1 px-3">
          <NavItem icon={<Bot />} label="My Agents" active />
          <button onClick={() => setShowCreateModal(true)} className="w-full">
            <NavItem icon={<Plus />} label="Create Agent" />
          </button>
          <Link href="/billing">
            <NavItem icon={<BarChart3 />} label="Billing & Plans" />
          </Link>
          <Link href="/admin">
            <NavItem icon={<Settings />} label="Admin" />
          </Link>
          <button onClick={logout} className="w-full">
            <NavItem icon={<LogOut />} label="Sign Out" />
          </button>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-white font-medium">{user.name || "User"}</p>
              <p className="text-gray-400 text-sm capitalize">{user.plan === "none" ? "Free" : user.plan} Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Your AI agents at a glance</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Agent
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Bot className="h-6 w-6 text-purple-400" />} label="Total Agents" value={loading ? "..." : String(stats?.total_agents || 0)} />
          <StatCard icon={<MessageSquare className="h-6 w-6 text-green-400" />} label="Messages Today" value={loading ? "..." : String(stats?.messages_today || 0)} />
          <StatCard icon={<Users className="h-6 w-6 text-blue-400" />} label="Total Messages" value={loading ? "..." : String(stats?.total_messages || 0)} />
          <StatCard icon={<TrendingUp className="h-6 w-6 text-yellow-400" />} label="Success Rate" value={loading ? "..." : `${stats?.success_rate || "100"}%`} />
        </div>

        {/* Agents Grid */}
        <h2 className="text-xl font-semibold text-white mb-4">Your Agents</h2>
        {loading ? (
          <div className="text-slate-400 text-center py-12">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <Bot className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold mb-2">No agents yet</h3>
            <p className="text-slate-400 mb-6">Create your first AI agent to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Create First Agent
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    agent.status === "active" ? "bg-green-500/20" : "bg-slate-700"
                  }`}>
                    <Bot className={`h-5 w-5 ${agent.status === "active" ? "text-green-400" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{agent.name}</h3>
                    <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1">
                      <span className="capitalize">{agent.type}</span>
                      <span>•</span>
                      <span className="capitalize">{agent.channel}</span>
                      <span>•</span>
                      <span>{agent.messages_count} messages</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {agent.status}
                  </span>
                  <button
                    onClick={() => toggleAgent(agent.id, agent.status)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                    title={agent.status === "active" ? "Pause" : "Resume"}
                  >
                    {agent.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Feed */}
        {stats?.recent_activity && stats.recent_activity.length > 0 && !loading && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              {stats.recent_activity.map((item, i) => (
                <div key={i} className="flex items-start space-x-3 py-3 border-b border-slate-700 last:border-0">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    item.type === "success" ? "bg-green-400" : 
                    item.type === "warning" ? "bg-yellow-400" : "bg-blue-400"
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm">{item.event}</p>
                    <p className="text-slate-500 text-xs">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-lg mx-4 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Customer Support Bot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  value={newAgent.type}
                  onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="support">Customer Support</option>
                  <option value="lead">Lead Generation</option>
                  <option value="sales">Sales</option>
                  <option value="faq">FAQ</option>
                  <option value="content">Content</option>
                  <option value="research">Research</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Channel</label>
                <select
                  value={newAgent.channel}
                  onChange={(e) => setNewAgent({ ...newAgent, channel: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="web">Web Chat</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">System Prompt</label>
                <textarea
                  value={newAgent.system_prompt}
                  onChange={(e) => setNewAgent({ ...newAgent, system_prompt: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                  placeholder="How should your agent behave?"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={createAgent}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 rounded-xl bg-slate-700/50 flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition ${
      active ? "bg-purple-600/20 text-purple-400" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
    }`}>
      <span className="h-5 w-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
