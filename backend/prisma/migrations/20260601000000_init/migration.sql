CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "RoleName" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "PriceRange" AS ENUM ('CHEAP', 'MODERATE', 'EXPENSIVE', 'LUXURY');
CREATE TYPE "VoteType" AS ENUM ('LIKE');
CREATE TYPE "NotificationType" AS ENUM ('COMMENT', 'REPLY', 'VOTE', 'FAVORITE', 'POST_APPROVED', 'SYSTEM');

CREATE TABLE "Role" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" "RoleName" NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "googleId" TEXT,
  "name" TEXT NOT NULL,
  "bio" TEXT,
  "avatarUrl" TEXT,
  "roleId" UUID NOT NULL,
  "refreshTokenHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Restaurant" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT NOT NULL,
  "area" TEXT,
  "city" TEXT,
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "phone" TEXT,
  "website" TEXT,
  "priceRange" "PriceRange" NOT NULL DEFAULT 'MODERATE',
  "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0,
  "ratingCount" INTEGER NOT NULL DEFAULT 0,
  "coverImage" TEXT,
  "categoryId" UUID,
  "createdById" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantImage" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "restaurantId" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "publicId" TEXT,
  "alt" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "RestaurantImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Post" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "readTime" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "authorId" UUID NOT NULL,
  "restaurantId" UUID,
  "categoryId" UUID,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "favoriteCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostImage" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "postId" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "publicId" TEXT,
  "alt" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "postId" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "parentId" UUID,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vote" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "postId" UUID NOT NULL,
  "type" "VoteType" NOT NULL DEFAULT 'LIKE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Favorite" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "postId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostTag" (
  "postId" UUID NOT NULL,
  "tagId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId", "tagId")
);

CREATE TABLE "Notification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "recipientId" UUID NOT NULL,
  "actorId" UUID,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "postId" UUID,
  "commentId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE UNIQUE INDEX "Vote_userId_postId_key" ON "Vote"("userId", "postId");
CREATE UNIQUE INDEX "Favorite_userId_postId_key" ON "Favorite"("userId", "postId");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

CREATE INDEX "Role_deletedAt_idx" ON "Role"("deletedAt");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");
CREATE INDEX "User_email_deletedAt_idx" ON "User"("email", "deletedAt");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");
CREATE INDEX "Restaurant_name_idx" ON "Restaurant"("name");
CREATE INDEX "Restaurant_area_idx" ON "Restaurant"("area");
CREATE INDEX "Restaurant_city_idx" ON "Restaurant"("city");
CREATE INDEX "Restaurant_priceRange_idx" ON "Restaurant"("priceRange");
CREATE INDEX "Restaurant_ratingAvg_idx" ON "Restaurant"("ratingAvg");
CREATE INDEX "Restaurant_categoryId_idx" ON "Restaurant"("categoryId");
CREATE INDEX "Restaurant_deletedAt_idx" ON "Restaurant"("deletedAt");
CREATE INDEX "RestaurantImage_restaurantId_position_idx" ON "RestaurantImage"("restaurantId", "position");
CREATE INDEX "RestaurantImage_deletedAt_idx" ON "RestaurantImage"("deletedAt");
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "Post_restaurantId_idx" ON "Post"("restaurantId");
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");
CREATE INDEX "Post_published_deletedAt_createdAt_idx" ON "Post"("published", "deletedAt", "createdAt");
CREATE INDEX "Post_rating_idx" ON "Post"("rating");
CREATE INDEX "Post_likeCount_idx" ON "Post"("likeCount");
CREATE INDEX "Post_viewCount_idx" ON "Post"("viewCount");
CREATE INDEX "Post_deletedAt_idx" ON "Post"("deletedAt");
CREATE INDEX "PostImage_postId_position_idx" ON "PostImage"("postId", "position");
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX "Vote_postId_idx" ON "Vote"("postId");
CREATE INDEX "Favorite_postId_idx" ON "Favorite"("postId");
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");
CREATE INDEX "PostTag_tagId_idx" ON "PostTag"("tagId");
CREATE INDEX "Notification_recipientId_readAt_createdAt_idx" ON "Notification"("recipientId", "readAt", "createdAt");
CREATE INDEX "Notification_actorId_idx" ON "Notification"("actorId");
CREATE INDEX "Notification_postId_idx" ON "Notification"("postId");
CREATE INDEX "Notification_commentId_idx" ON "Notification"("commentId");

ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RestaurantImage" ADD CONSTRAINT "RestaurantImage_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Role" ("name", "description") VALUES
('USER', 'Default application user'),
('MODERATOR', 'Can moderate restaurants, posts and comments'),
('ADMIN', 'Full administrative access');

INSERT INTO "Category" ("name", "slug", "description") VALUES
('Street Food', 'street-food', 'Casual and street-side dining'),
('Fine Dining', 'fine-dining', 'Premium dining experiences'),
('Healthy Eat', 'healthy-eat', 'Healthy and plant-based choices'),
('Cafe', 'cafe', 'Coffee shops and dessert spots');
