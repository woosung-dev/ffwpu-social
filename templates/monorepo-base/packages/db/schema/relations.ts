// Drizzle 관계 정의 — query.with(...) 접근 활성화 (테이블 정의와 분리해 순환 import 회피)
import { relations } from "drizzle-orm";

import { categories } from "./categories";
import { heartEvents } from "./heart-events";
import { news } from "./news";
import { newsTags, tags } from "./news-tags";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  authoredNews: many(news),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  news: many(news),
}));

export const newsRelations = relations(news, ({ one, many }) => ({
  category: one(categories, {
    fields: [news.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [news.authorId],
    references: [users.id],
  }),
  newsTags: many(newsTags),
  heartEvents: many(heartEvents),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  newsTags: many(newsTags),
}));

export const newsTagsRelations = relations(newsTags, ({ one }) => ({
  news: one(news, {
    fields: [newsTags.newsId],
    references: [news.id],
  }),
  tag: one(tags, {
    fields: [newsTags.tagId],
    references: [tags.id],
  }),
}));

export const heartEventsRelations = relations(heartEvents, ({ one }) => ({
  news: one(news, {
    fields: [heartEvents.newsId],
    references: [news.id],
  }),
}));
