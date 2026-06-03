<!-- 시드 커버 이미지 배치 폴더 — seed.ts 가 여기를 1순위로 조회 후 MinIO 업로드 -->

# seed-assets — 시드 커버 사진 배치

`pnpm db:seed` 실행 시 이 폴더의 파일을 **canonical 파일명**으로 조회해 MinIO(`news/seed/<파일명>`)에 업로드하고, 해당 소식의 `coverImageUrl`로 연결한다. 파일이 없으면 `public/images/`의 Figma 추출 자산으로 폴백한다(경고 출력).

## 사회공헌국 실사진 수령 시 (11장)

아래 이름으로 저장하면 재시드 한 번으로 교체된다. (jpg/png/webp, 각 5MB 이하)

| canonical 파일명 | 연결 소식 (랜딩 슬롯) | Figma 슬롯 권장 비율 |
|---|---|---|
| `story-card1.png` | 감사의 마음을 담은 쌀 10kg (Story 슬롯 1 — 큰 카드) | 916×786 가로 |
| `story-card2.png` | 흑석종합사회복지관 쌀 60kg (Story 슬롯 2 — 정방형) | 572×768 |
| `articlegrid-card1.png` | 한식 행사 쌀 화환 320kg (featured 1·hero 1) | 556×436 |
| `articlegrid-card2.png` | 어르신 가정 쌀 50포대 (featured 2·hero 2) | 556×~830 세로 가능 |
| `articlegrid-card3.png` | 누적 80,000가정 돌파 (featured 3) | 556×436 |
| `articlegrid-card4.png` | 삼태기마을 (featured 6) | 556×436 |
| `articlegrid-card5.png` | 쌀 화환 기부 릴레이 (hero 3) | 556×436 |
| `articlegrid-card6.png` | 설맞이 쌀 나눔 (featured 미지정) | 556×436 |
| `featured-image50.png` | 가족 치유 캠프 30회차 (hero 4) | 916×786 |

- **KPI 보라 카드 사진 1장**은 시드 대상이 아님 — `public/images/kpi-purple-card-photo.png` 직접 덮어쓰기 (섹션 장식 자산).
- 잔여 1장은 예비 (커버 없는 소식에 추가 배정 가능).

## 주의 (도메인 절대 제약 — 개인정보)

얼굴이 식별되는 사진은 **당사자 동의 확인 + 필요 시 모자이크/가명 처리 후**에만 배치한다 (ADR-004). 공개 사이트에 그대로 서빙된다.
