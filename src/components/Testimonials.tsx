import React from 'react';
import { USER_TESTIMONIALS } from '../data';
import { Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section className="bg-slate-50/30 py-16 sm:py-24 border-t border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Kariyerini Bizimle Değiştirenler
          </h2>
          <p className="mt-4 text-sm text-slate-500">
            Binlerce profesyonel ve iş veren, Kariyer Kapısı akıllı eşleştirme sistemiyle doğru eşleşmeyi buldu.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {USER_TESTIMONIALS.slice(0, 3).map((testimonial, idx) => (
            <div 
              key={idx} 
              className="flex flex-col justify-between rounded-3xl bg-white p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-150"
            >
              <div className="relative">
                <Quote className="absolute -top-3 -left-2 h-8 w-8 text-emerald-500/10" />
                <p className="text-slate-600 italic leading-relaxed text-sm relative z-10">
                  {testimonial.text}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-x-4 border-t border-slate-100 pt-6">
                <img 
                  className="h-9 w-9 rounded-lg bg-slate-50 object-cover ring-2 ring-slate-100" 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-xs text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
