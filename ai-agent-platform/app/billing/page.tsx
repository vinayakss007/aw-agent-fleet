"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLANS = {
  starter: { name: "Starter", price: 1999, currency: "₹", description: "For small businesses", agents: 1, messages: "1,000/mo" },
  professional: { name: "Professional", price: 4999, currency: "₹", description: "For growing teams", agents: 3, messages: "10,000/mo" },
  enterprise: { name: "Enterprise", price: 7999, currency: "₹", description: "For large organizations", agents: "Unlimited", messages: "Unlimited" },
};

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const handleSelectPlan = async (plan: string) => {
    setSelectedPlan(plan);
    setLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
      } else {
        alert(data.message || "Plan selected! Configure Razorpay for payments.");
      }
    } catch (err) {
      alert("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-white">Agent Fleet</h1>
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">Dashboard</Link>
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm">Admin</Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 text-sm">{user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">Choose Your Plan</h2>
          <p className="text-slate-400 text-lg">Your current plan: <span className="text-blue-400 font-semibold capitalize">{user.plan || "None"}</span></p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-slate-800/50 border rounded-2xl p-8 flex flex-col ${
                user.plan === key ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-700"
              }`}
            >
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.currency}{plan.price.toLocaleString()}</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {plan.agents} Agent{plan.agents !== 1 ? "s" : ""}
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {plan.messages} messages
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Multi-channel support
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  AI-powered responses
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan(key)}
                disabled={loading && selectedPlan === key}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  user.plan === key
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-50`}
              >
                {loading && selectedPlan === key ? "Processing..." : user.plan === key ? "Current Plan" : "Subscribe"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
