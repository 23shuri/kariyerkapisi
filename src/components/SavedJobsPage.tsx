import React, { useState, useEffect } from 'react';
import { 
  Bookmark, Trash2, ExternalLink, MapPin, Briefcase, DollarSign, 
  Clock, ArrowLeft, Search, Filter, Sparkles
} from 'lucide-react';
import { User, Job } from '../types';

interface SavedJobsPageProps {
  currentUser: User;
  onBack: () => void;
}

interface SavedJob {
  savedJob: {
    id: string;
    userId: string;
    jobId: string;
    savedAt: string;
  };
  job: Job;
}

export const SavedJobsPage: React.FC<SavedJobsPageProps> = ({ currentUser, onBack }) => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, [currentUser.id]);

  const fetchSavedJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/saved-jobs?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.savedJobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSavedJob = async (savedJobId: string) => {
    try {
      const res = await fetch(`/api/saved-jobs/${savedJobId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchSavedJobs();
      }
    } catch (err) {
      console.error('Failed to remove saved job:', err);
    }
  };

  const filteredJobs = savedJobs.filter(savedJob =>
    savedJob.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    savedJob.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    savedJob.job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-amber-600" />
                Kaydedilen İlanlar
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {savedJobs.length} ilan kaydedildi
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pozisyon, şirket veya konum ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Yükleniyor...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Bookmark className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {searchQuery ? 'Sonuç Bulunamadı' : 'Henüz Kaydedilmiş İlan Yok'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery 
                ? 'Arama kriterlerinize uygun ilan bulunamadı.' 
                : 'İlgilendiğiniz ilanları kaydedin, buradan kolayca erişin.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
              >
                İlanları Keşfet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((savedJob) => (
              <div
                key={savedJob.savedJob.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Company & Location */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {savedJob.job.company}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {savedJob.job.location}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {savedJob.job.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {savedJob.job.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {savedJob.job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {savedJob.job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {savedJob.job.salaryRange}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Kaydedildi: {savedJob.savedJob.savedAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleRemoveSavedJob(savedJob.savedJob.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Kaldır"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Detayları Gör"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Application Info */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>📊 {savedJob.job.applicationCount} başvuru</span>
                    <span>🎯 {savedJob.job.candidateMatchesCount} yüksek eşleşme</span>
                    <span>📅 {savedJob.job.postedAt}</span>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">
                    Başvur
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
