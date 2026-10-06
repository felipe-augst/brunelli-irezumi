'use client'

import { useState } from 'react'
import { Sliders } from 'lucide-react'
import { CATEGORY_LABELS } from '@/data/product-labels'

type CategoryFilterProps = {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="mb-8 flex flex-col items-end gap-4">
      <button
        onClick={() => setIsFilterOpen((prev) => !prev)}
        className="text-on-surface hover:text-accent flex items-center gap-2 text-sm tracking-widest uppercase transition-colors"
      >
        <Sliders size={18} />
        Filtrar
      </button>

      {isFilterOpen && (
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onSelectCategory('TODOS')}
            className={`font-headline px-4 py-1.5 text-xs tracking-widest uppercase transition-colors ${
              selectedCategory === 'TODOS'
                ? 'text-accent border-accent animate-pulse border-b-2'
                : 'text-on-surface-variant hover:text-accent'
            }`}
          >
            Todos
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              className={`font-headline px-4 py-1.5 text-xs tracking-widest uppercase transition-colors ${
                selectedCategory === key
                  ? 'text-accent border-accent animate-pulse border-b-2'
                  : 'text-on-surface-variant hover:text-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
