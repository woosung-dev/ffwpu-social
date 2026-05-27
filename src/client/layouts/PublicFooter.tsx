// 사용자 사이트 푸터 — Figma news-detail (93:8810) 명세: 다크 띠 한 줄 카피라이트만. Server Component
// Figma 미존재 영역 (SNS 아이콘·내부 링크·사회공헌국 정보 분리 영역) 은 D-3 시안 적용 시 별도 섹션으로 도입
export function PublicFooter() {
  return (
    <footer className="bg-surface-dark text-white/60">
      <div className="container mx-auto flex items-center justify-center px-4 py-4 lg:px-8">
        <p className="text-xs">
          COPYRIGHT 2026 © Sow Good All rights reserved.
        </p>
      </div>
    </footer>
  );
}
