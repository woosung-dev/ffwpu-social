// 스토리지 driver 레지스트리 — 부팅 시 1개 driver 등록, 액션은 getStorage() 호출
import { StorageError, type StorageDriver } from "./types";

let driver: StorageDriver | null = null;

export function registerStorage(d: StorageDriver): void {
  driver = d;
}

export function getStorage(): StorageDriver {
  if (!driver) {
    throw new StorageError(
      "NOT_CONFIGURED",
      "storage driver 미등록 — apps/*/storage.ts 에서 registerStorage() 호출 필요",
    );
  }
  return driver;
}

// 테스트/SSR 환경에서 driver 없이도 안전하게 동작해야 할 때
export function tryGetStorage(): StorageDriver | null {
  return driver;
}
