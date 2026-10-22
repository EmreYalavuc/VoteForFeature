import { FeatureRequest, User, Vote, Comment, Product, FeatureStatus, Review, ProductCategory, ReviewLike, ReviewUnlock } from "@prisma/client";

export type ProductWithMeta = Product & {
  owner: Pick<User, "id" | "name" | "image">;
  _count: { features: number; reviews: number };
  avgRating?: number;
};

export type ProductWithReviews = ProductWithMeta & {
  reviews: ReviewWithAuthor[];
};

export type ReviewWithAuthor = Review & {
  author: Pick<User, "id" | "name" | "image">;
  likes: ReviewLike[];
  unlocks: ReviewUnlock[];
};

export type FeatureWithMeta = FeatureRequest & {
  author: Pick<User, "id" | "name" | "image">;
  votes: Vote[];
  comments?: Comment[];
  _count: { votes?: number; comments: number };
  upvotes: number;
  downvotes: number;
  userVote?: Vote | null;
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "image">;
};

export type SortOption = "trending" | "top" | "newest" | "oldest";

export type FilterOptions = {
  status?: FeatureStatus | "all";
  category?: string;
  sort?: SortOption;
};

export { FeatureStatus, ProductCategory };
export type { ReviewLike, ReviewUnlock };
