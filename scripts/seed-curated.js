/**
 * seed-curated.js — Claude(Opus)가 82개 후보를 5축 기준으로 직접 큐레이션한 결과.
 * API 키 없이도 "진짜 필요한 뉴스"를 보여주기 위한 골든셋.
 * summary/why_matters 는 모두 재서술(원문 복제 없음). 원문은 link 로만 연결.
 * 키 확보 후엔 collect.js 가 같은 기준으로 자동 생성.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CATEGORIES = ['생명보험', '손해보험', '건강·실손', '세금·연금', '정책·법규', '회사동향']

const items = [
  {
    title: '7월 GA 확대 적용 앞둔 \'1200%룰\'… 중소 지사 부담에 대형화 가속',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91211',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '정책·법규', score: 95, tag: '1200%룰',
    summary: '계약 첫해 모집수수료를 월납보험료의 12배로 제한하는 1200%룰이 7월부터 GA에도 본격 적용된다. 그동안 보험사→GA 단계에 맞춰졌던 규제가 이제 GA가 소속 설계사에게 주는 수수료까지 직접 겨냥하면서, 운영 부담이 커진 중소 지사 대신 대형·직영 조직 중심으로 업계 재편이 빨라질 전망이다.',
    why_matters: '내 첫해 수수료 구조가 직접 바뀌는 규제 — 소속 GA의 수수료 정책과 정착지원 변화를 7월 전에 반드시 확인하세요.',
  },
  {
    title: '대법 "타사 설계사에 지급한 모집 수수료, 비용 처리 안 돼"… GA 세무 파장',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108815',
    source: '한국금융신문', published: '2026-06-14T21:42:00+09:00',
    category: '정책·법규', score: 92, tag: 'GA수수료',
    summary: 'GA가 다른 회사 소속 설계사에게 고객 소개 대가로 지급한 모집수수료는 법인세법상 비용으로 인정받을 수 없다는 대법원 확정 판결이 나왔다. 당국이 GA 모집질서 점검을 강화하는 가운데 사법부까지 엄격한 기준을 제시하면서, 교차모집·소개수수료 관행을 둔 대리점들의 세무 리스크가 커졌다.',
    why_matters: '소개·교차모집 수수료를 비용처리해 온 GA라면 세무 구조 점검이 시급 — 영업 방식 자체에 영향을 줄 수 있는 판례입니다.',
  },
  {
    title: '5세대 실손보험 출시·주택연금 개선… 새 정부 보험 국정과제 본격 시행',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91218',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '정책·법규', score: 93, tag: '5세대실손',
    summary: '정부 국정과제에 담긴 보험 정책들이 상품 출시와 제도 개선 단계로 순차 이행되고 있다. 보험권에서는 5세대 실손의료보험 출시와 주택연금 개선이 핵심으로 꼽히며, 포용금융 기조 아래 보장 사각지대를 메우는 방향의 제도 변화가 이어질 전망이다.',
    why_matters: '5세대 실손 전환은 거의 모든 고객의 관심사 — 기존 1~4세대 가입자에게 전환 유불리를 설명할 준비를 미리 해두세요.',
  },
  {
    title: '변액보험 수익률만 보고 중도해지… 금융당국 "장기 유지" 주의보',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91230',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '생명보험', score: 88, tag: '변액보험',
    summary: '증시 강세로 변액보험 관심이 커지면서 시장 중심이 단기 투자형에서 노후 대비형 변액연금으로 옮겨가고 있다. 1분기 변액연금 신계약은 전 분기 대비 16.8% 늘었으나, 일부 펀드의 단기 고수익만 보고 중도 해지 후 직접투자로 갈아타는 사례가 늘어 당국과 업계가 장기 유지 필요성을 강조하고 있다.',
    why_matters: '변액 고객의 "수익 났을 때 해지" 문의가 늘 시점 — 사업비·장기수익 구조를 근거로 유지 상담을 선제적으로 준비하세요.',
  },
  {
    title: '퇴직연금 적립금 500조 돌파… 은행에 밀린 보험사, 생존 가능할까',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91258',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '세금·연금', score: 85, tag: '퇴직연금',
    summary: '국내 퇴직연금 적립금이 500조원을 넘어섰고 최근 10년 연평균 14.8% 성장했지만, 업권별 격차가 뚜렷하다. 적립금은 은행 52%, 증권 26%, 보험 20.9% 순으로 보험권 비중과 성장세가 상대적으로 부진해 보험사의 시장 방어 전략이 과제로 떠올랐다.',
    why_matters: 'IRP·퇴직연금 상담 수요가 폭발하는 시장 — 보험권 연금의 강점(종신·안정성)을 은행·증권과 비교해 설명할 자료로 활용하세요.',
  },
  {
    title: '"불완전판매 민원, 소비자 보호인가 승환계약 통로인가" 제도 악용 논란',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108794',
    source: '한국금융신문', published: '2026-06-14T21:01:00+09:00',
    category: '정책·법규', score: 84, tag: '불완전판매',
    summary: '계약 후 3개월 내 민원을 제기하고 설계사가 인정하면 보험료가 환급되는 불완전판매 민원 제도가, 일부 현장에서 기존 계약을 깨고 갈아태우는 승환계약 수단으로 악용된다는 지적이 나온다. 약관 전달·청약서 사본 제공·중요사항 설명 등 \'3대 기본 지키기\' 위반이 불완전판매 인정의 핵심 요건이다.',
    why_matters: '3대 기본 지키기를 어기면 곧 민원·환급 리스크 — 청약 단계 증빙을 철저히 남겨 본인을 보호하세요.',
  },
  {
    title: '사칭 \'보험점검센터\' 활개… 보험사·GA가 출처 불명 고객DB 활용 논란',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91232',
    source: '보험신문', published: '2026-06-15T06:45:00+09:00',
    category: '정책·법규', score: 82, tag: '고객DB',
    summary: '\'보험점검센터\'·\'보험분석센터\'처럼 공식 기관을 연상시키는 명칭으로 보험료 할인·환급금 조회를 미끼 삼아 개인정보 동의를 유도한 뒤, 이를 보험사·GA 영업용 고객DB로 가공해 넘기는 사칭 영업이 문제가 되고 있다. 출처가 불분명한 DB를 실적 수단으로 활용·묵인한다는 지적도 제기됐다.',
    why_matters: '출처 불명 DB 사용은 개인정보보호법 위반 소지 — 받은 명단의 수집 경로를 확인하지 않으면 설계사 본인이 책임질 수 있습니다.',
  },
  {
    title: '경찰, 교통사고 보험사기 집중단속… 6월 15일~9월 30일',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108809',
    source: '한국금융신문', published: '2026-06-14T03:16:00+09:00',
    category: '손해보험', score: 83, tag: '보험사기',
    summary: '경찰이 6월 15일부터 9월 30일까지 3개월간 교통사고 보험사기를 집중 단속한다. 최근 4년간 1만2,902건을 적발해 6,261명을 검거했으며, 검거자 중 20~30대가 72%를 차지했다. 고의사고는 피해자에게 형사처벌·행정처분·보험료 인상의 삼중 피해를 준다.',
    why_matters: '자동차보험 고객에게 전할 시의성 있는 안전 안내 소재 — 고의사고 연루 시 불이익을 상담에서 자연스럽게 짚어주세요.',
  },
  {
    title: '진료 중인 환자 가입시켜 20억 편취… 보험설계사·환자 80여 명 송치',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108829',
    source: '한국금융신문', published: '2026-06-15T21:19:00+09:00',
    category: '정책·법규', score: 80, tag: '보험사기',
    summary: '치과 진료 중인 환자를 보험에 가입시킨 뒤 보험금으로 치료해 주겠다며 모집하고, 허위·과다 청구로 약 20억원을 챙긴 보험대리점 설계사와 환자 등 80여 명이 보험사기방지법 위반으로 검찰에 송치됐다. 치과 원장과 상담실장도 함께 입건됐다.',
    why_matters: '"보험으로 치료비 해결" 권유가 곧 사기 공모가 되는 사례 — 모집 화법의 위험 선을 다시 점검하는 경각심 소재입니다.',
  },
  {
    title: '역대급 폭염 예고에 \'기후보험\' 현실화 주목… 지선 공약으로도 부상',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108787',
    source: '한국금융신문', published: '2026-06-13T22:45:00+09:00',
    category: '손해보험', score: 80, tag: '기후보험',
    summary: '올여름 폭염·열대야 발생 가능성이 평년보다 높다는 전망과 함께, 기후 리스크에 대응하는 보험의 역할이 다시 주목받고 있다. 지방선거에서 \'기후보험\' 도입이 공약으로 제시되며 기존 풍수해·농작물재해보험을 넘는 새 정책보험 모델 가능성이 거론된다.',
    why_matters: '폭염·재난 이슈는 풍수해·재물보험 상담의 좋은 진입점 — 시기성 있는 보장 점검 권유에 활용하세요.',
  },
  {
    title: '펫보험 가입률 2%대… 성장 열쇠는 \'청구 간소화\'와 데이터',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108800',
    source: '한국금융신문', published: '2026-06-14T03:09:00+09:00',
    category: '손해보험', score: 78, tag: '펫보험',
    summary: '반려동물보험 보유계약이 지난해 말 약 25만건으로 1년 새 55% 늘고 원수보험료도 처음 1,000억원을 넘었다. MRI·항암·피부·구강질환은 물론 장례·위탁비까지 보장이 확대되는 가운데, 낮은 가입률을 끌어올릴 관건으로 청구 간소화와 데이터 활용이 꼽힌다.',
    why_matters: '가입률 2%의 미개척 시장 — 반려동물 키우는 고객에게 신규 제안할 수 있는 성장 카테고리입니다.',
  },
  {
    title: '교보생명 \'교보K-맞춤건강보험\'… 일반+간편심사 결합한 복합심사로 유병자 부담↓',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91268',
    source: '보험신문', published: '2026-06-15T02:08:00+09:00',
    category: '건강·실손', score: 80, tag: '유병자보험',
    summary: '교보생명이 업계 최초로 일반심사와 간편심사를 하나로 결합한 \'복합심사\' 건강보험을 내놨다. 기존 유병자보험은 모든 보장을 간편심사 기준으로 일괄 할증해야 했지만, 이 상품은 질환과 무관한 영역의 불필요한 할증을 없애 보험료 부담을 낮춘 것이 특징이다.',
    why_matters: '유병자 고객에게 제시할 새 선택지 — 기존 간편심사 대비 보험료를 낮출 수 있는지 비교 설명에 바로 쓰세요.',
  },
  {
    title: '순환계질환 보장, \'진단비\' 넘어 \'통합치료비\'로 진화',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91241',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '건강·실손', score: 78, tag: '치료비보장',
    summary: '뇌혈관·허혈성심장질환 보장이 진단 시 정액을 주는 진단비에서, 실제 치료 과정을 보장하는 주요치료비를 거쳐 검사·약물·재활까지 아우르는 통합치료비로 빠르게 재편되고 있다. 심장질환은 국내 사망원인 2위, 뇌혈관질환은 4위로 보장 수요가 높다.',
    why_matters: '진단비 위주로 가입한 고객의 보장 공백을 짚는 리모델링 포인트 — 치료비 중심 보강을 제안할 근거가 됩니다.',
  },
  {
    title: '신의료기술 시대… AI·유전자·정밀의료가 바꾸는 보험산업 판도',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91238',
    source: '보험신문', published: '2026-06-15T07:01:00+09:00',
    category: '건강·실손', score: 76, tag: '의료혁신',
    summary: '보험연구원은 AI 영상분석, 액체생검, 유전자 치료, GLP-1 비만치료제 같은 의료 혁신이 보험상품 구조와 위험관리를 근본적으로 바꿀 것으로 전망했다. 조기 진단·치료는 소비자에게 혜택이지만, 보험사에는 상품 재설계 과제를 안긴다.',
    why_matters: '향후 건강보험 상품 트렌드의 큰 그림 — 고객에게 "왜 지금 보장을 점검해야 하는지" 설명하는 거시 배경으로 활용하세요.',
  },
  {
    title: '경증 한방 첩약 건강보험 적용 확대… 급여비 추계 1.6배 초과',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91239',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '건강·실손', score: 72, tag: '실손',
    summary: '한방 첩약 건강보험 적용 2단계 시범사업의 급여비 지급액이 1,913억원으로 정부 추계(1,188억원)의 약 1.6배에 달한 것으로 나타났다. 보장성 확대 속도에 맞춰 관리·감독 체계 정비가 필요하다는 지적이 제기된다.',
    why_matters: '실손 보장 범위와 보험료에 영향을 줄 수 있는 정책 흐름 — 한방 치료 관심 고객 상담 시 참고하세요.',
  },
  {
    title: 'DB손보, 업계 최초 \'블랙박스 영상 AI 과실판정\' 개시… 평균 5초·정확도 92%',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91291',
    source: '보험신문', published: '2026-06-16T00:46:00+09:00',
    category: '손해보험', score: 74, tag: '자동차보험',
    summary: 'DB손해보험이 사고 접수 시 블랙박스 영상을 올리면 AI가 자동 분석해 평균 5초 내 과실 결과를 안내하는 시스템을 업계 최초로 열었다. 20개월간 약 7만 건을 학습해 과실분석 정확도를 평균 92.4%까지 끌어올렸다.',
    why_matters: '자동차보험 고객이 체감할 서비스 차별점 — 사고처리 편의성을 설명하는 상담 소재로 좋습니다.',
  },
  {
    title: '요양사업 키우는 생보사… \'보험 본업 연계\'는 아직 시험대',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108826',
    source: '한국금융신문', published: '2026-06-15T21:14:00+09:00',
    category: '생명보험', score: 74, tag: '요양·시니어',
    summary: '생명보험사들이 고령화에 대응해 요양사업을 확대하고 있지만, 요양서비스와 연금·간병·치매보험 등 본업을 잇는 연계 모델은 아직 초기 단계다. 단기 수익보다 고령 고객 접점 확보와 미래 성장기반 차원의 투자로 평가된다.',
    why_matters: '시니어 고객에게 \'보장+요양\' 패키지로 접근하는 트렌드 — 간병·치매보험 상담의 확장 맥락으로 쓰세요.',
  },
  {
    title: '보험사 M&A 시장 재가동… KDB생명·예별손보에 인수 후보 \'관심\'',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91234',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '회사동향', score: 70, tag: 'M&A',
    summary: '수차례 매각이 무산됐던 KDB생명과 예별손해보험에 금융사·보험사들이 잇따라 관심을 보이며 보험사 인수·합병 시장이 다시 움직이고 있다. 매도측 자본지원 가능성과 보험업 라이선스 확보 수요가 맞물려 검토 강도가 높아지는 모습이다.',
    why_matters: '고객사 인수설은 계약 유지 문의로 이어질 수 있음 — 매각 진행 상황을 알아두면 불안 문의에 안정적으로 답할 수 있습니다.',
  },
  {
    title: '[칼럼] 퇴직해야 보이는 국민연금의 힘',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91196',
    source: '보험신문', published: '2026-06-14T15:00:00+09:00',
    category: '세금·연금', score: 70, tag: '국민연금',
    summary: '월 100만원 이상 국민연금 수급자는 전체의 14.7%, 월 200만원 이상은 1.5%에 불과하다(2026년 1월 기준). 국민연금만으로 노후를 책임지기 어렵다는 현실을 짚으며, 퇴직 후에야 체감하는 공적연금의 한계와 의미를 다룬 칼럼이다.',
    why_matters: '국민연금의 빈틈을 사적연금으로 메우는 상담 화법에 그대로 쓸 수 있는 수치 — 노후설계 제안의 도입부로 활용하세요.',
  },
  {
    title: '동양생명 \'종합병원이상암통합치료비특약\'… 암 치료 여정 전반 보장',
    link: 'https://www.insnews.co.kr/news/articleView.html?idxno=91296',
    source: '보험신문', published: '2026-06-16T01:34:00+09:00',
    category: '건강·실손', score: 70, tag: '암보험',
    summary: '동양생명이 암 진단 이후 검사부터 주요 치료, 후속 치료까지 단계별 의료비를 보장하는 통합치료비 특약을 출시했다. 2023년 신규 암환자가 28만8,613명으로 늘고 5년 상대생존율이 73.7%에 이르는 등 진단 이후 장기 치료비 대비 수요가 커진 점을 반영했다.',
    why_matters: '생존율 상승으로 \'진단 후 치료비\' 보장 니즈가 큰 시점 — 암 보장 리모델링 제안의 신상품 옵션입니다.',
  },
  {
    title: '망분리 규제 완화 신호탄… 보험사 AI 활용 확대 기대',
    link: 'http://www.fins.co.kr/news/articleView.html?idxno=108798',
    source: '한국금융신문', published: '2026-06-14T21:01:00+09:00',
    category: '회사동향', score: 68, tag: 'AI·디지털',
    summary: '금융당국이 외부망·내부망을 엄격히 가르던 망분리 규제 완화에 나서면서, 그동안 제약을 받던 보험사의 생성형 AI·클라우드 활용 기대가 커지고 있다. 인수심사·고객상담 등 핵심 업무로 AI 적용이 확산될 전망이다.',
    why_matters: '향후 청약·심사·상담 업무가 AI로 빨라질 흐름 — 설계사 업무환경 변화를 미리 가늠해 두세요.',
  },
].map((it) => ({ ...it, origin: '국내' }))

// ── 해외 뉴스 (Claude가 영문 원문을 한국어로 번역·재서술) ──
const overseas = [
  {
    title: 'Liberty·ICEYE, 위성데이터 기반 \'파라메트릭 산불보험\' 출시',
    link: 'https://www.artemis.bm/news/liberty-teams-with-iceye-to-launch-new-parametric-wildfire-insurance-solution/',
    source: 'Artemis', published: '2026-06-15T09:30:00+00:00',
    category: '손해보험', score: 74, tag: '파라메트릭',
    summary: 'Liberty와 위성데이터 기업 ICEYE가 손잡고 위성으로 산불 피해를 측정해 자동 보상하는 파라메트릭(지수형) 산불보험을 선보였다. 손해사정 없이 사전에 정한 조건이 충족되면 곧바로 보험금을 지급하는 방식으로, 기후 재해 보장의 새 모델로 주목된다.',
    why_matters: '국내 기후보험 논의와 직결되는 해외 사례 — 지수형 보험이 어떻게 작동하는지 고객 설명 소재로 쓰세요.',
  },
  {
    title: '세계은행, 4억 달러 모로코 기후·재해 프로그램에 \'재해채권\' 검토',
    link: 'https://www.artemis.bm/news/world-bank-cat-bond-on-the-table-in-new-400m-morocco-climate-risk-finance-program/',
    source: 'Artemis', published: '2026-06-15T08:00:00+00:00',
    category: '손해보험', score: 68, tag: '재해채권',
    summary: '세계은행이 모로코의 기후·지진·재해 대응력을 높이기 위한 4억 달러 규모 프로그램을 승인하고, 위험을 자본시장에 넘기는 재해채권(캣본드) 발행을 검토하고 있다. 국가 차원에서 재난 리스크를 보험·자본시장으로 분산하는 흐름을 보여준다.',
    why_matters: '재난 리스크를 보험으로 흡수하는 글로벌 트렌드 — 정책보험·기후보험의 큰 그림을 이해하는 배경.',
  },
  {
    title: 'AM Best "데이터센터 붐, 美 손해보험에 새 보장 기회"',
    link: 'https://www.reinsurancene.ws/data-centre-boom-opens-considerable-opportunity-for-us-pc-insurers-am-best/',
    source: 'Reinsurance News', published: '2026-06-15T15:00:00+00:00',
    category: '손해보험', score: 66, tag: '신종리스크',
    summary: '신용평가사 AM Best는 급증하는 데이터센터 프로젝트가 미국 손해보험(P&C) 업계에 새로운 재물·배상책임 보장 상품을 개발할 상당한 기회를 준다고 분석했다. AI 인프라 확산이 보험 수요의 새 영역을 만들고 있다는 진단이다.',
    why_matters: 'AI·디지털 인프라가 만드는 신종 보험시장 — 기업·법인 영업의 미래 먹거리 힌트.',
  },
  {
    title: 'Sixfold, 보험 인수심사 돕는 \'AI 언더라이터\' 출시',
    link: 'https://www.reinsurancene.ws/sixfold-introduces-ai-underwriter-to-support-insurance-underwriting-decisions/',
    source: 'Reinsurance News', published: '2026-06-15T14:30:00+00:00',
    category: '회사동향', score: 66, tag: 'AI언더라이팅',
    summary: '보험업 특화 AI 기업 Sixfold가 인수심사 분석과 위험평가, 의사결정을 보조하는 AI 언더라이터 플랫폼을 내놨다. 해외에서는 언더라이팅 자동화가 빠르게 확산 중이어서, 국내 망분리 완화 흐름과 맞물려 주목된다.',
    why_matters: '심사·청약 자동화의 해외 선행 사례 — 설계사 업무가 어떻게 빨라질지 가늠하는 참고.',
  },
  {
    title: '"예측 더 어려워진 리스크"… 글로벌 보험사, 속도와 정확도 사이 고심',
    link: 'https://www.insurancejournal.com/news/national/2026/06/16/873785.htm',
    source: 'Insurance Journal', published: '2026-06-16T05:16:00+00:00',
    category: '회사동향', score: 62, tag: '리스크관리',
    summary: '글로벌 보험 리더들은 오늘날의 위험 환경이 그 어느 때보다 예측하기 어려워지고 있다고 진단한다. 이에 보험사들은 속도와 효율을 잃지 않으면서도 위험을 평가하고 올바른 결정을 내리는 방식을 다시 짜고 있다.',
    why_matters: '불확실성 시대 보험의 방향성을 읽는 거시 트렌드 참고.',
  },
  {
    title: 'Stone Point, 신규 \'보험 솔루션 펀드\' 1차로 6.1억 달러 모집',
    link: 'https://www.artemis.bm/news/stone-point-raises-610-5m-in-first-close-of-new-insurance-solutions-fund/',
    source: 'Artemis', published: '2026-06-15T13:00:00+00:00',
    category: '회사동향', score: 60, tag: '사모자본',
    summary: '보험·재보험 전문 사모펀드 운용사 Stone Point Capital이 새 보험 솔루션 펀드의 1차 클로징으로 6억1,050만 달러를 모았다. 사모자본의 보험시장 진입이 빨라지는 흐름으로, 국내 보험사 자산운용 구조 변화 논의와도 연결된다.',
    why_matters: '미국 보험사 \'사모펀드化\' 흐름의 연장선 — 업계 자본 트렌드 이해.',
  },
].map((it) => ({ ...it, origin: '해외' }))

const allItems = [...items, ...overseas]

// ── 빌드 ───────────────────────────────────────────────────
function kstDateStr(iso) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
}

const methodology = {
  window_hours: 72,
  threshold: 45,
  pipeline: [
    { step: '1. 수집', desc: 'RSS 매체(국내 4·해외 3)에서 최근 72시간 기사를 모음' },
    { step: '2. 1차 필터', desc: '제목·본문에 보험 키워드(실손·연금·설계사·GA·금감원 등)가 있는 기사만 통과' },
    { step: '3. 중복 제거', desc: '제목·링크 정규화로 중복 제거 + 같은 사건을 여러 매체가 보도하면 1건으로 합침' },
    { step: '4. 5축 채점', desc: '아래 5개 축으로 0~100점 채점' },
    { step: '5. 컷', desc: '45점 미만 + 홍보성 기사 제외' },
    { step: '6. 요약', desc: 'AI가 원문을 100% 재서술해 요약 + 상담 포인트 작성(해외는 번역 포함)' },
  ],
  axes: [
    { key: '업무 관련성', weight: 30, desc: '설계사 영업·상품·고객과 직접 관련되는가' },
    { key: '영업 활용도', weight: 25, desc: '고객 상담에 바로 쓸 멘트가 나오는가' },
    { key: '시의성', weight: 20, desc: '정책·제도·마감 등 지금 알아야 할 변화인가' },
    { key: '영향 범위', weight: 15, desc: '다수 고객·업계 전체에 영향을 주는가' },
    { key: '신뢰·밀도', weight: 10, desc: '사실 기반이고 정보가 충실한가' },
  ],
  cut_rules: ['MOU·업무협약', '봉사활동·기부·플로깅', '임원 인사·세미나·시상식', '광고성·기사형 광고', '부고·인사동정', '주가/실적 단순 수치'],
  copyright: '기사 전문 복제 금지. 요약은 AI가 100% 재서술하며(해외 기사는 번역 포함), 정확한 내용은 원문 링크에서 확인합니다.',
}

const sources = [
  { id: 'insnews', name: '보험신문', type: '국내·보험전문' },
  { id: 'fins', name: '한국금융신문', type: '국내·금융전문' },
  { id: 'yna-econ', name: '연합뉴스 경제', type: '국내·경제' },
  { id: 'hankyung-finance', name: '한국경제 금융', type: '국내·금융' },
  { id: 'artemis', name: 'Artemis', type: '해외·재해/ILS' },
  { id: 'reinsurancenews', name: 'Reinsurance News', type: '해외·재보험' },
  { id: 'insurancejournal', name: 'Insurance Journal', type: '해외·종합' },
]

const dataDir = resolve(ROOT, 'public/data')
mkdirSync(dataDir, { recursive: true })

// 날짜별 다이제스트: 해당 날짜(KST) 이전에 발행된 기사를 모음 → 날짜 변경 시연 가능
const DATES = ['2026-06-15', '2026-06-16']
const allCurated = allItems.map((it) => ({ ...it, curated: true }))

function buildDigest(date) {
  const sorted = allCurated
    .filter((it) => kstDateStr(it.published) <= date)
    .sort((a, b) => b.score - a.score)
  return { date, items: sorted }
}

const idxDates = []
for (const date of DATES) {
  const { items: sorted } = buildDigest(date)
  const byCat = {}
  for (const c of CATEGORIES) byCat[c] = []
  for (const it of sorted) byCat[it.category].push(it)
  const counts = {
    국내: sorted.filter((i) => i.origin === '국내').length,
    해외: sorted.filter((i) => i.origin === '해외').length,
  }
  const out = {
    date,
    generated_at: `${date}T15:00:00+09:00`,
    count: sorted.length,
    origin_counts: counts,
    categories: CATEGORIES,
    sources,
    methodology,
    stats: { collected: 88, filtered: 60, cut_promo: 60 - sorted.length, published: sorted.length },
    by_category: byCat,
    items: sorted,
  }
  writeFileSync(resolve(dataDir, `${date}.json`), JSON.stringify(out, null, 2))
  idxDates.push(date)
  console.log(`✅ ${date}: ${sorted.length}건 (국내 ${counts.국내} · 해외 ${counts.해외})`)
}

// latest.json = 가장 최근 날짜 복사
const latestDate = DATES[DATES.length - 1]
const latestJson = readFileSync(resolve(dataDir, `${latestDate}.json`), 'utf-8')
writeFileSync(resolve(dataDir, 'latest.json'), latestJson)

// index.json (날짜 네비게이션용)
idxDates.sort()
writeFileSync(resolve(dataDir, 'index.json'), JSON.stringify({ dates: idxDates }, null, 2))

console.log(`\n📅 날짜 ${idxDates.length}개 · latest=${latestDate}`)
