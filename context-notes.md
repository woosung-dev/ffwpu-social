<!-- 작업 중 내려진 결정의 *왜*를 시간 순으로 누적 기록. append-only -->

# Context Notes

작업 중 내려진 결정의 *왜*를 기록한다. **append-only** — 기존 내용은 수정하지 않고 새 내용만 추가한다. 큰 의사결정은 별도로 `docs/decisions.md`에 ADR 형식으로도 남긴다.

---

## 2026-05-26 — 프로젝트 문서 골격 셋업

- **결정**: 코드 작성 전, 문서 골격(루트 4파일 + `docs/` 4파일 + `docs/source/`)을 먼저 세움.
- **왜**: 사회공헌국 요청사항이 회차별로 변동되어 왔고, Figma는 완성도가 높음. *Figma + `docs/current.md`*를 단일 진실 공급원으로 운용하지 않으면 옛 요청이 코드에 잘못 반영될 위험이 큼.

- **결정**: `docs/source/`는 받은 원본 그대로 보존, 절대 수정하지 않음. 코드 결정의 근거로 쓰지 않음.
- **왜**: 원본의 진본성 유지가 *왜 그렇게 됐는지* 추적의 핵심. 가공/요약은 `docs/current.md`로만 한다.

- **결정**: ADR은 폴더 분산 대신 `docs/decisions.md` 한 파일에 시간 순 누적.
- **왜**: 프로젝트 규모가 크지 않고, 한 파일이 검색·일별 추적에 더 빠름.

- **TBD로 미룬 것들**: 기술 스택, 호스팅, 다국어, 데드라인, 도메인 보유 여부, 이용약관 담당. → `docs/current.md` TBD 섹션 + `checklist.md` Phase 3에서 사회공헌국 확답 받기.

---

## 2026-05-26 (저녁) — 자료 3건 수령 후 큰 재해석

`docs/source/`에 3건 추가됨: 기획안 v5(2026-03-18), 의도서 v1(2026-04-14), 사회공헌단 BI PPT(2026-04-22). 의도서를 읽고 *프로젝트 성격에 대한 기존 가정이 크게 틀렸음*을 확인.

- **결정**: 이전 가정("정적 + 일부 동적 + 간단 문의 폼") 폐기. 실제로는 **풀 CMS·KPI 시계열·동의 워크플로우가 있는 중규모 시스템**. `docs/current.md`와 `docs/tech.md`를 그에 맞게 재작성. ADR-002~004 추가.
- **왜**: 의도서 §7.6에 "콘텐츠·KPI 업데이트가 개발자 개입 없이 가능"이 *필수*로 명시됨. 단순 어드민이 아니라 운영 자율성이 1급 요구다.

- **결정**: 데드라인을 TBD로 분리하고 사회공헌국과 재합의 항목으로 명시.
- **왜**: 원안 데드라인(2026-04~5월, 사회공헌단 출범식 연계)이 이미 도과. 현실적인 일정 재합의 필요.

- **결정**: BI(Sow Good — 보라/오랜지)를 `docs/design.md`에 별도 섹션으로 분리.
- **왜**: BI 시안 작업이 기획안과 별개 트랙으로 진행됨. 사이트 디자인 토큰의 출발점이지만, 시안 A/B 최종 확정이 아직 안 됨.

- **결정**: 정치 중립·포교 금지·개인정보 보호를 ADR-004로 격상.
- **왜**: 의도서 §7에서 "반드시 지켜야 함(필수)"로 명시. 자동 검출이 어려운 정성적 리스크이므로 PR 점검·런칭 전 카피 검수가 운영 절차로 들어가야 함.

- **신규 인사이트**: 의도서 §8.3에 "연동 페이지 형태 — 협회 디지털 생태계의 일부"가 시사됨. 독립 사이트일지 협회 통합 페이지일지 사회공헌국과 명시 확인 필요(TBD).

---

## 2026-05-26 (밤) — Figma MCP 연결 후 캔버스 실측

Figma MCP 인증 완료(`fornerdsofficial@gmail.com`, Pro). `get_metadata` + `get_variable_defs` + 사용자 스크린샷으로 캔버스 실제 상태 확인.

- **결정**: 의도서 7개 페이지 정의는 *희망 사항*에 가깝고, **Figma 실제 가용은 2개**(홈, 소식)뿐임을 ADR-005로 확정. 의도서와 Figma 갭은 Figma 우선.
- **왜**: 의도서를 근거로 5개 미디자인 페이지를 추측 구현하면 ADR-004의 *카피·디자인 추측 금지* 원칙과 충돌. SSOT 일관성 유지.

- **결정**: `docs/current.md`·`docs/design.md`에 "디자인 상태" 컬럼 도입.
- **왜**: 의도서 정의와 Figma 가용의 갭을 *항상 가시화*해야 협업자가 잘못된 가정으로 코딩하지 않는다.

- **신규 발견**: Figma Variables가 3개만 정의되어 있음 — `KeyColor=#501F7E`(보라/친근감·신뢰), `KeyColor2=#F4B600`(오렌지/따뜻함), `Miscellaneous/Sidebar Fill - Selected=#FFFFFF`. BI 가이드와 일치. 본문/배경/그레이 스케일은 *아직 변수화되지 않음* — 화면별 추출 시 인라인 값을 토큰으로 승격 필요.

- **신규 발견**: 캔버스에 시안1/2/3/4, Gradation-1/2, Green-1/2, Purple-1/2/3 등 *작업 흔적 시안*이 다수 남아있음. 사용자가 공유한 노드 `96:7689`(시안4)가 메인 후보이지만, 홈 시안 2안 공존 상태이며 최종 미확정. 사용자가 Figma 재확인 후 회신 예정.

- **신규 발견**: Figma 페이지 이름은 "소식"이고 의도서는 "임팩트 스토리"임 — 같은 대상이지만 어휘가 다름. 코드의 라우트는 `/stories`로 가되, UI 카피는 *Figma에 따라* "소식"으로 표시할지 사용자/사회공헌국에 확인 필요.

---

## 2026-05-26 (밤·2차) — 컴포넌트 5개 추출 + 의도서 IA 완전 폐기

Figma MCP로 컴포넌트 5개(Header, Menu, StoryCard, ArticleCard, Heart) 추출 + Header에서 메뉴 4개가 의도서와 *완전히 다른 IA*임을 확인.

- **결정**: ADR-006 신설 — 의도서 §5 콘텐츠 구조는 폐기, Figma 헤더 4메뉴를 IA 진실로 삼는다. 사용자 명시 확인: "의도서 무관하게 Figma가 완전히 새롭게 설계된 것".
- **왜**: ADR-000(Figma SSOT)의 일관 적용. 의도서를 IA 결정 근거로 쓰면 옛 비전을 코드로 끌어들이게 됨.

- **유지**: 의도서 §6 톤앤매너 + §7 절대 제약(정치 중립/포교 금지/개인정보/운영 자율성)은 IA와 무관한 운영 원칙이므로 그대로 유효.

- **신규 발견**: 사이트가 *"쌀 나눔" 캠페인 중심*으로 설계됨. ArticleCard 카테고리 태그(`쌀나눔`/`보도자료`)와 메뉴 "쌀 나눔 소식"/"쌀나눔 프로젝트"로 확정.

- **신규 발견**: 좋아요(Heart) 카운터가 *익명 +1* 패턴 — 로그인 없는 익명 카운트. 어뷰징 방지 정책 TBD.

- **신규 발견**: 검색 아이콘은 있으나 검색 결과 UI 시안 없음. 검색 대상도 TBD.

- **신규 발견**: 의도서가 가정한 파트너십 문의/참여 폼이 Figma에 *없음*. 사이트에 폼이 있어야 하는지 사회공헌국 확인 필요.

- **신규 발견**: 메뉴 "쌀 나눔 소식"이 ArticleCard의 두 카테고리(`쌀나눔`·`보도자료`)를 모두 보여주는 *통합 게시판*일 가능성 — 추가 추출(랜딩/상세 시안)로 확인.

---

## 2026-05-26 (밤·3차) — 랜딩·소식 9개 섹션 design_context 추출

랜딩 5개 섹션(HeroBanner·KpiSection·StorySection·ArticleGrid·Section5/Partners) + 공통 Footer + 소식 페이지 3개 보조 요소(Banner·FeaturedStoryCard 캐러셀·ScrollTopButton) 총 9개 design_context 추출. design.md에 종합 정리.

- **큰 발견 1**: 의도서 "파트너 스토리" = *별도 페이지 아님*. 랜딩 마지막 섹션("함께하고 있는 파트너")으로 통합됨. 별도 페이지가 아니라 *섹션*으로 격하됨.
- **큰 발견 2**: KpiSection의 KPI 4개가 Figma 정답. 의도서 KPI 5개(봉사 횟수·참여 인원·권역별·예산·상담)는 폐기. 실제: 누적 봉사자 수, 누적 봉사 기간, 봉사활동 횟수, 도움을 주게 된 가정 수.
- **큰 발견 3**: HeroBanner 헤더에 인터랙션 어노테이션 — *"스크롤 위치에 따라 탭이 이동하는 인터렉션"*. 사용자가 처음에 언급한 "메인 페이지에 일부 인터랙션 적용"이 이것 (스크롤스파이 패턴).
- **큰 발견 4**: FeaturedStoryCard는 *단일 카드가 아닌 4슬라이드 캐러셀*. 인디케이터 4개 확인. 자동/수동 슬라이드 정책 TBD.
- **큰 발견 5**: ArticleGrid는 *마조네리(Masonry) 3열 그리드* — 6개 카드 다양한 높이. 좌측 다크 헤더 블록 + 우측 마조네리.
- **큰 발견 6**: 폰트는 **SUIT 6 weight**(Heavy/ExtraBold/Bold/SemiBold/Medium/Regular) + **Gmarket Sans Medium**(히어로 슬로건 60px 전용).
- **큰 발견 7**: 메뉴 "임팩트 데이터" / "활동 스토리"가 *별도 페이지인지, 랜딩 섹션의 확장인지* 미확정. 랜딩에 이미 KpiSection·ArticleGrid가 있어서 메뉴 클릭 시 별도 페이지 vs 같은 페이지 앵커 스크롤 결정 TBD.

- **결정**: 1440 폭만 추출. 1025~1439 / 768~1024 / 375~767 작은 사이즈는 미수령 상태. docs 상단에 명시.

---

## 2026-05-26 (밤·4차) — 소식 목록 Wrap 추출

`125:9124` (소식 "더 많은 소식" 영역) 추출. CategoryTabs + 9 카드 그리드 + Pagination.

