// Shared types for AbetWorks Agent Fleet

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: "admin" | "customer";
  plan: "starter" | "professional" | "enterprise" | "none";
  created_at: string;
}

export interface Agent {
  id: string;
  customer_id: string;
  name: string;
  type: "support" | "lead" | "content" | "research" | "sales" | "faq" | "reservation";
  channel: "whatsapp" | "telegram" | "discord" | "slack" | "email" | "web" | "cli";
  model: {
    provider: "groq" | "openrouter" | "anthropic" | "openai";
    model: string;
    api_key?: string;
  };
  system_prompt: string;
  status: "active" | "paused" | "stopped";
  messages_count: number;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  business_name: string;
  email: string;
  phone: string;
  business_type: string;
  plan: "starter" | "professional" | "enterprise";
  status: "active" | "paused" | "suspended";
  agents_count: number;
  messages_count: number;
  revenue: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  agent_id: string;
  customer_id: string;
  user_message: string;
  agent_response: string;
  channel: string;
  created_at: string;
}

export interface Stats {
  total_customers: number;
  total_agents: number;
  active_agents: number;
  messages_today: number;
  total_messages: number;
  active_users: number;
  success_rate: number;
  monthly_revenue: number;
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  time: string;
  event: string;
  type: "success" | "info" | "warning";
}
