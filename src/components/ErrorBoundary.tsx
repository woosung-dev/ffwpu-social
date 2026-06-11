// 자식 서브트리의 렌더 에러를 잡아 폴백으로 격리하는 Client ErrorBoundary — 한 영역(예: 분석 카드) 실패가 페이지 전체를 죽이지 않도록 부분 degrade 용
"use client";

import { Component, type ReactNode } from "react";

type Props = {
  /** 에러 발생 시 children 대신 렌더할 폴백 */
  fallback: ReactNode;
  children: ReactNode;
};

type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // 격리하되 삼키지 않음 — 원인은 콘솔/서버 로그로 노출
    console.error("[ErrorBoundary]", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