- **큰 발견 1 — 카테고리 5개 확정**: `전체` / `가족 치유` / `지역 봉사` / `환경 캠페인` / `쌀 나눔`. ADR-006으로 의도서 IA 폐기했지만, **의도서 §5.2의 3 카테고리(가족 치유/지역 봉사/환경 캠페인)는 카테고리 enum으로 살아있다**. 즉 *페이지 구조는 폐기, 콘텐츠 분류 체계는 유산이 살아있음*.
- **큰 발견 2 — 새 폰트 Pretendard**: 페이지네이션 번호에 Pretendard Medium/Regular 사용. SUIT와 혼용. 의도된 혼용인지 확인 필요(TBD).
- **큰 발견 3**: ArticleCard None 상태에서 보였던 "보도자료" 텍스트는 *별도 카테고리가 아니라 이미지 없음 placeholder*. 카테고리 enum은 위 5개로 확정.
- **소식 페이지 데이터 모델 보강**: 카테고리는 5-값 enum.

---

## 2026-05-26 (밤·5차) — 소식 상세 Contents 추출 + 1~3순위 완료

`93:8813` (소식 상세 본문 + 공유 + 관련 글) 추출. 1~3순위 11개 노드 모두 완료.

- **TBD 해결 — 소셜 공유 채널 3개 확정**: 카카오톡 / 페이스북 / 링크 복사.
- **새 컴포넌트 — Tag (해시태그)**: 본문 게시글 분류용. Default(`#AC86D0`)/Hover(`#9E6FCB`) variants. 카테고리(`#B35FEB` 칩)와 *별개*. 데이터 모델에서 분리 필요.
- **신규 발견 — `알려드립니다` 라벨**: 관련 글 카드에 보임. 카테고리 5개(전체/가족치유/지역봉사/환경캠페인/쌀나눔)에 없는 라벨 → 6번째 카테고리인지, 별도 badge 필드인지 TBD.
- **새 Figma 변수 `text/text = #3E404E`**: 본문 텍스트 토큰 발견. KeyColor/KeyColor2/Sidebar Fill 3개에 추가로 *변수화된 토큰이 더 있음*. 향후 추가 변수 발견 시 갱신.
- **컴포넌트 ID 분리**: 상세 페이지 관련 글 카드(`464:3046`)는 메인 ArticleCard(`114:8164`)와 다른 컴포넌트 ID. 같은 패턴이지만 별도 분기인지 확인 필요.
- **추출 완료 — 1~3순위 11/11**: 컴포넌트 5개 + 랜딩 5섹션 + 소식 페이지 공통/목록/상세 3컨테이너. 마조네리·캐러셀·인터랙션 어노테이션 등 핵심 패턴 모두 식별됨.

---

## 2026-05-26 (밤·6차) — 반응형 BP별 시안 10개 수령·시각 메모

랜딩 6 노드(BP×2) + 소식 목록 4 노드 = 총 10 노드의 작은 사이즈 시안 수령. 스크린샷+시각 확인으로 1440과의 *컴포지션 변화*만 메모(전체 design_context 안 받음, 토큰 절약).

- **핵심 반응형 패턴 7가지**:
  1. 헤더 햄버거 전환 — 1025↑ 4메뉴 노출, 1024↓ 햄버거+단일 메뉴 칩
  2. 그리드 열 수 — 마조네리 3→2→1, KPI 4→2x2→2 세로
  3. 2단 → 세로 스택 — StorySection, HeroBanner, FeaturedCard
  4. Result 통계 가로→세로
  5. ArticleGrid 좌측 다크 블록은 모바일에서 *상단 헤딩만*으로 변환
  6. CategoryTabs 가로 스크롤 (모바일)
  7. 검색은 모든 BP에서 유지

- **결정**: 디자이너가 각 BP 범위의 *양 끝 두 폭*(예: 1025와 1439)을 따로 그린 건 *BP 사이 보간 가이드*. 그리드 열 수 전환 BP는 디자인된 두 폭 중 작은쪽에서 큰쪽으로 가는 지점에서 발생.
- **새 토큰 추가 없음** — 컬러/폰트/라운드는 1440 디자인 시스템 유지. 변화는 *레이아웃/그리드/스택*만.
- **컴포넌트 단위에서**: Header는 이미 design_context로 4 BP variants(`97:9431`) 추출 완료. ArticleCard size 1~4도 BP별 사용처 추측 가능 (큰 화면 size=1·2 / 작은 화면 size=3·4).

---

## 2026-05-26 (밤·7차) — 더미 텍스트 처리 원칙 격상 (ADR-007)

사용자 지적: "Figma 카테고리 탭에 '알려드립니다'가 없으면, 실제 데이터 모델에서도 없는 것."

- **결정**: ADR-007 신설. *Figma의 정의된 enum에 없는 라벨은 디자이너 더미로 간주하고 데이터 모델에 도입하지 않는다*.
- **왜**: ADR-000(Figma SSOT)·ADR-006(Figma IA 정답)의 적용 범위를 *데이터 필드 수준*까지 확장. 시안의 더미 텍스트에 끌려가 모델이 부풀려지는 것을 차단.
- **적용 결과**: 카테고리 enum 5개 고정 — `전체` / `가족 치유` / `지역 봉사` / `환경 캠페인` / `쌀 나눔`. ArticleCard·RelatedArticleCard에 표시되는 모든 라벨은 이 5개 중 하나만 됨. 별도 badge/label/secondary tag 필드 만들지 않음.
- **같은 원칙으로 향후 처리**: 시안에 보이는 더미 텍스트("보도자료" 같은 것)도 *enum에 명시되어 있지 않으면* 무시. 디자이너가 enum 추가 → 그제서야 데이터 모델에 반영.

---

## 2026-05-26 (밤·8차) — 사용자 답변 14건 확정 + ADR 6건 신설

사용자가 TBD 19건 중 14건 확정 답변. 4건 추가 확인 필요, 1건(11. 호스팅) 답변 누락.

- **데드라인 2026-05-31** (5일 남음) — **Critical**. 1차 런칭 범위 축소 필요. ADR-011 신설.
- **ADR-008**: 폰트 SUIT 단일. 페이지네이션의 Pretendard는 디자인 실수.
- **ADR-009**: 헤더 메뉴 인터랙션. 랜딩 = 스크롤스파이/앵커. 다른 페이지 = 활동 스토리 active 고정. *4 메뉴가 각 섹션의 앵커임이 명확해짐* — 미디자인 3 페이지 부담 사실상 해소(메뉴=섹션 앵커).
- **ADR-010**: 익명 좋아요 IP+세션 기반.
- **ADR-011**: 1차 런칭 범위 축소 — 회원/이용약관/다국어/문의 폼/검색 기능/애널리틱스 모두 *없음*.
- **ADR-012**: 어드민 권한 super/editor/viewer 3단계. super가 계정 생성.
- **ADR-013**: 관련 글 알고리즘 — 카테고리·태그·최신 조합 점수.
- **태그 자유 입력** 확정.
- **CSV 내보내기** 어드민에 추가.
- **다국어 한국어 only** 확정.

미답변·재확인 필요 4건:
1. 호스팅·인프라 (10번 도메인은 답변, 11번 호스팅은 누락)
2. 콘텐츠 워크플로우 (의도서 §9.1 분담 현재도 유효한지)
3. 첨부 파일 (어드민 게시글에 PDF·Word 등)
4. BI 시안 A/B (2026-04-22 PPT의 디자인 A/B)

이용약관·개인정보처리방침 관련 사용자 판단("회원가입 없어서 필요없음")은 *현재 1차 범위 한정*. 향후 *애널리틱스 도입(쿠키)·좋아요 IP 수집*이 추가될 때 일부 안내 페이지 필요할 수 있어 ADR-011 Consequences에 메모.

---

## 2026-05-26 (밤·9차) — 남은 TBD 마감 + 추가 ADR 4건

사용자 답변 5건 추가 확정 (호스팅·콘텐츠 워크플로우·첨부·BI·권한 보강).

- **ADR-014**: 호스팅 **Vercel**. Next.js와 자연 결합.
- **ADR-015**: 콘텐츠 워크플로우 — **사회공헌국 단독**. 의도서 §9.1 (사회공헌국·문화홍보국·개발업체 3자 분담) **폐기**. ADR-006이 §5 IA 폐기였다면, ADR-015는 §9.1 운영 분담 폐기. 의도서의 *조직 운영 가정*까지 Figma+사용자 결정이 정답.
- **ADR-016**: 권한 분리·CSV 내보내기는 v1.1로 미룸. 1차는 **단일 super 계정만**. ADR-012의 enum 구조는 유지(role 컬럼)하되 사용은 super 1개만 → 데이터 마이그레이션 부담 없이 v1.1 확장 가능.
- **ADR-017**: 어드민 첨부 — **이미지만** (JPG/PNG/WEBP, 5MB 이내). PDF·Word·동영상 불가.
- **BI 시안 A/B**: 사용자 확인 — 시안 검토 결과가 *이미 Figma에 반영*. Figma의 Sow Good 워드마크·해바라기·꽃 일러스트가 최종 BI 자산. 별도 결정 불필요.

이제 미해결 TBD는 2건만:
1. **도메인** (대기중)
2. **"쌀나눔 프로젝트" 메뉴 → 어느 섹션 앵커인지** (StorySection "밥이 사랑입니다" 추정)

데드라인 5일 + 명확한 1차 범위 + 호스팅 Vercel → **이제 스택 결정(ADR-001)에 모든 정보가 있다**. 다음 단계는 Next.js + Headless CMS 후보 비교 + 코드 시작.

---

## 2026-05-26 (밤·10차) — 해석 원칙 격상 (ADR-018)

사용자 메타 원칙 명시: "중간 대화나 회의에 대한 기록이 없고 점프한 것 같은 부분이 일부 있을 거야. 아이덴티티·목적은 고민해보고 최신 문서는 Figma로 해서 보낸 자료가 그렇다고 생각하는 게 정확함. 해당 부분 문서에도 잘 담아두면 좋겠음."

- **결정**: ADR-018 신설. *기존 문서 ↔ Figma 사이의 회의·결정 점프*를 공식 인정. 정성 영역(왜·정체성·톤)은 *추론으로 채우되 명시*. ADR-000의 사실 차원 SSOT 원칙을 정성 차원까지 확장.
- **반영처**: `docs/decisions.md` ADR-018, `CLAUDE.md` 상단(해석 원칙 섹션 신설), `docs/source/README.md` 4번 규칙 추가, 메모리 `interpretation_principle.md` 신설 + MEMORY.md 색인.
- **함의**: docs에 "*추론*:" 또는 "*추측*:" 같은 마커로 사실과 추론을 명시적으로 구분. 사회공헌국이 *추론을 정정할 수 있는 가설*로 다룸.
- **예시**: 미해결 TBD "쌀나눔 프로젝트 → 어느 섹션 앵커"는 *추론으로 표기*(StorySection 가장 가까움), 사회공헌국 확인 받기.

