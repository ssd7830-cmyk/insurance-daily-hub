import NewsCard from './NewsCard.jsx'
import { CAT_META } from '../lib/ui.js'

export default function CategorySection({ category, items, isScrapped, onToggleScrap }) {
  if (!items?.length) return null
  const cat = CAT_META[category] || CAT_META['회사동향']
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-4 w-1.5 rounded-full ${cat.bar}`} />
        <h2 className="text-[15px] font-bold text-slate-800">{category}</h2>
        <span className="text-sm text-slate-400">{items.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.link} item={item}
            scrapped={isScrapped?.(item.link)} onToggleScrap={onToggleScrap} />
        ))}
      </div>
    </section>
  )
}
