import React, { useState } from 'react';
import {
  Award, Plus, Trash2, Edit2, ExternalLink, FileText, Upload, X,
  CheckCircle, AlertCircle, Calendar, Building, Tag, Sparkles, Filter
} from 'lucide-react';
import { CertificateEntry, CertificateCategory, CERTIFICATE_CATEGORIES } from '../types';

interface CertificateManagerProps {
  certificates: CertificateEntry[];
  onUpdate: (certificates: CertificateEntry[]) => void;
  userTitle?: string;
  userSkills?: string[];
}

export const CertificateManager: React.FC<CertificateManagerProps> = ({
  certificates,
  onUpdate,
  userTitle,
  userSkills
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificateEntry | null>(null);
  const [viewingCert, setViewingCert] = useState<CertificateEntry | null>(null);
  const [filterCategory, setFilterCategory] = useState<CertificateCategory | 'all'>('all');
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CertificateEntry>>({
    name: '',
    issuer: '',
    category: 'software_development',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
    verified: false
  });

  const handleAdd = () => {
    const newCert: CertificateEntry = {
      id: `cert_${Date.now()}`,
      name: formData.name || '',
      issuer: formData.issuer || '',
      category: formData.category || 'software_development',
      issueDate: formData.issueDate || '',
      expiryDate: formData.expiryDate,
      credentialId: formData.credentialId,
      credentialUrl: formData.credentialUrl,
      description: formData.description,
      verified: formData.verified
    };

    onUpdate([...certificates, newCert]);
    resetForm();
    setShowAddModal(false);
  };

  const handleUpdate = () => {
    if (editingCert) {
      onUpdate(
        certificates.map(cert =>
          cert.id === editingCert.id ? { ...editingCert, ...formData } : cert
        )
      );
      resetForm();
      setEditingCert(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu sertifikayı silmek istediğinize emin misiniz?')) {
      onUpdate(certificates.filter(cert => cert.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      category: 'software_development',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      description: '',
      verified: false
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          fileUrl: reader.result as string,
          fileType: file.type.includes('pdf') ? 'pdf' : 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // AI-powered certificate recommendations based on user profile
  const getAIRecommendations = (): string[] => {
    const recommendations: string[] = [];
    
    if (userTitle?.toLowerCase().includes('frontend') || userTitle?.toLowerCase().includes('react')) {
      recommendations.push('React Advanced Certification');
      recommendations.push('TypeScript Fundamentals');
      recommendations.push('Web Accessibility (WCAG)');
    }
    
    if (userTitle?.toLowerCase().includes('backend') || userTitle?.toLowerCase().includes('node')) {
      recommendations.push('AWS Certified Solutions Architect');
      recommendations.push('Docker & Kubernetes');
      recommendations.push('PostgreSQL Advanced');
    }
    
    if (userTitle?.toLowerCase().includes('data') || userTitle?.toLowerCase().includes('ai')) {
      recommendations.push('TensorFlow Developer Certificate');
      recommendations.push('Google Cloud ML Engineer');
      recommendations.push('Python for Data Science');
    }
    
    if (userSkills?.some(s => s.toLowerCase().includes('aws'))) {
      recommendations.push('AWS Certified Developer - Associate');
    }
    
    return recommendations.slice(0, 5);
  };

  const filteredCertificates = filterCategory === 'all'
    ? certificates
    : certificates.filter(cert => cert.category === filterCategory);

  const certsByCategory = certificates.reduce((acc, cert) => {
    if (!acc[cert.category]) acc[cert.category] = [];
    acc[cert.category].push(cert);
    return acc;
  }, {} as Record<string, CertificateEntry[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Sertifikalarım
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {certificates.length} sertifika · Profil gücünüzü artırın
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAIRecommendations(!showAIRecommendations)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            AI Önerileri
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            <Plus className="h-4 w-4" />
            Sertifika Ekle
          </button>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      {showAIRecommendations && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-purple-900 mb-2">
                Kariyeriniz için Önerilen Sertifikalar
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                Yapay zeka analizine göre profilinize uygun sertifikalar:
              </p>
              <div className="space-y-2">
                {getAIRecommendations().map((rec, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-900 font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
            filterCategory === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tümü ({certificates.length})
        </button>
        {Object.entries(CERTIFICATE_CATEGORIES).map(([key, label]) => {
          const count = certsByCategory[key]?.length || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key as CertificateCategory)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                filterCategory === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className="border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-emerald-200 transition cursor-pointer bg-white"
              onClick={() => setViewingCert(cert)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{cert.name}</h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {cert.issuer}
                  </p>
                </div>
                {cert.verified && (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                  {CERTIFICATE_CATEGORIES[cert.category]}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Calendar className="h-3 w-3" />
                {new Date(cert.issueDate).toLocaleDateString('tr-TR')}
                {cert.expiryDate && (
                  <span className="text-amber-600">
                    · Geçerlilik: {new Date(cert.expiryDate).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCert(cert);
                    setFormData(cert);
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition"
                >
                  <Edit2 className="h-3 w-3 inline mr-1" />
                  Düzenle
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cert.id);
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium transition"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-900 mb-1">
            {filterCategory === 'all' ? 'Henüz sertifika eklenmedi' : 'Bu kategoride sertifika bulunamadı'}
          </h4>
          <p className="text-sm text-slate-500 mb-4">
            Kariyerinizi güçlendirmek için sertifikalarınızı ekleyin
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            İlk Sertifikayı Ekle
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingCert) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingCert ? 'Sertifikayı Düzenle' : 'Yeni Sertifika Ekle'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCert(null);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Sertifika Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="AWS Certified Solutions Architect"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Veren Kurum *
                  </label>
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="Amazon Web Services"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CertificateCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {Object.entries(CERTIFICATE_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Alınma Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Geçerlilik Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Sertifika Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.credentialId || ''}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    placeholder="ABC123XYZ"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Doğrulama Bağlantısı
                  </label>
                  <input
                    type="url"
                    value={formData.credentialUrl || ''}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sertifika hakkında ek bilgiler..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sertifika Dosyası (PDF/Görsel)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-emerald-500 transition">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cert-file-upload"
                  />
                  <label
                    htmlFor="cert-file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">
                      Tıklayarak dosya yükleyin
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PDF, PNG, JPG (Max 5MB)
                    </span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.verified || false}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">
                  Bu sertifika doğrulanmış
                </span>
              </label>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCert(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                İptal
              </button>
              <button
                onClick={editingCert ? handleUpdate : handleAdd}
                disabled={!formData.name || !formData.issuer || !formData.issueDate}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCert ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Certificate Detail Modal */}
      {viewingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-900">{viewingCert.name}</h3>
                </div>
                <button
                  onClick={() => setViewingCert(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Veren Kurum</p>
                  <p className="font-semibold text-slate-900">{viewingCert.issuer}</p>
                </div>
                {viewingCert.verified && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Doğrulanmış</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Kategori</p>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                  {CERTIFICATE_CATEGORIES[viewingCert.category]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Alınma Tarihi</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(viewingCert.issueDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {viewingCert.expiryDate && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Geçerlilik Tarihi</p>
                    <p className="font-semibold text-amber-600">
                      {new Date(viewingCert.expiryDate).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {viewingCert.credentialId && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Sertifika Numarası</p>
                  <p className="font-mono text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded">
                    {viewingCert.credentialId}
                  </p>
                </div>
              )}

              {viewingCert.description && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Açıklama</p>
                  <p className="text-sm text-slate-700">{viewingCert.description}</p>
                </div>
              )}

              {viewingCert.credentialUrl && (
                <a
                  href={viewingCert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Sertifikayı Doğrula
                </a>
              )}

              {viewingCert.fileUrl && (
                <div className="border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Sertifika Dosyası</p>
                  {viewingCert.fileType === 'pdf' ? (
                    <a
                      href={viewingCert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                    >
                      <FileText className="h-5 w-5" />
                      <span>PDF'i Görüntüle</span>
                    </a>
                  ) : (
                    <img
                      src={viewingCert.fileUrl}
                      alt={viewingCert.name}
                      className="max-w-full h-auto rounded"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingCert(null)}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
