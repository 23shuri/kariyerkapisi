import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Briefcase, GraduationCap, Mail, Globe, Github, 
  Linkedin, Calendar, Building2, Award, Code, Languages, 
  ExternalLink, FileText, Target, CheckCircle2, Share2, Target as TargetIcon
} from 'lucide-react';
import { User, EducationEntry, ExperienceEntry, CertificateEntry, ProjectEntry, LanguageEntry } from '../types';

interface PublicProfilePageProps {
  userId: string;
  currentUser: User | null;
  onBack: () => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ 
  userId, 
  currentUser,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'education' | 'skills'>('overview');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user details for the public profile view
    const fetchUser = async () => {
      setLoading(true);
      try {
        if (currentUser && currentUser.id === userId) {
          setUser(currentUser);
        } else {
          // Attempt to fetch from API in a real application
          const res = await fetch(`/api/users/${userId}`);
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // Mock fallback if API is not available
            setUser({
              id: userId,
              email: 'kullanici@example.com',
              fullName: 'Kullanıcı Profili',
              role: 'candidate',
              title: 'Yazılım Geliştirici',
              bio: 'Merhaba, bu örnek bir profildir. İş arayışındayım ve yeteneklerimi geliştirmeye odaklanıyorum.',
              experienceYears: 3,
              skills: ['React', 'TypeScript', 'Node.js'],
              location: 'İstanbul',
              workPreference: 'hybrid',
              profileStrength: 85,
              experience: [
                {
                  id: 'exp1',
                  company: 'Örnek Şirket',
                  position: 'Frontend Developer',
                  startDate: '2021',
                  current: true,
                  description: 'React ve TypeScript kullanarak modern web uygulamaları geliştirme.'
                }
              ],
              education: [
                {
                  id: 'edu1',
                  school: 'Örnek Üniversitesi',
                  degree: 'Lisans',
                  field: 'Bilgisayar Mühendisliği',
                  startDate: '2016',
                  endDate: '2020'
                }
              ]
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
        // Fallback for demo
        setUser({
          id: userId,
          email: 'kullanici@example.com',
          fullName: 'Kullanıcı Profili',
          role: 'candidate',
          title: 'Yazılım Geliştirici',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId, currentUser]);

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(profileUrl);
    alert('Profil linki kopyalandı!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[500px]">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Kullanıcı bulunamadı</h2>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Geri Dön</button>
      </div>
    );
  }

  const totalExperienceYears = user.experienceYears || 
    (user.experience && user.experience.length > 0 ? 
      Math.max(...user.experience.map((exp: ExperienceEntry) => {
        const start = parseInt(exp.startDate);
        const end = exp.current ? new Date().getFullYear() : parseInt(exp.endDate || '0');
        return isNaN(end) || isNaN(start) ? 0 : end - start;
      })) : 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        {user.coverPhotoUrl && (
          <img src={user.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        
        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition backdrop-blur-md font-medium shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            Geri Dön
          </button>
        </div>

        {/* Share Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition backdrop-blur-md shadow-sm"
            title="Profili Paylaş"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 p-8 border-b border-slate-100">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName} 
                  className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white object-cover shadow-lg bg-white" 
                />
              ) : (
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 flex items-center justify-center font-bold text-5xl shadow-lg">
                  {user.fullName.charAt(0)}
                </div>
              )}
              {user.profileStrength && user.profileStrength >= 80 && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-md border-2 border-white" title="Onaylı Profil">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 pt-2 md:pt-4">
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{user.fullName}</h1>
              <p className="text-xl text-slate-600 font-medium mb-4">{user.title || 'Kullanıcı'}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                {user.location && (
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {user.location}
                  </span>
                )}
                {totalExperienceYears > 0 && (
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    {totalExperienceYears} yıl deneyim
                  </span>
                )}
                {user.workPreference && (
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <TargetIcon className="h-4 w-4 text-slate-400" />
                    {user.workPreference === 'remote' ? 'Uzaktan' : 
                     user.workPreference === 'hybrid' ? 'Hibrit' : 
                     user.workPreference === 'office' ? 'Ofis' : 'Esnek'}
                  </span>
                )}
              </div>

              {/* Social Links */}
              {(user.linkedinUrl || user.githubUrl || user.portfolioUrl) && (
                <div className="flex items-center gap-3">
                  {user.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {user.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg transition text-sm font-medium">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a href={user.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition text-sm font-medium">
                      <Globe className="h-4 w-4" /> Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {/* Actions for current user or other */}
            {currentUser && currentUser.id !== userId && (
               <div className="flex-shrink-0 pt-4 md:pt-0 self-start">
                  <button className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Mesaj Gönder
                  </button>
               </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row bg-white">
            
            {/* Content */}
            <div className="flex-1 p-8">
              
              {/* Tabs */}
              <div className="flex items-center gap-4 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
                <button onClick={() => setActiveTab('overview')} className={`px-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Genel Bakış</button>
                <button onClick={() => setActiveTab('experience')} className={`px-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'experience' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Deneyim</button>
                <button onClick={() => setActiveTab('education')} className={`px-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'education' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Eğitim</button>
                <button onClick={() => setActiveTab('skills')} className={`px-2 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'skills' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Yetenekler</button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* About */}
                    {user.bio && (
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Hakkımda
                        </h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                      </div>
                    )}

                    {/* Skills Summary */}
                    {user.skills && user.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Code className="h-5 w-5 text-purple-600" />
                          Yetenekler
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {user.skills.map((skill, index) => (
                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-100 hover:border-blue-200 transition">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {user.projects && user.projects.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Target className="h-5 w-5 text-indigo-600" />
                          Projeler ({user.projects.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {user.projects.map((project: ProjectEntry) => (
                            <div key={project.id} className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition bg-white">
                              <h4 className="font-bold text-slate-900 text-lg">{project.name}</h4>
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{project.description}</p>
                              
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                  {project.technologies.map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {project.url && (
                                <div className="mt-5 pt-4 border-t border-slate-100">
                                  <a href={project.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5 font-medium transition">
                                    <ExternalLink className="h-4 w-4" /> Projeyi İncele
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" /> İş Deneyimi
                    </h3>
                    {user.experience && user.experience.length > 0 ? (
                      <div className="space-y-6">
                        {user.experience.map((exp: ExperienceEntry) => (
                          <div key={exp.id} className="relative pl-6 border-l-2 border-blue-200 ml-3">
                            <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-2.5 border-2 border-white shadow"></div>
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-sm transition">
                              <h4 className="font-bold text-slate-900 text-lg">{exp.position}</h4>
                              <div className="flex flex-wrap gap-4 mt-2">
                                <p className="text-sm text-slate-700 font-medium flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-slate-200">
                                  <Building2 className="h-4 w-4 text-blue-600" /> {exp.company}
                                </p>
                                <p className="text-sm text-slate-500 flex items-center gap-1.5 bg-white px-3 py-1 rounded-md border border-slate-200">
                                  <Calendar className="h-4 w-4 text-slate-400" /> {exp.startDate} - {exp.current ? 'Devam Ediyor' : exp.endDate}
                                </p>
                              </div>
                              {exp.description && (
                                <p className="text-sm text-slate-600 mt-4 leading-relaxed bg-white p-4 rounded-lg border border-slate-100">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Henüz iş deneyimi eklenmemiş.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-emerald-600" /> Eğitim Geçmişi
                    </h3>
                    {user.education && user.education.length > 0 ? (
                      <div className="space-y-6">
                        {user.education.map((edu: EducationEntry) => (
                          <div key={edu.id} className="relative pl-6 border-l-2 border-emerald-200 ml-3">
                            <div className="absolute w-3 h-3 bg-emerald-600 rounded-full -left-[7px] top-2.5 border-2 border-white shadow"></div>
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-sm transition">
                              <h4 className="font-bold text-slate-900 text-lg">{edu.school}</h4>
                              <p className="text-md text-emerald-700 font-medium mt-1">
                                {edu.degree}{edu.field ? ` • ${edu.field}` : ''}
                              </p>
                              <p className="text-sm text-slate-500 mt-3 flex items-center gap-1.5 bg-white inline-flex px-3 py-1 rounded-md border border-slate-200">
                                <Calendar className="h-4 w-4 text-slate-400" /> {edu.startDate} - {edu.current ? 'Devam Ediyor' : edu.endDate}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                        <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Henüz eğitim bilgisi eklenmemiş.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Certificates */}
                    {user.certificates && user.certificates.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Award className="h-5 w-5 text-emerald-600" /> Sertifikalar ve Başarılar
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {user.certificates.map((cert: CertificateEntry) => (
                            <div key={cert.id} className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition bg-white group">
                              <h4 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">{cert.name}</h4>
                              <p className="text-sm text-slate-600 mt-1">{cert.issuer}</p>
                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3" /> {cert.issueDate}
                                </p>
                                {cert.credentialUrl && (
                                  <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 font-medium bg-emerald-50 px-2.5 py-1 rounded-md transition">
                                    <ExternalLink className="h-3 w-3" /> Doğrula
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Award className="h-5 w-5 text-emerald-600" /> Sertifikalar
                        </h3>
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                          <p className="text-slate-500 text-sm">Sertifika bulunmuyor</p>
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {user.languages && user.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Languages className="h-5 w-5 text-orange-600" /> Yabancı Diller
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {user.languages.map((lang: LanguageEntry) => (
                            <div key={lang.id} className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-center hover:shadow-sm transition hover:bg-orange-100/50">
                              <p className="font-bold text-slate-900 text-lg">{lang.language || lang.name}</p>
                              <p className="text-sm text-orange-700 font-medium mt-1 bg-white inline-block px-2 py-0.5 rounded-full border border-orange-200">{lang.level}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
