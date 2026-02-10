import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CategoryToggleProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CategoryToggle: React.FC<CategoryToggleProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <div className="flex justify-center w-full mb-6">
      <div className="
        relative flex w-full max-w-lg items-center p-1.5 gap-1
        bg-black/[0.02] dark:bg-white/[0.04]
        rounded-full border border-black/[0.04] dark:border-white/[0.04]
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]
      ">
        {categories.map((cat) => {
            const isSelected = selectedId === cat.id;
            return (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`
                        relative z-10 flex-1 flex flex-col items-center justify-center 
                        py-2 rounded-full transition-all duration-300 select-none cursor-pointer group
                        ${isSelected ? 'text-ink' : 'text-subtle/50 hover:text-subtle/80'}
                    `}
                >
                    {isSelected && (
                        <motion.div
                            layoutId="toggle-pill"
                            className="absolute inset-0 bg-white dark:bg-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] rounded-full border border-black/[0.04] dark:border-white/[0.05]"
                            initial={false}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                    )}
                    
                    <div className="relative z-20 mb-1 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                        <cat.icon className={`w-5 h-5 ${isSelected ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                    </div>
                    
                    <span className={`relative z-20 text-xs font-medium tracking-wide leading-none transition-all duration-300 ${isSelected ? 'opacity-100 font-semibold' : 'opacity-70'}`}>
                        {cat.label}
                    </span>
                </button>
            )
        })}
      </div>
    </div>
  );
};

export default CategoryToggle;