---

## 2026-05-26 (밤·11차) — AWS 이전 전제 → 마이그레이션 친화 설계 (ADR-019)

사용자 확인: "일단 Vercel, 추후 실서버는 AWS로 옮길 예정". 마이그레이션 어려움 우려 + AWS 스펙 추천 요청.

- **결정**: ADR-014 개정 (1단계 Vercel + 2단계 AWS 명시) + ADR-019 신설 (마이그레이션 친화 설계).
- **핵심 선택**:
  - DB → **Supabase Postgres** (Vercel Postgres ❌)
  - Storage → **Supabase Storage** (Vercel Blob ❌)
  - Auth → NextAuth.js 또는 Supabase Auth
  - Edge/Middleware 최소화 (Node Runtime만)
  - 환경변수 .env 표준
- **2단계 AWS 옵션**:
  - A: Amplify Hosting (가장 단순, Vercel과 유사 UX)
  - B: OpenNext + SST + Lambda + CloudFront + RDS (유연·비용 효율)
- **AWS 추천 스펙**: RDS `db.t4g.micro` + Lambda + CloudFront + S3 = ~$20~30/월. 트래픽 늘면 RDS만 `t4g.small`로 업그레이드.
- **OpenNext 등장**으로 2025년에는 Next.js의 AWS 이전이 *훨씬 부드러워졌음*. Vercel 종속 기능만 처음부터 피하면 마이그레이션은 *DB dump + Storage sync + DNS 변경* 수준.

---

## 2026-05-26 (밤·12차) — 팀 컨텍스트 추가: EC2 + Docker 익숙

사용자 추가 정보:
- 팀이 *EC2 자주 사용*. Docker로 말아서 배포 가능성 있음.
- 사용자는 배포 초보(Vercel만 경험).
- 시니어 관점 안내 요청.

- **결정**: 2단계 AWS 옵션에 **C(ECS Fargate)·D(EC2 + Docker)** 추가. ADR-019에 4가지 옵션 비교 표 + EC2 함정 3가지(Image Opt, ISR, 운영 자동화) + ECS vs EC2 권고 + 구체적 인스턴스 스펙(t3.small + ALB + RDS = ~$50/월) + CI/CD 흐름 명시.
- **`next.config.js` 처음부터**: `output: 'standalone'` 필수 (Docker 이미지 ~150MB). 2단계 EC2/Fargate 이전 시 Dockerfile 그대로 사용 가능.
- **시니어 솔직 추천**: 
  1. 1단계(5/31): Vercel + Supabase, standalone 옵션 켜두기
  2. 2단계: 팀에 풀타임 DevOps 없으면 **ECS Fargate**, 있으면 **EC2 + Docker**, 작은 트래픽이면 Vercel 유지도 합리
- **EC2 함정 3가지 인지 필수**: Image Optimization (CPU 부담), ISR (캐시 동기화), 운영 자동화(SSL/패치/모니터링/배포).
- **사용자 배포 학습 곡선**: 초보 → 시니어 도움 필요. Vercel로 시작하면서 천천히 배우는 게 안전.

---

## 2026-05-26 (밤·13차) — AWS 옵션별 Next.js 기능 호환성 매트릭스

사용자가 *Next.js 기능(SSG·SSR·ISR·Middleware)이 AWS에서 정상 작동하는지*를 다시 깊이 질문. 옵션 8가지 상세 비교로 답변.

- **ADR-019에 호환성 매트릭스 추가** — 각 옵션의 SSG/SSR/ISR/Middleware/Image Opt 작동 여부 정리.
- **핵심 함정 2가지 명확화**:
  1. **ISR**: 컨테이너 기반(Fargate/EC2)에서 멀티 인스턴스 시 캐시 동기화 문제 → ElastiCache Redis 필수 (단일 인스턴스라면 OK)
  2. **Image Optimization**: 컨테이너 기반은 sharp가 컨테이너 CPU 사용 → CloudFront 앞단 캐싱 *필수*
- **추천도 최종**:
  - ★★★★★ Amplify (학습 0) / OpenNext (학습 1주, 비용 효율)
  - ★★★★ ECS Fargate (Docker만) / EC2+Docker (팀 익숙도 가산)
  - ★★ App Runner (비쌈)
  - ★ Lambda 수동 / S3 정적 / EKS
- **시나리오별 추천**:
  - 학습 싫음 → Amplify
  - 비용·IaC → OpenNext + SST
  - Docker 익숙·DevOps 부담 ↓ → ECS Fargate
  - EC2 익숙·다른 서비스 동거 → EC2 + Docker
- **시니어 솔직 결론**: 2026년 표준은 ECS Fargate 또는 OpenNext. EC2는 *팀 컨텍스트가 결정적*일 때만.

---

## 2026-05-26 (밤·14차) — 스타터팩 기반 진행 결정

사용자: "스타터팩 같은 게 있어서 그걸로 진행할게."

- **결정**: ADR-001(기술 스택)을 *사용자 보유 스타터팩 기반*으로 작성. 처음부터 셋업하는 시간 절약 — 5일 데드라인에 합리적.
- **검증 항목 5개 (ADR-019 정합)**:
  1. DB Vercel Postgres ❌ → 외부 Postgres로
  2. Storage Vercel Blob ❌ → S3 호환으로
  3. Edge Runtime ❌ → Node Runtime
  4. `output: 'standalone'` 필수
  5. `.env` 표준 키
- **사용자에게 요청한 정보 4건**: 출처 / 핵심 구성 (package.json) / 그대로 vs 수정 / DB·Auth·Storage 셋업.
- **다음 단계**: 스타터팩 정보 수령 → 호환 검토 → ADR-001 최종 확정 → 코드 시작.

---

## 2026-05-26 (밤·15차) — 스타터팩 평가 + ADR-001 최종 확정

스타터팩 디렉토리 확인: `.ai/` (stacks·rules·common·integrations·process·templates·project), `.claude/` (agents·commands·hooks·skills·settings.json), `AGENTS.md`, `setup.sh`, `.env.example`.

- **핵심 스택 (`.ai/stacks/nextjs-fullstack/fullstack.md` 기준)**:
  - Next.js **16** (App Router) + TS Strict
  - DB: **Neon Postgres** (`@neondatabase/serverless`)
  - ORM: **Drizzle** + drizzle-zod
  - Auth: **Clerk** (`@clerk/nextjs`)
  - Styling: Tailwind v4 + **shadcn/ui v4**
  - Form: RHF + Zod v4
  - Cache: Next 16 `"use cache"` + cacheLife/cacheTag (stable)
  - Middleware: `proxy.ts` Node Runtime 전용
  - pnpm + Vercel
- **시니어 패턴 (내가 빠뜨린 부분)**:
  - **3-Layer**: actions.ts(엔트리) / service.ts(비즈니스, db ❌) / db.ts(Drizzle 전담)
  - **Server Component 기본**, Client는 leaf만, props 전달 패턴
  - `useActionState` vs RHF 분리 매트릭스
- **공통 안전망**: Anti-Slop 체크리스트(시스템 리마인더 로드), Golden Rules, dangerous-cmd-guard hook, secret-scan, header-check, circuit-breaker.
- **AI 에이전트 9종**: code-reviewer, designer, engineer, qa-reviewer, ceo, evaluator, docs-sync, human + 슈퍼파워.
- **Commands**: sprint-start, sprint-finish, anti-slop, audit-rules, lessons-promote.

- **평가**: 내 이전 추천보다 *훨씬 시니어급*. 특히 3-Layer 아키텍처와 캐싱 패턴은 내가 안 추천했던 큰 가치.
- **ADR-019 호환**: ✅ 외부 DB(Neon)·Node Runtime·.env SSoT. ⚠️ 보강 2가지: Storage 결정 + `output: 'standalone'`.
- **Storage 결정**: **Cloudflare R2** (S3 호환 + egress 무료 + 2단계 AWS S3 친화). Supabase Storage(Clerk과 Auth 중복) / Vercel Blob(종속) 모두 회피.
- **추가 의존성**: Tiptap (rich text), dayjs.
- **ADR-001 확정 + ADR-001a 신설** (스타터팩 보강 2개: standalone 옵션 + R2 환경변수).
- **Supabase 채택 → 철회** (Clerk + Neon + R2 조합으로 변경).

---

## 2026-05-26 (밤·16차) — ORM 심도 조사 + Drizzle 재확인 (ADR-001b 신설)

사용자 요청: insane-search 스킬로 ORM 시장 트렌드·공식·커뮤니티·시니어 의견 심도 조사.

- **시장 통계 (2026-05 실시간)**: Prisma 10.6M · Drizzle 9.6M DL/주. 격차 1M (2024년 대비 3배 성장). GitHub Stars: Prisma 46K · Drizzle 34.5K · TypeORM 36.5K · Kysely 13.8K.
- **큰 뉴스**: **Drizzle이 PlanetScale에 합류** (2026년 신호). 자금·풀타임 개발자·장기 지속성 확보. ORM 생존 리스크 측면 Drizzle ↑.
- **Next.js 공식**: ORM 전용 가이드 없음 — 중립.
- **Vercel·Turso 진영**: Drizzle 적극 추천. T3 Stack은 2026년 Drizzle이 Prisma 추월 (신규 프로젝트 기준).
- **Reddit 합의**: 없음. *팀 친숙도가 가장 큰 변수*. 단 Drizzle 지지 추세.
- **Theo Browne 입장**: "Don't optimize away Prisma's abstractions until you actually need to" — 단 우리는 Edge·AWS 이전이라 *이미 needed*.
- **ADR-001b 신설**: Drizzle 채택 근거를 ADR에 시장 데이터·시니어 합의로 박아둠. 향후 재논의 근거.
- **시니어 필수 팁**: `drizzle.config.ts`에 **`strict: true`** 설정. 컬럼 rename 시 데이터 손실 방지 (Reddit·HN 가장 흔한 Drizzle 사고).
- **최종 순위 (우리 케이스)**: 1️⃣ Drizzle ★★★★★ / 2️⃣ Prisma ★★★★☆ / 3️⃣ Kysely ★★★★ / 4️⃣ ZenStack v3(베타) ★★★.

---

## 2026-05-26 (밤·17차) — 스타터팩 통합 마무리

사용자: `setup.sh --stack=nextjs-fullstack` 실행 → 2/3/4번 일괄 진행 요청.

