<!-- templates/ 폴더의 deprecation 안내와 새 repo 위치를 명시하는 가이드 -->

# templates/ — DEPRECATED (별도 repo 이전 완료)

> 이 폴더는 더 이상 다운스트림 사용 대상이 아닙니다. 새 repo 를 사용하세요.

## 새 위치

**https://github.com/woosung-dev/agy-templates**

## 현재 상태

- 이 폴더 안의 `monorepo-base/` + `lean-monorepo-base/` 는 *PR 추적용 스냅샷* 입니다 (commit `21621dd`, `b24ae8e`).
- 새 작업·개선·다운스트림 복제는 **반드시 새 repo (`agy-templates`)** 에서 진행합니다.
- 이 폴더는 PR 히스토리·역사 추적 목적으로 *당분간만 보존* 합니다.

## 다운스트림 행동 지침

- 신규 프로젝트 부트스트랩 → `agy-templates` clone / template repo 사용
- 기존 ffwpu-social 디렉토리 내 `templates/*` 경로 참조 → 새 repo URL 로 교체
- 이 폴더 안 파일을 수정하지 마세요. 변경은 `agy-templates` 에서.

## 향후 정리

- ffwpu-social 자체 마이그레이션 시점 (별도 repo 분리·monorepo 전환)에 이 폴더의 *완전 삭제* 를 검토합니다.
- 삭제 PR 전, 모든 다운스트림 참조가 `agy-templates` 로 옮겨졌는지 확인합니다.
