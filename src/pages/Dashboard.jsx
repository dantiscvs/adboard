import { Link } from 'react-router-dom'
import { useAuthStore, useAdStore, useCampaignStore } from '../store'
import { Image, Megaphone, ArrowRight, Plus, Upload, Crown } from 'lucide-react'
import { timeAgo } from '../utils'

export default function Dashboard() {
  const user = useAuthStore(s => s.user)
  const ads = useAdStore(s => s.ads)
  const campaigns = useCampaignStore(s => s.campaigns)
  const upgradePlan = useAuthStore(s => s.upgradePlan)

  const recentAds = [...ads].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'pending_payment')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here's what's happening with your ads</p>
      </div>

      {/* Upgrade banner (free users) */}
      {user?.plan === 'free' && (
        <div className="card border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-purple-600/5 dark:from-purple-950/40 dark:to-[#13131e] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-purple-400 shrink-0" />
            <div>
              <p className="font-medium text-sm">Upgrade to run campaigns</p>
              <p className="text-xs text-gray-400">From 100 PLN ad spend · 7% fee · VAT-free invoicing</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/campaigns" className="btn-primary text-xs px-3 py-1.5">Launch campaign</Link>
            {/* Dev shortcut to simulate upgrade */}
            <button onClick={upgradePlan} className="btn-ghost text-xs px-3 py-1.5 text-purple-400" title="Simulate upgrade (dev)">
              Simulate upgrade
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Ads', value: ads.length, icon: <Image size={18} />, color: 'text-purple-400' },
          { label: 'Campaigns', value: campaigns.length, icon: <Megaphone size={18} />, color: 'text-blue-400' },
          { label: 'Active Now', value: activeCampaigns.length, icon: <Megaphone size={18} />, color: 'text-green-400' },
          { label: 'Plan', value: user?.plan === 'paid' ? 'Pro' : 'Free', icon: <Crown size={18} />, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`${s.color} mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/ads" className="card hover:border-purple-500/30 transition-colors flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/10 text-purple-400 flex items-center justify-center shrink-0">
              <Plus size={18} />
            </div>
            <div>
              <p className="font-medium text-sm">Create new ad</p>
              <p className="text-xs text-gray-500">Design a job ad</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 ml-auto" />
          </Link>
          <Link to="/ads?import=1" className="card hover:border-purple-500/30 transition-colors flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
              <Upload size={18} />
            </div>
            <div>
              <p className="font-medium text-sm">Import JSON</p>
              <p className="text-xs text-gray-500">Load saved ad file</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 ml-auto" />
          </Link>
          <Link to="/campaigns" className="card hover:border-purple-500/30 transition-colors flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-600/10 text-green-400 flex items-center justify-center shrink-0">
              <Megaphone size={18} />
            </div>
            <div>
              <p className="font-medium text-sm">New campaign</p>
              <p className="text-xs text-gray-500">Launch across platforms</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 ml-auto" />
          </Link>
        </div>
      </div>

      {/* Recent ads */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Recent Ads</h2>
          <Link to="/ads" className="text-xs text-purple-400 hover:text-purple-300">View all →</Link>
        </div>
        {recentAds.length === 0 ? (
          <div className="card text-center py-10">
            <Image size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No ads yet</p>
            <Link to="/ads" className="btn-primary mt-4 inline-block">Create your first ad</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentAds.map(ad => (
              <div key={ad.id} className="card hover:border-purple-500/20 transition-colors cursor-pointer">
                {ad.imageUrl ? (
                  <img src={ad.imageUrl} alt={ad.name} className="w-full h-28 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="w-full h-28 rounded-lg bg-theme-elevated flex items-center justify-center mb-3">
                    <Image size={24} className="text-gray-600" />
                  </div>
                )}
                <p className="font-medium text-sm truncate">{ad.name || ad.jobTitle || 'Untitled Ad'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{timeAgo(ad.updatedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
