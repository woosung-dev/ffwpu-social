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