- **`setup.sh` 결과 확인**: `.ai/rules/`에 6개 심볼릭 활성화 (`fullstack.md`, `nextjs-shared.md`, `global.md`, `typescript.md`, `ai-behavior.md`, `anti-slop.md`). frontend·backend·mobile 비활성. 정확히 작동.
- **AGENTS.md "현재 컨텍스트" 채움**: 프로젝트 개요(이름·설명·스택·호스팅·데드라인) + 핵심 도메인(쌀나눔 캠페인·카테고리 5개·super 단일 계정) + Operational Commands + 현재 작업.
- **`.ai/project/domain.md` 생성**: 절대 제약·해석 원칙·1차 범위·메뉴 매핑·데이터 모델 핵심·자주 하는 실수·톤앤매너·작업 시작 체크. 우리 루트 CLAUDE.md의 핵심 도메인 규칙을 *스타터팩 패턴*에 맞게 이동.
- **`.ai/rules/domain.md` → `../project/domain.md` 심볼릭 생성**.
- **루트 CLAUDE.md 삭제**: AGENTS.md (= `.claude/CLAUDE.md` 심볼릭) + `.ai/rules/domain.md`로 정보 분산 이동 완료. 중복 제거.
- **현재 디렉토리 상태**: 13개 항목 (3 hidden 폴더 + AGENTS.md + GEMINI.md + checklist + context-notes + README + setup.sh + .env.example + docs).
- **남은 작업**: 코드 작업 진입 — Clerk·Neon·Cloudflare R2 셋업 → Drizzle 스키마 → 페이지 구현.

---

## 2026-05-27 — Sprint 1 D-5 완료 (셋업 + 공통 토대)

ADR-020/021/022 결정 기반으로 5일 데드라인의 첫째 날 작업. 인프라 + 데이터 + 3-Layer 골격까지 모두 완료. 빌드 검증 통과.

- **결정**: 호스트 Postgres 포트 충돌(5432, nexus_db 다른 프로젝트 점유)을 발견 — 우리는 5433으로 격리. `docker compose --env-file .env.local` 명시 로드.
- **왜**: 다른 프로젝트(nexus_db 4일째 가동)를 건드리지 않고 작업. 12-Factor — 호스트 포트는 변수화, 컨테이너 내부는 표준값 5432 고정.

- **결정**: `drizzle.config.ts`에서 `dotenv.config({ path: ".env.local" })` 명시 로드.
- **왜**: drizzle-kit은 `.env.local` 자동 로드 안 함 — `.env`만. Next.js 컨벤션과 분리되어 있어 명시 필요.

- **결정**: `src/db/seed.ts`에서 dynamic import 패턴(`await import("./index")`) 사용.
- **왜**: ESM hoisting으로 `import` 가 `dotenv.config()` 보다 먼저 평가됨 → `DATABASE_URL` undefined 에러. dynamic import로 평가 순서 강제.

- **결정**: `bcryptjs`는 default import 사용 (`import bcrypt from "bcryptjs"`).
- **왜**: bcryptjs 2.x는 CJS만 — named export(`compare`/`hash`) 런타임 실패. tsc는 .d.ts만 보고 통과시켜서 런타임에서야 발견됨.

- **결정**: 임시 비밀번호 자동 생성(`openssl rand -base64 18 | tr -d '/+=' | head -c 16`)으로 GATE 2 통과. 결과: `bRhHR2CWkqrMnj0L`.
- **왜**: conversation 노출 위험을 줄이는 옵션 중 사용자가 자동 생성을 선택. 배포 전 어드민 로그인 → 비밀번호 변경 절차 필수 (checklist D-1에 등록).

- **결정**: `proxy.ts`에 `runtime: "nodejs"` 명시 제거.
- **왜**: Next 16에서 proxy는 *항상* Node Runtime — 명시 금지 룰. middleware → proxy 마이그레이션의 차이.

- **결정**: `next.config.ts`의 `cacheComponents`를 `experimental` 밖 톱레벨로 이동.
- **왜**: Next 16에서 stable 승격됨. `experimental.cacheComponents` 사용 시 warning.

- **결정**: 임시 홈 `app/page.tsx`에서 `<Suspense>` boundary로 DB fetch 감쌈.
- **왜**: Cache Components 환경에서 uncached data는 Suspense 밖에서 호출 금지. `"use cache"` 또는 `<Suspense>` 둘 중 하나 필수. 이 패턴은 D-3 디자인 구현에도 동일 적용.

- **결정**: `next lint` 폐기 → `eslint .` 직접 호출. eslint.config.mjs는 최소 ignore만 (D-1에 정식 보강).
- **왜**: Next 16에서 `next lint` 제거 + eslint-config-next 16의 FlatCompat 브릿지가 순환 참조 에러 발생. 빠른 진행 위해 최소화, 정식 셋업은 D-1 QA 단계로 이월.

- **검증 증거 (methodology-tooled §6)**:
  - DB: `\dt` 결과 5/5 테이블 + `drizzle/0000_milky_sway.sql` SQL diff
  - 시드: stdout `news 9건 + 태그 27건`
  - 빌드: `✓ Compiled successfully` + `/ ◐ Partial Prerender` + `ƒ /api/auth/[...nextauth]` + `Proxy (Middleware)`
  - 타입: `pnpm tsc --noEmit` 0 에러

- **다음 단계 (D-4)**: shadcn/ui 초기화 → 공통 컴포넌트 9개(Header 스크롤스파이 + Footer + Banner + ArticleCard 12 variants 등). 디자인 토큰을 Tailwind에 매핑. SUIT 폰트 셋업.

---

## 2026-05-27 (D-5 종결 후) — 도메인 아키텍처 잠금 (ADR-023)

D-4 진입 직전 사용자 결정 — 어드민과 사용자 페이지의 URL/도메인 분리 패턴 잠금.

- **결정**: 옵션 2 (서브도메인) 채택. `<main>` + `admin.<main>`. 구현 방안 A (단일 Next.js 앱 + `proxy.ts` hostname 분기).
- **왜**: B2B SaaS 업계 표준 (Stripe / Slack / Shopify / AWS Console). 검색엔진 자연 분리 + NextAuth cross-subdomain 쿠키 wildcard 호환 + 비용 0(서브도메인 무료) + 5일 데드라인 안 구현 가능(host 분기 5-10줄) + v1.1 인프라 분리 자연스러움.
- **옵션 3 거부 사유**: 정부·금융 수준 격리 불필요. cross-origin 인증 복잡(NextAuth 호환성 문제), 도메인 2배 비용·배포 2배. 우리 규모(super 1명·콘텐츠 사이트) 오버킬.
- **옵션 1 거부 사유 (사용자 의사)**: 어드민을 명시적으로 격리하고 싶음.
- **폴더 구조 영향**: 옵션 1·2 모두 *동일 폴더 구조* 사용 가능 — `app/(public)/` + `app/admin/(auth)/` + `app/admin/(panel)/`. proxy.ts host 분기만 D-1에 추가.
- **로컬 개발 영향**: `localhost:3000`에서 양쪽 모두 접근 (host 분기 우회). 또는 `/etc/hosts`에 `127.0.0.1 admin.localhost` 추가하여 서브도메인 동작 테스트.
- **NextAuth 영향**: 도메인 확정 시 `AUTH_URL=https://admin.<main>` + 쿠키 domain `.<main>` wildcard 설정. 코드 변경 최소.

### 폴더 구조 잠금 (D-4 진입 전 명확화)

```
src/app/
  (public)/              # Route Group, URL에 안 나옴
    layout.tsx           # PublicHeader + PublicFooter
    page.tsx             # /
    news/{page,[id]/page}.tsx
  admin/
    (auth)/              # 로그인 전 — Sidebar 없음, noindex
      layout.tsx
      login/page.tsx
    (panel)/             # 로그인 후 — Sidebar, noindex
      layout.tsx
      page.tsx           # 대시보드
      news/{page,new/page,[id]/edit/page}.tsx
  api/
    auth/[...nextauth]/route.ts
    heart/route.ts
```

`app/admin/layout.tsx`는 *두지 않는다* — 두면 login에도 Sidebar 적용됨. 대신 `(auth)`와 `(panel)` 각자 layout 보유.

### 도메인 미정 영향

`docs/current.md` TBD에 메모: 사회공헌국 회신 시 메인 도메인 + admin 서브도메인 권장. 메인 후보: `socialgood.ffwpu.kr` 등.

---

## 2026-05-27 (D-5 종결 후 · 추가) — 폴더 구조 F3 잠금 (ADR-024)

ADR-023 결정 직후 사용자가 "더 분리된 형태"를 원해서 5개 폴더 패턴 점수표 + 업계 사례 검토.

- **결정**: F3 패턴 — `src/client/` + `src/admin/` + `src/features/`. ADR-023 폴더 부분 (A안)을 supersede.
- **검토한 5 옵션**:
  - A Route Groups + Features (분리 6점, 균등 60, 분리×2 66, 바이브×2 79)
  - D Bulletproof-React (분리 5점, 균등 56)
  - F1 client+admin+shared (분리 10점, 균등 60, 분리×2 70 ★) — 데이터 모델 shared 가면 사실상 F3 수렴
  - F2 Monorepo (분리 10점, 데드라인 4점) — 시리즈 A+ 표준, 우리 1인·1도메인 시드 이전 단계엔 시기상조
  - **F3 client+admin+features** (분리 8점, 균등 61 ★, 바이브×2 79 ★) — 최종 채택
- **왜 F3**:
  - 업계·스타트업 시드 이전 단계 표준 패턴
  - 사용자 분리 요구 충족 (트리 최상위에서 client/admin 갈림)
  - 데이터 로직 SSOT 유지 (features/ 한 곳)
  - 에이전틱 코딩 친화 (AI가 3분기로 위치 즉결: UI냐 도메인 로직이냐, UI면 client인가 admin인가 공유인가)
  - 5일 데드라인 안전 — D-5 셋업 src/features/news/ 그대로 유지, D-4에 src/client/ + src/admin/ 신규 생성
  - v1.1+ F2 Monorepo 마이그레이션 자연 (src/client → apps/web, src/admin → apps/admin)
- **F2 채택 안 한 이유**: 5일 데드라인에 monorepo 셋업 +1일 부담 + 1차 단일 도메인(news)에 packages/ui 만들기는 over-engineering. 업계상 시리즈 A+ 패턴.
- **F1 채택 안 한 이유**: 데이터 모델(news 테이블)이 양쪽 공유라 shared 안에 features가 결국 생김 → 사실상 F3.

### F3 핵심 결정 규칙 (AI/사람 동일)

