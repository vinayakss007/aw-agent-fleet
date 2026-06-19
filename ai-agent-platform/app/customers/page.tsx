"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, Users, Search, Plus, Mail, Phone, Building2, X, ExternalLink } from "lucide-react";

interface Customer {
  id: string;
  business_name: string;
  email: string;
  phone: string;
  business_type: string;
  plan: string;
  status: string;
  agents_count: number;
  messages_count: number;
  revenue: number;
  created_at: string;
}

export default function CustomersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ business_name: "", email: "", phone: "", business_type: "other", plan: "starter" });

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (e) {
      console.error("Failed to load customers", e);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async () => {
    if (!newCustomer.business_name || !newCustomer.email) return;
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers([...customers, data.customer]);
        setShowAddModal(false);
        setNewCustomer({ business_name: "", email: "", phone: "", business_type: "other", plan: "starter" });
      }
    } catch (e) {
      console.error("Failed to add customer", e);
    }
  };

  const filtered = customers.filter((c) =>
    c.business_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || !user) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;
  }

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
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm">Admin</Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 text-sm">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
            <p className="text-slate-400">Manage your customer deployments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold mb-2">No customers yet</h3>
            <p className="text-slate-400 mb-6">Add your first customer to get started</p>
          </div>
        ) : (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Business</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Contact</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Plan</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Status</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Agents</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-slate-500" />
                        <span className="text-white font-medium">{customer.business_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-slate-400 text-sm">
                          <Mail className="h-4 w-4 mr-2" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-slate-400 text-sm">
                            <Phone className="h-4 w-4 mr-2" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-white">{customer.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{customer.agents_count}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">₹{customer.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {!loading && filtered.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-white">{customers.length}</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-1">Active Customers</p>
              <p className="text-3xl font-bold text-white">{customers.filter(c => c.status === "active").length}</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-400">₹{customers.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-lg mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Customer</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                <input type="text" value={newCustomer.business_name} onChange={(e) => setNewCustomer({...newCustomer, business_name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., ABC Restaurants" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="customer@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input type="tel" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+91 98765 43210" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Business Type</label>
                  <select value={newCustomer.business_type} onChange={(e) => setNewCustomer({...newCustomer, business_type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="restaurant">Restaurant</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Plan</label>
                  <select value={newCustomer.plan} onChange={(e) => setNewCustomer({...newCustomer, plan: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="starter">Starter (₹2K)</option>
                    <option value="professional">Professional (₹5K)</option>
                    <option value="enterprise">Enterprise (₹8K)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-400 hover:text-white transition">Cancel</button>
              <button onClick={addCustomer} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">Add Customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
