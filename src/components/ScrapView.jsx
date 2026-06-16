import NewsCard from './NewsCard.jsx'

export default function ScrapView({ scraps, isScrapped, onToggleScrap }) {
  return (
    <div className="px-5 pb-16 pt-4 lg:px-8">
      {scraps.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <div className="mb-3 text-5xl">⭐</div>
          <p className="font-semibold text-slate-600">스크랩한 뉴스가 없습니다</p>
          <p className="mt-1 text-sm text-slate-400">
            뉴스 카드의 <span className="text-amber-400">☆</span> 를 눌러<br />고객에게 보낼 기사를 모아두세요.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">스크랩 {scraps.length}건 · 고객 공유용으로 모아둔 기사</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {scraps.map((item) => (
              <NewsCard key={item.link} item={item}
                scrapped={isScrapped(item.link)} onToggleScrap={onToggleScrap} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
