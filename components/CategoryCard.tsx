import React from 'react';
import { CategoryCardProps } from '../types';

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, label, description, className = '' }) => {
  return (
    <div className={`
      group relative flex flex-col justify-center
      w-full h-full p-5 sm:p-6
      bg-white dark:bg-[#111]
      rounded-[2rem]
      border border-black/[0.04] dark:border-white/[0.06]
      shadow-[0_4px_24px_rgba(0,0,0,0.02)]
      transition-all duration-500 ease-out
      cursor-default
      overflow-hidden
      ${className}
    `}>
      
      {/* Subtle Background Decor - Static/Hidden */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-black/[0.02] to-transparent dark:from-white/[0.02] rounded-bl-full opacity-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between">
           <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] text-ink border border-black/[0.02] dark:border-white/[0.02] transition-transform duration-500 origin-top-left">
             {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 stroke-[1.5]" }) : icon}
           </div>
        </div>

        <div>
           <h3 className="font-sans text-lg font-medium text-ink tracking-tight mb-1">
            {label}
          </h3>
          <p className="text-sm text-subtle/80 leading-relaxed font-light pr-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;