# 보험설계사 데일리 뉴스 대시보드

서버리스/무DB. RSS 수집 → Claude Haiku 큐레이션 → 날짜별 정적 JSON → Vite+React 대시보드.

## 실행

```bash
npm install

# 1) 뉴스 수집 + 큐레이션 (오늘 날짜 JSON 생성)
#    ANTHROPIC_API_KEY 가 있으면 Haiku 요약, 없으면 휴리스틱 폴백
cp .env.example .env   # 후 ANTHROPIC_API_KEY 채우기
npm run collect

# 2) 대시보드 로컬 실행
npm run dev            # http://localhost:5173
```

## 구조

```
sources.json              # RSS 피드 목록(2026-06-16 실측 검증) + 보험 키워드
scripts/collect.js        # 수집→필터→dedup→36h→Haiku→public/data/*.json
public/data/
  ├─ YYYY-MM-DD.json      # 날짜별 스냅샷
  └─ latest.json          # 대시보드가 읽는 최신본
src/                      # React 대시보드 (모바일 퍼스트)
```

## 데이터 갱신
매일 `npm run collect` 실행(또는 cron/Vercel Cron). 생성된 `public/data/*.json` 을 커밋·배포.

## 저작권
기사 전문 복제 금지. summary 는 Haiku 가 100% 재서술하며 원문은 link 로만 연결.

## 배포 (Vercel)
```bash
npm i -g vercel
vercel        # 최초 1회 로그인 → 프로젝트 연결 → 고정 URL 발급
vercel --prod
```
