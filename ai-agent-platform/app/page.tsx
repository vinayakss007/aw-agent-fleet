import Link from "next/link";
import { Bot, MessageSquare, BarChart3, Zap, CheckCircle, ArrowRight, Menu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-purple-400" />
              <div>
                <span className="text-xl font-bold text-white">AbetWorks</span>
                <span className="text-purple-400 text-sm ml-2">Agent Fleet</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
              <Link href="#demo" className="text-gray-300 hover:text-white transition">Demo</Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition">Sign In</Link>
              <Link href="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            AI Agents That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Work While You Sleep
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Deploy intelligent AI agents for customer support, lead generation, content creation, and more. 
            Starting at just ₹2,000/month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center">
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#demo" className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
              Watch Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Everything You Need to Automate Your Business
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-purple-400" />}
            title="Customer Support Bot"
            description="24/7 automated support on WhatsApp, Telegram, and more. Never miss a customer query."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 text-pink-400" />}
            title="Lead Generation"
            description="Find, qualify, and reach out to potential customers automatically. Fill your pipeline."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-yellow-400" />}
            title="Content Automation"
            description="Generate blog posts, social media content, and marketing copy at scale."
          />
          <FeatureCard
            icon={<Bot className="h-8 w-8 text-green-400" />}
            title="Research Agent"
            description="Market research, competitor analysis, and insights delivered automatically."
          />
          <FeatureCard
            icon={<CheckCircle className="h-8 w-8 text-blue-400" />}
            title="DevOps Monitoring"
            description="Monitor servers, get alerts, and auto-fix issues before they impact customers."
          />
          <FeatureCard
            icon={<Bot className="h-8 w-8 text-red-400" />}
            title="Personal AI Assistant"
            description="Your own Jarvis. Manage emails, schedule meetings, and organize your work."
          />
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold text-white text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-gray-300 text-center mb-16">Deploy your fleet of AI employees today</p>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard
            name="Starter"
            price="₹2,000"
            period="/month"
            description="Perfect for small businesses"
            features={[
              "1 AI Agent",
              "1,000 messages/month",
              "WhatsApp + Telegram",
              "Basic analytics",
              "Email support"
            ]}
            cta="Start Free Trial"
            popular={false}
          />
          <PricingCard
            name="Professional"
            price="₹5,000"
            period="/month"
            description="Growing businesses"
            features={[
              "3 AI Agents",
              "10,000 messages/month",
              "All channels",
              "Advanced analytics",
              "Custom integrations",
              "Priority support"
            ]}
            cta="Start Free Trial"
            popular={true}
          />
          <PricingCard
            name="Enterprise"
            price="₹8,000"
            period="/month"
            description="Large scale operations"
            features={[
              "Unlimited AI Agents",
              "Unlimited messages",
              "Custom AI models",
              "White-label option",
              "Dedicated support",
              "SLA guarantee"
            ]}
            cta="Contact Sales"
            popular={false}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-purple-100 mb-8 text-lg">
            Start your 14-day free trial. No credit card required.
          </p>
          <Link href="/dashboard" className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition inline-block">
            Create Your First Agent
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2026 AbetWorks Agent Fleet. Built with ❤️ for businesses.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period, description, features, cta, popular }: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}) {
  return (
    <div className={`rounded-2xl p-8 ${popular ? 'bg-purple-600 border-2 border-purple-400' : 'bg-white/5 border border-white/10'}`}>
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <p className="text-purple-200 mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-purple-200">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-white">
            <CheckCircle className="h-5 w-5 mr-3 text-purple-300 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-xl font-semibold transition ${popular ? 'bg-white text-purple-600 hover:bg-gray-100' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
        {cta}
      </button>
    </div>
  );
}
