import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Briefcase, TrendingUp, Search, Edit2, Trash2, Eye, 
  CheckCircle, XCircle, BarChart3, FileText, AlertCircle, RefreshCw,
  UserCheck, UserX, Building, Award, Clock, Filter
} from 'lucide-react';
import { User, Job, Application } from '../types';

interface AdminDashboardProps {
  currentUser: User;
}

interface AdminStats {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  avgMatchScore: number;
  activeJobs: number;
  pendingApplications: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'applications'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCandidates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    avgMatchScore: 0,
    activeJobs: 0,
    pendingApplications: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'candidate' | 'employer'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, jobsRes, appsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/jobs'),
        fetch('/api/admin/applications'),
        fetch('/api/admin/stats')
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
      }
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.applications || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Admin data fetch failed:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAdminData();
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Delete user failed:', err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAdminData();
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Delete job failed:', err);
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: user.fullName,
          email: user.email,
          title: user.title,
          location: user.location
        })
      });
      if (res.ok) {
        await fetchAdminData();
        setEditingUser(null);
      }
    } catch (err) {
      console.error('Update user failed:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-purple-100">Kariyer Atlası Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{currentUser.fullName}</p>
                <p className="text-xs text-purple-200">Süper Admin</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">TOPLAM</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalUsers}</h3>
            <p className="text-sm text-slate-500 mt-1">Kayıtlı Kullanıcı</p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-600">👤 {stats.totalCandidates} Aday</span>
              <span className="text-xs text-slate-600">🏢 {stats.totalEmployers} İşveren</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Briefcase className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">İLANLAR</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalJobs}</h3>
            <p className="text-sm text-slate-500 mt-1">Yayınlanan İş İlanı</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-emerald-600">✓ {stats.activeJobs} Aktif</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">BAŞVURULAR</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalApplications}</h3>
            <p className="text-sm text-slate-500 mt-1">Toplam Başvuru</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-amber-600">⏳ {stats.pendingApplications} Beklemede</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-slate-500">UYUM ORANI</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">%{stats.avgMatchScore}</h3>
            <p className="text-sm text-slate-500 mt-1">Ortalama AI Eşleşme</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-600">🤖 Gemini AI</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'users'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Kullanıcılar ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'jobs'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="h-4 w-4 inline mr-2" />
              İş İlanları ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'applications'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Başvurular ({applications.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Son Aktiviteler
              </h3>
              <div className="space-y-3">
                {applications.slice(0, 5).map((app, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{app.candidateName}</p>
                        <p className="text-xs text-slate-500">Başvuru yaptı • {app.appliedAt}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">%{app.matchScore} uyum</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-slate-900">Backend API</h4>
                </div>
                <p className="text-xs text-slate-500">Flask + MySQL</p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Aktif
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-slate-900">Gemini AI</h4>
                </div>
                <p className="text-xs text-slate-500">CV Parsing & Matching</p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Çalışıyor
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-slate-900">Database</h4>
                </div>
                <p className="text-xs text-slate-500">MySQL 8.0</p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Bağlı
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            {/* Search & Filter */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kullanıcı ara (ad, email)..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterRole('all')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      filterRole === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setFilterRole('candidate')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      filterRole === 'candidate'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Adaylar
                  </button>
                  <button
                    onClick={() => setFilterRole('employer')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      filterRole === 'employer'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    İşverenler
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kullanıcı</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Konum</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Profil Gücü</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.title || 'Başlık yok'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'candidate'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role === 'candidate' ? '👤 Aday' : '🏢 İşveren'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{user.location || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (user.profileStrength || 0) >= 80
                                  ? 'bg-green-500'
                                  : (user.profileStrength || 0) >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${user.profileStrength || 20}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">
                            {user.profileStrength || 20}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Düzenle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İş ilanı ara (başlık, şirket)..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-6 space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="border border-slate-200 rounded-xl p-5 hover:border-purple-200 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{job.company} • {job.location}</p>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📊 {job.applicationCount} Başvuru</span>
                        <span>🎯 {job.candidateMatchesCount} Yüksek Eşleşme</span>
                        <span>📅 {job.postedAt}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition self-start"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Tüm Başvurular</h3>
            <div className="space-y-3">
              {applications.map((app) => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="border border-slate-200 rounded-xl p-4 hover:border-purple-200 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {app.candidateAvatarUrl ? (
                            <img src={app.candidateAvatarUrl} alt={app.candidateName} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                              {app.candidateName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{app.candidateName}</p>
                            <p className="text-xs text-slate-500">{app.candidateTitle}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">→ {job?.title || 'Pozisyon'} • {job?.company || 'Şirket'}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>📅 {app.appliedAt}</span>
                          <span className={`px-2 py-1 rounded-md font-semibold ${
                            app.status === 'Kabul Edildi' ? 'bg-green-100 text-green-700' :
                            app.status === 'Reddedildi' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="px-4 py-2 bg-emerald-50 rounded-lg">
                          <span className="text-xs font-semibold text-emerald-700">AI UYUM</span>
                          <p className="text-lg font-bold text-emerald-900">%{app.matchScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Silme Onayı</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const isUser = users.some(u => u.id === showDeleteConfirm);
                  if (isUser) {
                    handleDeleteUser(showDeleteConfirm);
                  } else {
                    handleDeleteJob(showDeleteConfirm);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Kullanıcı Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Unvan</label>
                <input
                  type="text"
                  value={editingUser.title || ''}
                  onChange={(e) => setEditingUser({...editingUser, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Konum</label>
                <input
                  type="text"
                  value={editingUser.location || ''}
                  onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleUpdateUser(editingUser)}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