```
페이지/라우트         → app/(public)/ or app/admin/(panel)/
사용자 전용 UI        → src/client/{layouts,sections,hooks}/
어드민 전용 UI        → src/admin/{layouts,components,hooks}/
양쪽 공유 도메인 UI   → src/features/<도메인>/components/
도메인 로직(서버)     → src/features/<도메인>/{actions,service,db,schemas}.ts
shadcn primitive     → src/components/ui/
순수 함수 유틸        → src/lib/
Drizzle 스키마        → src/db/schema/
외부 연동 API         → src/app/api/.../route.ts
```

D 패턴 흡수: `src/features/<도메인>/index.ts` public API — 외부에서 `db.ts` 직접 import 금지, actions/service/types만 노출.

### D-4 진입 영향

현재 src/ 코드 이동 0. D-4 시작 시:
- 신규 생성: `src/client/{layouts,sections,hooks}/`, `src/admin/{layouts,components}/`
- 기존 유지: `src/features/news/{actions,service,db,schemas}.ts`, `src/db/`, `src/lib/`, `src/auth.ts`, `src/proxy.ts`

`src/types/`와 `src/hooks/`도 그대로 유지 (전역 공용).

---

## 2026-05-27 (D-4 — F3 폴더 + 디자인 토큰 + 공통 컴포넌트 11종)

### 결정 #1 — SUIT 폰트 출처 (next/font/local 6 weight)

- **결정:** `sun-typeface/SUIT` GitHub repo v3 woff2 6 weight (Heavy/ExtraBold/Bold/SemiBold/Medium/Regular) 다운로드 후 `public/fonts/` 커밋. `next/font/local` 로 `--font-suit` CSS 변수 주입.
- **왜:** SIL Open Font License (OFL) 로 상업·비상업 자유 사용. CDN 미존재. preload 최적화 + FOUT 회피.
- **대안 검토:** `@font-face` + CDN (FOUT 가능, jsdelivr 미러 신뢰도 우려) / 시스템 폰트 폴백 (디자인 토큰 검증 불완전).
- **파일 크기:** woff2 6 weight 총 ~1MB. Vercel 배포 영향 미미.

### 결정 #2 — Gmarket Sans 미도입 (D-3 이월)

- **결정:** Gmarket Sans Medium (히어로 슬로건 60px 전용) 은 D-4 에 도입하지 않음. D-3 디자인 시안 적용 시점에 별도 처리.
- **왜:** 공식 배포는 ZIP otf 만 제공 (gmarket.com), woff2 변환 별도 작업 필요. 히어로 슬로건은 D-3 에 본격 도입되므로 D-4 공통 컴포넌트엔 영향 없음. SUIT Heavy 폴백으로 임시 대체 가능.
- **이월 항목:** Gmarket Sans Medium woff2 변환 + `next/font/local` 추가 + globals.css `--font-display` 토큰 정의 + `font-display` Tailwind utility.

### 결정 #3 — shadcn/ui Neutral 베이스 + 보라 primary 오버라이드

- **결정:** `shadcn@latest add` 비대화형 진행 (구 CLI `init --base-color neutral` 옵션 제거됨 — `components.json` 직접 작성 + `src/lib/utils.ts` 직접 생성 후 `add` 만 호출).
- **베이스:** Neutral (shadcn `--primary` oklch 검정 그대로 → `#501F7E` 보라로 오버라이드).
- **이유:** Violet 팔레트는 shadcn 기본 변수와 충돌 가능. Neutral + 커스텀 토큰 오버라이드가 가장 안전한 path. shadcn primitive 의 default Button 등이 자동으로 보라 primary 적용됨.
- **9 primitive:** button / input / label / card / select / dialog / form / separator / carousel (FeaturedStoryCard 용 Embla 기반 carousel 포함).

### 결정 #4 — 디자인 토큰 명명 체계 `--color-brand-*` / `--color-ink-*` / `--color-surface-*`

- **결정:** 초기 계획 (`docs/design.md` 의 "권장 토큰명" 컬럼 `--color-primary-*`) 폐기. 실제 구현은 의미 기반 namespace 분리.
- **왜:**
  - shadcn `--primary` 와 `--color-primary` 가 이미 존재. `--color-primary-bright` 같은 추가 변형이 충돌·혼동 유발.
  - `--color-brand-*` 는 우리 도메인 보라 9 단계 전용. shadcn primitive 와 명시적 분리.
  - 텍스트는 `--color-ink-*` (strong/subtle/date), 배경은 `--color-surface-*` (soft/card/cool/dark), 액센트는 `--color-warm`, KPI 는 `--color-kpi-*`, 태그는 `--color-tag-*`, 그라디언트는 `--color-gradient-from/to`.
- **Atomic Update:** `docs/design.md` 의 토큰명 컬럼을 실제 구현 변수명으로 동기화 완료 (D-4 종결).
- **ADR 후보:** ADR-025 (또는 ADR-024 보강) — 의미 기반 namespace 분리 결정 + shadcn 충돌 회피.

### 결정 #5 — ArticleCard 12 variants 단일 컴포넌트 통합

- **결정:** size (1~4) × state (default / hover / none) = 12 시각 variants 를 한 컴포넌트 `ArticleCard.tsx` 의 props (`size`, `state`) 분기로 표현. 12 개 별도 컴포넌트 분리 안 함.
- **왜:** 12 컴포넌트 분리 시 코드 중복 95%+, prop 인터페이스 통일 어려움. 단일 컴포넌트 + 내부 `SIZE_CONFIG` 매핑 객체로 size 별 width/aspect/font 스케일 관리.
- **state="none":** placeholder (보라 그라디언트 `var(--color-gradient-from)` → `var(--color-gradient-to)`) + "보도자료" 텍스트 (ADR-007 더미 라벨, code-reviewer NIT-2 — 중립 표현으로 변경 검토는 D-3 백로그).

### 결정 #6 — features/news 클라이언트/서버 barrel 분리

- **결정 변경:** 초기 plan 에서 `features/news/index.ts` 에 컴포넌트도 함께 export 하기로 했으나, Client Component (예: `dev/components/page.tsx`) 가 `@/features/news` import 시 actions / service / schemas (drizzle-zod / db / @auth 의존) 도 함께 client bundle 에 포함되어 build error 발생.
- **수정 결정:** 두 barrel 로 분리.
  - `src/features/news/index.ts` — **server-only**: actions / service / schemas exports
  - `src/features/news/components/index.ts` (신규) — **client-safe**: 7 컴포넌트 + 2 타입 exports
- **Client Component 는 `@/features/news/components` 만 import.** Server Component 는 둘 다 가능.
- **ADR 후보:** ADR-025 (또는 ADR-024 보강) — features/<도메인> 의 client/server barrel 분리 패턴.

### 결정 #7 — PublicFooter © 연도 정적 hardcode (2026)

- **결정:** `new Date().getFullYear()` 대신 `© 2026` 직접 박음.
- **왜:** Next.js 16 Cache Components 활성 상태 (`next.config.ts` `cacheComponents: true`) 에서 Server Component 의 `new Date()` 호출은 prerender 단계 차단됨 (cookies / searchParams / connection 같은 dynamic source 선행 필요). Footer 는 정적 prerender 가 자연스러움.
- **트레이드오프:** 매년 수동 업데이트 1회 필요. v1.1+ 에 BUILD_TIME 환경변수 또는 빌드 스크립트 자동화 후보.
- **TODO 등록:** `docs/TODO.md` (또는 v1.1 백로그) 에 매년 1월 © 연도 갱신.

### 결정 #8 — D-4 검증 ITERATE verdict 후 P0 후속 수정 3건 (사회공헌국 H-1 결정 반영)

- **검증 파이프라인:** designer / code-reviewer / human / docs-sync / codex CLI 5 평가자 병렬 + evaluator 메타 종합. 결과 **ITERATE (보완 후 D-3 진입 가능)**.
- **P0 그룹 A — Figma SSoT drift (사회공헌국 H-1: Figma 명세 정합 선택):**
  - `CategoryTabs.tsx:38` active 텍스트 `text-brand-vivid` → `text-ink-strong` (vivid 중복 강조 해소).
  - `Pagination.tsx:39` active 색 반전 (`bg-brand-primary text-white` → `font-bold text-brand-primary` 무배경) — Figma 명세 정확 정합.
- **P0 그룹 B — 사용자 perception (human CONFUSED 신뢰 4/10):**
  - `app/(public)/page.tsx` "D-5 데이터 검증 — 소식 N건" 개발 메모 제거 → "준비 중" 임시 카피 교체. D-3 디자인 시안 적용 시 본격 구현으로 교체.
- **P0 그룹 C — Docs Atomic Update 4건:** checklist (D-4 18 항목 체크) / design.md (토큰 명명 동기화) / context-notes (D-4 결정 8건 누적 — 본 섹션) / CLAUDE.md "현재 작업" 포인터 D-3 갱신.
- **Human escalation (`docs/TODO.md` 누적):**
  - H-2 — 푸터 종교 법인명 위치 (포교 금지 절대 제약 vs 법적 의무 투명성). 사회공헌국 결정 사안.
  - H-3 — Banner "참여하기" 카피 (D-3 카피 확정 시 의미 정합: "소식 보기" 또는 "이야기 보러가기" 권고).

### D-3 진입 영향 (D-4 종결 시점)

- **F3 폴더 골격 + 디자인 토큰 + SUIT 폰트 + 11 공통 컴포넌트 + Route Group 3 layout 완성** → D-3 디자인 시안 적용 시 `src/client/sections/` 6 섹션 신규 + `app/(public)/page.tsx` placeholder 를 시안 구현으로 교체만 하면 됨.
- 어드민 D-2 진입도 평행 가능 (`src/admin/components/` 신규 + `app/admin/(panel)/news/` 라우트 + `(panel)/page.tsx` 본격 구현).
- **ADR 후보 2건** 작성 — ADR-025 (client/server barrel 분리) + ADR-026 (토큰 명명 namespace) 또는 ADR-024 보강 — 다음 세션 (D-3 또는 D-2 시작 시) 초반에 처리 권고.

### D-4 산출물 통계

- **9 commits** (chore: shadcn / feat(design): 토큰+SUIT / feat(client): Header+Footer+Banner+useScrollSpy / feat(admin): AdminSidebar / feat(news): ArticleCard+StoryCard+Featured / feat(news): Heart+CategoryTabs+Pagination+KpiCard / feat(news): index.ts / chore(layouts): Route Group+dev/components+barrel split / fix(d4-review): P0 정합 3건).
- **44+3 파일 변경** (신규 23, 수정 4, shadcn 9, 폰트 6, 잠금 2 + 본 docs Atomic Update 후속 commit + P0 후속 3건).
- **pnpm tsc/lint/build 0 error**, 5 BP 가로 스크롤 0, console.error 1 (favicon.ico 404 — D-3 백로그).
- **Multi-agent verdict:** ITERATE → 조건부 D-3 진입 가능 (P0 7건 처리 완료).

