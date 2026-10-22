import { FeatureRequest, User, Vote, Comment, Product, FeatureStatus } from "@prisma/client";

export type FeatureWithMeta = FeatureRequest & {
  author: Pick<User, "id" | "name" | "image">;
  votes: Vote[];
  comments?: Comment[];
  _count: { votes?: number; comments: number };
  upvotes: number;
  downvotes: number;
  userVote?: Vote | null;
};

export type ProductWithMeta = Product & {
  owner: Pick<User, "id" | "name" | "image">;
  _count: { features: number };
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

export { FeatureStatus };
