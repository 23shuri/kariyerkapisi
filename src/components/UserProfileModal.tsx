import React from 'react';
import { X, MapPin, Briefcase, GraduationCap, Mail, Globe, Github, Linkedin, Calendar, Building2 } from 'lucide-react';
import { User, EducationEntry, ExperienceEntry } from '../types';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (Cover & Avatar) */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition backdrop-blur-md"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute -bottom-12 left-6">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md" />
            ) : (
              <div className="h-24 w-24 rounded-full border-4 border-white bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl shadow-md">
                {user.fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pt-14 px-6 pb-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{user.fullName}</h2>
            <p className="text-lg text-slate-600">{user.title || 'Kullanıcı'}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </span>
              )}
              {user.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${user.email}`} className="hover:text-blue-600">{user.email}</a>
                </span>
              )}
            </div>
            
            {(user.linkedinUrl || user.githubUrl || user.portfolioUrl) && (
              <div className="flex items-center gap-3 mt-4">
                {user.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {user.githubUrl && (
                  <a href={user.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {user.portfolioUrl && (
                  <a href={user.portfolioUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-600 transition">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {user.bio && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Hakkında</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Experience */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Deneyim
              </h3>
              {user.experience && user.experience.length > 0 ? (
                <div className="space-y-4">
                  {user.experience.map((exp: ExperienceEntry) => (
                    <div key={exp.id} className="relative pl-4 border-l-2 border-blue-100">
                      <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full -left-[6px] top-1.5 border border-white"></div>
                      <h4 className="font-semibold text-slate-900">{exp.position}</h4>
                      <p className="text-sm text-slate-700 font-medium flex items-center gap-1.5 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        {exp.company}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {exp.startDate} - {exp.current ? 'Devam Ediyor' : exp.endDate}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Deneyim bilgisi bulunmuyor.</p>
              )}
            </div>

            {/* Education */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Eğitim
              </h3>
              {user.education && user.education.length > 0 ? (
                <div className="space-y-4">
                  {user.education.map((edu: EducationEntry) => (
                    <div key={edu.id} className="relative pl-4 border-l-2 border-emerald-100">
                      <div className="absolute w-2.5 h-2.5 bg-emerald-600 rounded-full -left-[6px] top-1.5 border border-white"></div>
                      <h4 className="font-semibold text-slate-900">{edu.school}</h4>
                      <p className="text-sm text-slate-700 font-medium mt-0.5">
                        {edu.degree}{edu.field ? ` - ${edu.field}` : ''}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {edu.startDate} - {edu.current ? 'Devam Ediyor' : edu.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Eğitim bilgisi bulunmuyor.</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Yetenekler</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