### 결정 #9 — Figma SSoT 정합 작업 (2026-05-27, 사용자 지적 후)

**배경:** D-4 종결 후 사용자가 1920 landing screenshot 과 코드 비교 → Figma 외 임의 추가 항목 3건 발견.

**처리:**

1. **상단 보라 Banner 띠 — 완전 삭제**
   - 위반: `(public)/layout.tsx` 최상단에 Banner 렌더 (모든 페이지에 노출). Figma 1920 landing 에 해당 띠 없음.
   - Figma 실제 명세: Banner (`125:8915`, 1440×132) 는 **소식 페이지 (목록·상세) 전용** 가로 띠. 카피 **"Sow Good 가족이 아니어도, 같은 동네가 아니어도, 밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다."** (2026-05-30 신 Figma 정식 카피 — 이전 회의 회고 시점엔 다른 카피로 추정했으나 신 Figma 동기화 결과 본 카피로 확정).
   - 조치: `src/client/layouts/Banner.tsx` 파일 삭제 + barrel export 제거 + layout import 제거. D-2 소식 페이지 구현 시 정확한 Figma 명세로 재작성.

2. **홈 페이지 "준비 중" placeholder 카피 — 완전 비우기**
   - 위반: `src/app/(public)/page.tsx` 의 "사회공헌단 Sow Good / 가치를 삶으로 증명합니다. / 곧 더 풍성한 활동 이야기로 인사드릴 예정입니다." 임의 카피.
   - Figma 실제 명세: 홈은 6 섹션 (HeroBanner + KpiSection + StorySection + FeaturedSection + ArticleGrid + Pre-Footer). D-3 본격 구현.
   - 조치: `<div />` 빈 본문. PublicHeader + PublicFooter 는 layout 에서 자동 wrap. **임의 placeholder 카피는 빈 화면보다 나쁜 사용자 경험 (D-5 "데이터 검증" 노출 사고 참조).**

