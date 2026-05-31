// 어드민 소식 도메인의 서버 액션 - 폼 submit 진입점 (인증·검증·revalidate)
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createNewsItem,
  updateNewsItem,
  deleteNewsItem,
} from "./service";
import { newsStatusEnum } from "./schemas";

async function requireSuper() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("로그인이 필요합니다");
  }
  return session.user;
}

function parseFormBase(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    body: String(formData.get("body") ?? ""),
    categoryId: (formData.get("categoryId") as string | null) || null,
    status: newsStatusEnum.parse(formData.get("status") ?? "draft"),
  };
}

export async function createNews(formData: FormData) {
  await requireSuper();
  const created = await createNewsItem(parseFormBase(formData));
  revalidatePath("/news");
  revalidatePath("/dashboard");
  redirect(`/news/${created.id}/edit`);
}

export async function updateNews(formData: FormData) {
  await requireSuper();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id 누락");
  await updateNewsItem({ id, ...parseFormBase(formData) });
  revalidatePath("/news");
  revalidatePath(`/news/${id}/edit`);
  revalidatePath("/dashboard");
}

export async function deleteNews(formData: FormData) {
  await requireSuper();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id 누락");
  await deleteNewsItem(id);
  revalidatePath("/news");
  revalidatePath("/dashboard");
  redirect("/news");
}