3. **PublicFooter 재구성 — Figma news-detail (93:8810) 명세 정확 정합**
   - 위반: "© 2026 FFWPU Korea — Sow Good. All rights reserved." 임의 카피 + "소개·쌀 나눔 소식" 내부 링크 (Figma 미존재).
   - Figma 실제 명세 (news-detail 1440 screenshot 직접 확인): 다크 띠 (#242424) 한 줄 — "COPYRIGHT 2026 © Sow Good All rights reserved.". 내부 링크·SNS 아이콘 없음.
   - 조치: PublicFooter 단순화. 1920 landing 의 푸터 직전 보라/SNS 영역은 별도 섹션 (D-3 시안 적용 시 도입).

4. **`docs/design/README.md` 신규 작성 — Figma SSoT 영속 참조**
   - Figma URL (`lmjjU4UxUpK2pDi67BGRiW`) + MCP 도구 prefix (`mcp__plugin_figma_figma__*`) + 호출 예시 + 20 screenshots/ 파일 노드 ID 매핑 + 안티 패턴 명시 ("Figma 없으면 코드 없음").
   - 이후 모든 세션 시작 시 `docs/design/README.md` + `docs/design.md` 동시 참조 권장.

### 교훈 (lessons.md 후보)

> **"placeholder 임의 카피 > 빈 화면 ≫ 사용자 신뢰 손상"** — 빈 화면은 의도된 미완성으로 인식되나, 임의 placeholder 카피 (예: "준비 중", "Sow Good 가족이 아니어도", "D-5 데이터 검증") 는 *프로덕션 의도된 콘텐츠로 오인* 되어 신뢰 손상.
> AI 가 임시 카피를 작성할 때는 빈 div 또는 의도 명시 주석 (`<div data-todo="D-3 hero" />`) 으로 대체 — **사용자에게 보이는 텍스트 = Figma SSoT 만**.

3 회 반복 시 `.ai/project/lessons.md` 승격 검토 (현재 사고 2건 누적: D-5 "데이터 검증" 헤딩 + D-4 placeholder 카피 3종).


---

## 2026-05-27 (D-4 후속 — 데이터 모델 변경: 카테고리 + heart, codex consult 기반)

> PR 머지 전 사용자 검토 중 codex consult (`/codex`) 로 news.ts·heart-events.ts 피드백 → 두 데이터 모델 결정 변경.

### 결정 #10 — 카테고리 pgEnum → categories 테이블 (ADR-025, ADR-007 supersede)

- **사용자 결정 (2026-05-27)**: 카테고리 고정 enum 대신 어드민이 추가·관리 가능한 자유 구조. ADR-002 운영 자율성 우선.
- **codex 트레이드오프 검토**: enum→FK 전환은 마이그레이션+UI 가변탭+Zod+어드민폼 4 레이어 변경. 단 "배포 후 전환 비용이 훨씬 크다"고 판정 → prod 데이터 없는 지금 전환이 정답.
- **구현**: `categories` 테이블 (slug unique immutable, sort_order, is_active). `news.category` enum → `category_id` FK (onDelete restrict). `all`은 UI 필터 전용 (`ALL_CATEGORY_SLUG`, constants.ts client-safe). 마이그레이션 `0001` (개발 destructive truncate + 재시드).
- **client/server barrel 3번째 사례**: `ALL_CATEGORY_SLUG` 를 schemas.ts(drizzle-zod) 가 아닌 `constants.ts` 로 분리 — CategoryTabs(client) 가 drizzle 끌어오는 build 실패 회피. (1번 features/news index 분리, 2번 components barrel, 3번 constants).
- **CategoryTabs 전환**: enum 5 하드코딩 → categories props 기반 + 전체 가상 탭. ArticleCard category enum → categoryName(string) join.

### 결정 #11 — 익명 좋아요 ip_hash 제거 (ADR-026, ADR-010 단순화)

- **사용자 결정**: "최대한 심플". codex: IP+세션은 "보안 아니라 중복 완화", 공유 IP에서 IP 무의미, HMAC·rate limit 과한 스펙.
- **구현**: `heart_events.ip_hash` 제거, unique `(news_id, session_id)`. sessionId = 클라 localStorage UUID. 개인정보 미수집 (ADR-004 정합).
- **문서화**: "1인 1회 보장" 아님 "동일 브라우저 중복 완화". KPI·랭킹·보상 대상 아님.

### codex consult 가 잡은 추가 항목 (PR 머지 전 검토 8항목)

1. 카테고리 정책 ✅ 결정 (테이블 전환)
2. `all` 의미 ✅ UI 필터 전용
3. 카테고리 vs 태그 역할 ✅ domain.md 명시
4. 카테고리 삭제·변경 ✅ slug immutable + is_active
5. 좋아요 보안 표현 ✅ "중복 완화" 문서화
6. ip_hash 생성·보존 ✅ 제거 (개인정보 0)
7. heart soft delete 의미 ✅ 현재 상태 복원 모델
8. 마이그레이션 baseline ✅ 0001 지금 전환

### D-2 이월 (toggleHeart 구현 시)

- Heart 컴포넌트가 클라 localStorage UUID 생성 → toggleHeart action 인자. unique 충돌 시 기존 row deleted_at 토글 (insert 재시도 금지).
- 어드민 카테고리 관리 UI (`src/admin/components/CategoryManager`) — 추가·수정·비활성화·정렬.

---

## 2026-05-28 (D-2 진입 — 어드민 페이지 plan 확정 + 의존성 셋업)

> 별도 worktree `ffwpu-social-d2` 에서 진행 (브랜치 `feat/sprint-1-d2-admin`). main worktree (`ffwpu-social`) 의 docker-compose (postgres 5433 + minio 9000-9001) 공유 사용 — d2 자체 compose up 시도 시 컨테이너 이름 충돌이라 main 의 인스턴스 그대로 활용.

### Plan 위치

- 개인 brainstorm: `~/.claude/plans/ffwpu-social-sprint-1-d-2-ticklish-fox.md` (Stage 3 plan 본문 + codex consult 결과 + 결정 #1~#16)
- 공유 plan: `docs/plans/active/2026-05-28-sprint-1-d2-admin.md` *다음 세션에 ~/.claude 본문 옮겨 작성 예정 (global.md plans 라이프사이클 정합)*

### Stage 1 Brainstorm 결정 16건 (요약)

- **범위**: 로그인 + 뉴스 CRUD + 카테고리 관리만. toggleHeart D-3 이월, audit_logs v1.1 백로그.
- **UI**: 사용자 사이트 보라 그대로 (새 토큰 추가 0). 대시보드 = 최근 글 5건 + 카테고리 카운트 칩. 뉴스 URL = UUID id 그대로. 발행 = publishedAt nullable 2 버튼 ([임시 저장]/[발행]). 카테고리 UI = 리스트 + 상단 추가 폼 + row Dialog. 카테고리 삭제 = is_active 토글만.
- **폼 패턴**: RHF + Controller + handleSubmit → action. Tiptap StarterKit + Image + Link + 드래그앤드롭. 자동 저장 0. 태그 = 칩 + autocomplete. 커버 이미지 = 별도 필드.

### codex consult 1차 결과 (Heavy 분류, session 019e6a2f)

P1 7건 + P2 5건. P1 모두 plan 내 명시 처리:
1. **`/api/upload` Route Handler 미보호** → 결정 #16 Route Handler 자체 생성 안 함. `uploadImageAction` Server Action 만 사용.
2. **role check 복붙** → `src/lib/auth-guards.ts::requireSuperAdmin()` helper 일원화.
3. **Tiptap XSS 위험** → 결정 #13 React renderer whitelist (`NewsBodyRenderer.tsx` 자체 walker, DOMPurify 의존성 0). Link http(s) only, Image src `NEXT_PUBLIC_S3_PUBLIC_URL` prefix 매칭 강제. 5 단위 테스트.
4. **5MB 우회** → 결정 #14 Presigned POST + `content-length-range` policy. `@aws-sdk/s3-presigned-post` 신규 설치.
5. **news + news_tags transaction** → service 가 `db.transaction(async tx => ...)` 안에서 insertNews + replaceNewsTags 호출. db.ts mutation 함수 모두 tx 인자 받음.
6. **Tiptap + RHF 무한 루프** → quant-bridge LESSON-004 강화. `useEditor` 1회 + `onUpdate` 만 onChange + content 재주입 금지 + **body 는 RHF register 안 함, useState 별도 + submit 시 병합** (codex 추가 권장).
7. **공개 목록 draft 노출 위험** → 결정 #15 `listPublicNews` (publishedAt IS NOT NULL) / `listForAdmin` 분리. type-safe — admin 함수는 server-only barrel 만 export.

codex Recommendation: "D-2 반드시 결정: auth helper / public-admin query 분리 / Tiptap sanitize 전략 / upload size enforcement / transaction 방식". 모두 결정 #13~#16 + 위험표 6 행 + Task 분해 갱신으로 확정.

### 의존성 추가 (T1)

```bash
pnpm add @tiptap/extension-image@^2.10.3 @tiptap/extension-link@^2.10.3 @aws-sdk/s3-presigned-post
```

Tiptap 은 기존 2.x 와 통일 (peer dep 충돌 회피 — 3.x 설치 시 starter-kit/react/pm 모두 업그레이드 필요).

### Task 분해 (13 task, 4 구간)

1. **구간 1 인증·인프라** (T1~T3): 의존성·docker 검증 ✅ / lib/s3 + auth-guards + storage upload + uploadImageAction / LoginForm
2. **구간 2 카테고리** (T4~T5): features/categories 3-Layer / CategoryManager + /admin/categories
3. **구간 3 뉴스 CRUD** (T6~T10): db.ts query 분리 + tx / service + actions / TiptapEditor + CoverImageUploader + TagsInput / NewsEditor + NewsTable / /admin/news routes
4. **구간 4 대시보드 + body renderer** (T11~T13): Dashboard / NewsBodyRenderer + 5 단위 테스트 / 종합 verify

### 다음 세션 (T2 진입 시) 첫 작업

1. `docs/plans/active/2026-05-28-sprint-1-d2-admin.md` 작성 (~/.claude 본문 옮김 — global.md 승격 경로 정합)
2. T2 — `src/lib/s3.ts` + `src/lib/auth-guards.ts` + `src/features/storage/upload.ts` + `src/features/news/actions.ts::uploadImageAction`
3. T3 — `src/admin/components/LoginForm.tsx` + `app/admin/(auth)/login/page.tsx` 통합
4. 구간 1 종료 시 commit + 사용자 보고

---

## 2026-05-28 (D-2 진행 — 구간 1+2 완료, T1~T5)

### 구간 1 — 인증·인프라 (commit `6acaa8e`)

**T1 의존성**: `@tiptap/extension-image@2.27.2` + `@tiptap/extension-link@2.27.2` + `@aws-sdk/s3-presigned-post`. main worktree 의 docker (postgres 5433 + minio 9000-9001) 공유 사용.

**T2 인프라**: 
- `src/lib/auth-guards.ts::requireSuperAdmin()` — 모든 admin Server Action 첫 줄 helper (codex P1#1+#2 통일).
- `src/lib/s3.ts` — S3Client (MinIO/R2 호환, `forcePathStyle`) + `getPublicUrl(key)` + `isAllowedImagePublicUrl(url)` (NewsBodyRenderer T12 정합).
- `src/features/storage/upload.ts::createPresignedPost` — content-length-range [1, 5MB] + Content-Type 정확 매치 + 60s 만료 (codex P1#4). object key `news/{newsId|temp-{uuid}}/{uuid}.{ext}` (orphan 청소 친화).
- `src/features/news/actions.ts::uploadImageAction` — Server Action (결정 #16). requireSuperAdmin → Zod 검증 → createPresignedPost → `{ uploadUrl, fields, publicUrl, key }` 반환. 기존 createNewsAction 의 auth 검사도 helper 로 교체.

**T3 LoginForm**: 
- `src/admin/components/LoginForm.tsx` — RHF + zodResolver + `signIn("credentials", { redirect: false })` + `router.refresh()`. useTransition + inline authError.
- `app/admin/(auth)/login/page.tsx` — placeholder 의 `await auth()` 체크 제거 (proxy.ts 가 already-logged-in /admin/login → /admin 처리 중이라 중복). Cache Components 환경에서 prerender block 회피.

### 구간 2 — 카테고리 도메인 (commit `2a9448d`)

**T4 features/categories 3-Layer**:
- `db.ts`: listAllCategoriesForAdmin + countNewsPerCategory + getCategoryBySlug + insertCategory + updateCategoryById. `UpdateCategoryData` 타입에 slug 제외 (ADR-025 immutable 컴파일 단계 강제 + codex P2#1).
- `schemas.ts`: `CATEGORY_SLUG_REGEX` (영문 소문자·숫자·하이픈) + createCategorySchema + updateCategorySchema (slug 제외).
- `service.ts`: listAllForAdmin (글 수 join Map merge) + createCategory (slug 중복 사전 검증) + updateCategory (필드 변경 0 거절).
- `actions.ts`: requireSuperAdmin + revalidatePath (`/admin/categories` + `/admin/news` + `/news` + `/`).

**T5 CategoryManager UI**:
- shadcn Switch primitive 추가.
- `src/admin/components/CategoryManager.tsx` — 상단 [+ 새 카테고리] 폼 + 리스트 (이름·slug·글수·정렬·활성 chip) + row [수정] → Dialog (name/sortOrder/isActive, slug readonly 안내). useTransition + inline ErrorBanner.
- `app/admin/(panel)/categories/page.tsx` — Server Component + Suspense 안에 listAllForAdmin 호출. Cache Components 환경에서 uncached data 는 Suspense boundary 필수.

### 결정 / 함정

**결정 #17 — Cache Components 환경 admin 페이지는 Suspense boundary 패턴 (force-dynamic 미사용)**
- `export const dynamic = "force-dynamic"` 는 `cacheComponents: true` 와 호환 X (Next.js 16 빌드 에러: "Route segment config 'dynamic' is not compatible with `nextConfig.cacheComponents`").
- 정답 — 정적 헤더 + Suspense 로 data fetch 분리: `<Suspense fallback={<Loading />}><AsyncDataComp /></Suspense>`.
- `/admin/categories` 가 ◐ Partial Prerender 로 빌드 (정적 헤더 prerender + 동적 데이터 스트림).
- 다음 admin 페이지 (`/admin`, `/admin/news`, `/admin/news/new`, `/admin/news/[id]/edit`) 모두 같은 패턴 적용.

**결정 #18 — Client Component 는 features/<domain> index.ts barrel 우회 (D-4 패턴 재확인)**
- `from "@/features/categories"` 에서 import 하면 service.ts → db.ts → pg 가 client bundle 로 끌려옴 (module-not-found build 에러).
- Client Component (CategoryManager 등) 는 직접 path import: `from "@/features/categories/actions"` + `from "@/features/categories/schemas"`.
- index.ts 는 server-only barrel (Server Component 에서만 사용).

### 다음 세션 (T6 진입) 첫 작업

1. T6 — `features/news/db.ts` 보강:
   - `findAllNews` → `listPublicNews` rename + `WHERE published_at IS NOT NULL` (P1#7)
   - `findNewsById` → `getPublicNewsById` (published 강제) + `getAdminNewsById` (모두)
   - 신규: `listForAdmin({ page, size, status })`, `getAdminNewsById`, `listLatest(5)`, `countNewsByCategory()`, `searchTags(prefix)`
   - mutation: `insertNews(tx, data)`, `updateNews(tx, id, data)`, `deleteNews(tx, id)`, `replaceNewsTags(tx, id, tags)` — **모두 tx 인자 받음** (P1#5)
   - 호출 측 (CategoryTabs / 사용자 사이트 routes / 어드민 routes) 의 import 도 함께 변경
2. T7 — service.ts createNews/updateNews/deleteNews 모두 `db.transaction` 안에서 insertNews + replaceNewsTags. tags normalize + dedupe. actions.ts requireSuperAdmin + publishNewsAction
3. 구간 3 (T6~T10) 모두 끝나는 시점에 사용자 보고 + commit

---

## 2026-05-28 (D-2 자동 진행 — T6~T13 + PR, 사용자 사전 승인 "멈추지 말고 PR까지 + 추천 자동 선택 + 결정 로그")

### 진행 모드

- 사용자가 본 세션 시작 시 명시: "쭉 진행을 하는데 가능한 멈추지말고 PR생성까지 끝까지 했으면 좋겠고, 물어보지 않는다면 문제가 선택부분인데 추천으로 자동 선택, 대신 해당 목록 및 선택 항목에 대한 기록을 해두고 PR생성할때 어떤 목록이 있었고 어떤 것을 선택했는지 남겨줘".
- `docs/plans/active/2026-05-28-sprint-1-d2-decisions.md` 신규 — T6~T13 진행 중 발생한 12개 분기점 누적 (각 [질문/옵션/선택/이유/영향]). PR 본문에 링크.
- `~/.claude/projects/.../memory/autoexecute_to_pr_mode.md` 신규 — 본 운영 모드를 feedback memory 로 영속화. 향후 동일 요청 시 재사용.

### 구간 3 — 뉴스 백엔드 (T6+T7, commit `e7e7f7d`)

- `db.ts` codex P1#7 분리: `findAllNews → listPublicNews + publishedAt IS NOT NULL`, `findNewsById → getPublicNewsById + 동일 조건`. 어드민용 `listForAdmin / countForAdmin / getAdminNewsById / listLatest / countNewsByCategory / searchTags` 신규 (정렬키 `createdAt DESC` — 결정 로그 [T6]).
- mutation `insertNews/updateNews/deleteNews/replaceNewsTags` 모두 `tx: Tx` (drizzle transaction callback param 추론) 인자 강제. service 가 db.transaction 안에서 호출 → 호출자 실수 차단.
- service.ts: createNews/updateNews 가 db.transaction. tags normalize (# 제거 + trim + lowercase + dedupe). deleteNews 후 features/storage/cleanup::deleteByPrefix(`news/{id}/`) best-effort (DB 삭제 성공 보장, S3 실패는 v1.1 cleanup job 백업).
- actions.ts: createNewsAction 시그니처를 `(input: NewsInput)` values object 직접 수신 (FormData 미사용, 결정 로그 [T7]). body=jsonb + tags=array 의 RHF handleSubmit 자연 통합. updateNewsAction/deleteNewsAction/publishNewsAction/searchTagsAction 추가. 모두 requireSuperAdmin + revalidatePath 통일.

### 구간 3 — UI 컴포넌트 (T8+T9, commit `cde954e` + `33b638b`)

- TiptapEditor: `useEditor` 1회만 + onUpdate 만 onChange + content 재주입 금지 (codex P1#6). body 는 NewsEditor 의 useState 별도 + submit 시 병합. 드래그앤드롭/paste 자동 업로드 (uploadImageAction → presigned POST → editor.setImage). 툴바 8 버튼 (B/I/H2/H3/UL/OL/Link/Image). `immediatelyRender:false` (Next.js SSR hydration mismatch 회피).
- CoverImageUploader: 클릭/드래그앤드롭, 업로드 실패 시 기존 url 유지 (결정 로그 [T8]). next/image `unoptimized` (MinIO 로컬 + R2 prod 호환).
- TagsInput: 칩 + autocomplete (빈도순, 결정 로그 [T6]). Enter+Comma 둘 다 (결정 로그 [T8]). debounce 200ms inline setTimeout (의존성 0). Backspace 로 마지막 태그 제거.
- NewsEditor: RHF + Controller 4 필드 (title/categoryId/tags/coverImageUrl) + body useState 별도. tempId useMemo 1회 (새 글 본문 이미지 prefix). [임시 저장]/[발행] 2 버튼 — [발행] 누르면 publishedAt=now(또는 기존 timestamp 유지), [임시 저장]=null. new mode 성공 시 /admin/news/[id]/edit redirect.
- NewsTable: 상태 탭 (전체/임시/발행) + queryString 페이지네이션 (결정 로그 [T10 URL]) + publishNewsAction inline 토글 + deleteNewsAction confirm Dialog.

### 구간 3 — 라우트 (T10, commit `4137ae3`) + 빌드 함정 해결

- **drizzle-zod 제거** (schemas.ts 순수 Zod) — drizzle-zod@0.7.1 ↔ drizzle-orm@0.36.4 버전 불일치로 `isView` export 누락 + Client Component 가 drizzle-zod 끌어와 build 실패. 순수 Zod 로 재작성, body=z.unknown() (구조 검증은 NewsBodyRenderer T12 담당).
- **Cache Components 패턴 학습**:
  1. Page 가 `async` + top-level `await params/searchParams` → "Uncached data was accessed outside of <Suspense>" 빌드 에러. 해결 — Page sync 유지, promise 를 Suspense 자식으로 전달 + 자식이 await.
  2. AdminSidebar 의 `usePathname()` 이 dynamic route prerender 시 uncached → 같은 에러. 해결 — layout 에서 `<Suspense fallback={SidebarSkeleton}><AdminSidebar/></Suspense>` 격리. 모든 어드민 페이지가 ◐ Partial Prerender 로 빌드 (정적 헤더 prerender + 동적 데이터 스트림).
- 3 페이지 (`/admin/news`, `/admin/news/new`, `/admin/news/[id]/edit`) 정상 ◐ 빌드.

### 구간 4 — 대시보드·로그아웃 (T11, commit `4000045`) + 본문 렌더러 (T12, commit `eecc992`)

- `/admin` page placeholder 교체: 최근 5건 + 카테고리 카운트 (활성만, 결정 로그 [T11]) + [+ 새 글 작성] 우측 상단.
- AdminSidebar 의 `<Link href="/admin/logout">` placeholder → `<form action={logoutAction}>` Server Action (`features/auth/actions.ts::logoutAction` — NextAuth signOut + /admin/login redirect). Route Handler 자체 생성 안 함 (결정 #16 일관).
- NewsBodyRenderer 분리: `sanitize.ts` (pure 함수, React/next 의존 0) + `news-body-renderer.tsx` (Server Component, next/image 사용). 단위 테스트 5건 모두 `sanitize.test.ts` 에서 pure 함수만 검증 — vitest 단독 (testing-library/jsdom 미설치).
- `vitest@4` 설치 + `vitest.config.ts` (alias `@` → `src`) + `test: "vitest run"` npm script.

### 결정 / 함정 (본 세션 신규)

**결정 #19 — drizzle-zod 제거, 순수 Zod**
- Client Component (NewsEditor) 가 `@/features/news/schemas` import → drizzle-zod 가 client bundle 로 끌려옴 + drizzle-orm 0.36.4 에 `isView` 미존재 build 실패.
- schemas.ts 가 `createInsertSchema(news)` 의존하지 않고 plain Zod `z.object({ title, body: z.unknown(), categoryId, coverImageUrl, publishedAt, tags })` 로 표현. body 의 구조 안전성은 NewsBodyRenderer (sanitize.ts) 가 별도 책임.

**결정 #20 — Cache Components Suspense 패턴 일반화**
- `cacheComponents: true` 환경에서:
  1. Page 본체는 sync, params/searchParams promise 를 Suspense 자식으로 전달
  2. layout 의 Client Component (usePathname/useState 등) 는 Suspense 로 격리
  3. `export const dynamic = "force-dynamic"` 미사용 (cacheComponents 와 비호환, 결정 #17)
- 모든 어드민 페이지 ◐ Partial Prerender 로 통일.

**결정 #21 — 본문 정화는 pure 함수 + DI**
- `sanitize.ts` 가 `isAllowedImageSrc: (url: string) => boolean` 을 인자로 받아 검증. 실제 사용처는 `isAllowedImagePublicUrl` (s3.ts) 주입. 테스트는 mock 주입.
- 모듈 로드 시점의 `process.env.NEXT_PUBLIC_S3_PUBLIC_URL` 캡처 회피 + 테스트 격리.

### Verify 결과

- `pnpm tsc --noEmit`: 0 error
- `pnpm lint`: 0 error
- `pnpm test`: 5/5 통과 (sanitize.test.ts)
- `pnpm build`: success. 어드민 5 페이지 (login=○, dashboard/categories/news/news/[id]/edit/news/new=◐), 사용자 사이트 / / dev/components=○, /api/auth/[...nextauth]=ƒ
- `cacheComponents [71007]` (Client Component function props) warning 5건 — TiptapEditor·CoverImageUploader·TagsInput 의 onChange/onError. 호출자가 모두 Client Component(NewsEditor) 라 실제 RSC boundary 안 넘음. 빌드 통과로 false positive 확인. 결정 로그 [T8].

### 본 세션 핵심 commit (`8b3e0cc` 이후 7개)

- `e7e7f7d` feat(d2): 뉴스 백엔드 query 분리 + transaction (T6~T7)
- `cde954e` feat(d2): Tiptap + 커버이미지 + 태그 입력 UI (T8)
- `33b638b` feat(d2): NewsEditor + NewsTable (T9)
- `4137ae3` feat(d2): /admin/news 라우트 3 페이지 (T10) + Cache Components 호환 패턴
- `4000045` feat(d2): 어드민 대시보드 + 로그아웃 (T11)
- `eecc992` feat(d2): NewsBodyRenderer + 5 단위 테스트 (T12)
- (다음 commit) docs(d2): Atomic Update + 결정 로그 최종 + checklist + context-notes (T13)

### 다음 — PR 생성

`feat/sprint-1-d2-admin` 브랜치를 `main` 으로 PR. 본문에 결정 로그 (`docs/plans/active/2026-05-28-sprint-1-d2-decisions.md`) 링크 + commit 11개 요약 + verify 결과 + codex consult v2 / `/qa` / `/review` 는 PR 생성 후 사용자가 선택.

---

## 어드민 v1.0 ship-전 하드닝 (2026-06-01, branch `feat/admin-ship-hardening`)

> plan `docs/plans/active/2026-06-01-admin-ship-hardening.md`. 다단 검토(ui-ux-pro-max·vercel·codex 독립·6축+evaluator) GO-WITH-FIXES → codex(gpt-5.5) plan v2 교정 3건 반영 후 실행.

### 핵심 결정·근거

- **A1 eligibility를 "검증 후 set"이 아니라 row FOR UPDATE + 확인 후 set으로** — codex가 "설정 시점 검증만으론 TOCTOU 잔존" 지적. 점유자 선해제 *전에* eligibility 확인해 검증 실패 시 기존 슬롯 보존(해제→실패 시 기존 점유자 유실 방지). 히어로 `setHeroOrder` 패턴 이식. → ADR-030.
- **A1b 상태전이 정리** — `setLandingSlot` 입구만 막으면 `updateNews`로 발행해제/카테고리변경 시 슬롯 고아화. 히어로도 동일 잠재버그였음(publishNews 경로만 clear). `slot-rules.ts` 순수 모듈로 정리 판정 추출(단위테스트 9). 정리 규칙 차이: 히어로=발행만, 랜딩=발행+쌀나눔.
- **A3 무효화는 `return null`** — codex 교정. `{}` 빈 토큰은 비-super 세션으로 남아 forbidden 루프. Auth.js는 null에서만 쿠키 정리. → ADR-031.
- **D1 DomainError 분리** — accounts식 일괄 generic화 시 categories 도메인 메시지 소실(codex). `lib/errors.ts`(의존성 0 — service에 NextAuth 미유입) + `lib/action-result.ts`(toActionError가 DomainError만 메시지). → ADR-032.
- **D2 어드민 pinned-only** — 공개 `listFeaturedGrid`(fallback 포함) 재사용 시 fallback 글이 "선택됨"+해제 no-op(codex). 어드민 page는 `listRiceSharingCandidates` 1쿼리 + pinned-only 매핑. 인라인 Drizzle 제거(3계층 정합).
- **A4 색대비** — ink-date 토큰 1개 상향(#959ba9 2.79:1 → #6f7682 4.58:1)으로 17개 사용처 일괄 해소(전부 밝은 배경 위 실제 정보 확인).
- **C1 모바일** — 3 테이블 `md` 분기(데스크탑 table / 모바일 카드). 액션 버튼 헬퍼 추출로 중복 회피.

### 검증

자동 게이트 통과: `src/` tsc 0·Next "Compiled successfully"·lint exit 0·vitest 31(기존 22 + slot-rules 9). **마이그레이션 0**(전부 로직·컴포넌트·토큰).

### 후속 해결 (사용자 피드백 2026-06-01)

- **#1 빌드 블로커 해결** — tsconfig `exclude` 에 `templates` 추가. `pnpm tsc`·`pnpm build` 그린(exit 0). 사용자: "추후 templates 구조 다시 잡아야"(v1.1, PR #9).
- **R7 해결(버그였음)** — 사용자 확인 "관리자 변경이 메인에 반영돼야 함, 지금 안 바뀌는 건 잘못". StorySection 고정 사진 → 지정 글 대표 이미지(클릭 시 소식 이동)+미지정 폴백. `StorySectionWithData`가 `listStorySlots` 연결, 배럴에 `StorySlotItem` export.
- **#3 rate limit** — Vercel 배포 확정 → Vercel Firewall 룰(코드 0, 배포 시) 확정. `docs/TODO.md` 배포 전 필수.

### 잔여 (라이브 수동)

- A1 5케이스·A2 동시저장·A3 세션무효화·C1 375px·R7 메인 반영을 `pnpm dev` UI 로 확인(tsx 단독은 `@/` alias 미해결). docker(postgres 5433 + minio) 가동 중.
