"use client";

import Image from "next/image";
import { Bookmark, Heart, MessageSquare, Share2, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "../../_components/_common/Header";
import BlogHero from "../../_components/_blog/BlogHero";
import Container from "../../_components/_common/Cointainer";
import { commentsApi, favoritesApi, postsApi, type PostDto, votesApi } from "@/app/(services)/api";
import { defaultAvatarImage } from "@/types/blog";
import { useAuth } from "@/app/context/AuthContext";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", params.id],
    queryFn: () => postsApi.get(params.id),
    enabled: Boolean(params.id)
  });

  const updatePostCache = (updater: (post: PostDto) => PostDto) => {
    queryClient.setQueryData<PostDto>(["post", params.id], (current) => (current ? updater(current) : current));
  };

  const likeMutation = useMutation({
    mutationFn: () => votesApi.like(params.id),
    onSuccess: () => updatePostCache((current) => ({ ...current, likeCount: current.likeCount + 1 }))
  });

  const favoriteMutation = useMutation({
    mutationFn: () => favoritesApi.save(params.id),
    onSuccess: () => updatePostCache((current) => ({ ...current, favoriteCount: current.favoriteCount + 1 }))
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.create({ postId: params.id, content }),
    onSuccess: (created) => {
      updatePostCache((current) => ({ ...current, comments: [created, ...(current.comments ?? [])], commentCount: current.commentCount + 1 }));
      setComment("");
    }
  });

  async function handleLike() {
    if (!isAuthenticated) return setMessage("Vui lòng đăng nhập để like bài viết.");
    await likeMutation.mutateAsync();
  }

  async function handleFavorite() {
    if (!isAuthenticated) return setMessage("Vui lòng đăng nhập để lưu bài viết.");
    await favoriteMutation.mutateAsync();
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    if (!isAuthenticated) return setMessage("Vui lòng đăng nhập để bình luận.");
    await commentMutation.mutateAsync(comment.trim());
  }

  if (isLoading) {
    return <main className="min-h-screen bg-[#F7F8FC]"><Header /><Container className="py-12 text-gray-500">Loading review...</Container></main>;
  }

  if (error || !post) {
    return <main className="min-h-screen bg-[#F7F8FC]"><Header /><Container className="py-12"><div className="rounded-[28px] bg-white p-8 text-red-700 shadow-sm">{error instanceof Error ? error.message : "Review not found"}</div></Container></main>;
  }

  const authorName = post.author?.name;
  const avatar = post.author?.avatarUrl ?? defaultAvatarImage;

  return (
    <main className="min-h-screen bg-[#F7F8FC] pb-24">
      <Header />
      <Container className="max-w-5xl py-8 md:py-12">
        <BlogHero post={post} />
        {message ? <div className="mt-6 rounded-2xl bg-orange-50 px-5 py-4 text-orange-700">{message}</div> : null}

        <div className="mt-10 flex items-center gap-4 border-b border-gray-200 pb-8">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-100">
            <Image src={avatar} alt={authorName} fill className="object-cover" sizes="56px" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{authorName}</h3>
            <p className="text-gray-500">{post.restaurant?.name ?? "FreshBite Reviewer"}</p>
          </div>
        </div>

        <article className="prose prose-lg mt-10 max-w-none whitespace-pre-wrap text-gray-700">{post.content}</article>

        <div className="mt-12 flex items-center justify-between border-y border-gray-200 py-6">
          <div className="flex items-center gap-8 text-gray-700">
            <button onClick={handleLike} disabled={likeMutation.isPending} className="flex items-center gap-2 transition hover:text-emerald-600 disabled:opacity-50">
              <Heart size={20} /> <span>{post.likeCount}</span>
            </button>
            <div className="flex items-center gap-2"><MessageSquare size={20} /><span>{post.commentCount}</span></div>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <button onClick={handleFavorite} disabled={favoriteMutation.isPending} className="transition hover:text-emerald-600 disabled:opacity-50" aria-label="Save post"><Bookmark /></button>
            <button className="transition hover:text-emerald-600" aria-label="Share post"><Share2 /></button>
          </div>
        </div>

        <section className="mt-10 rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Comments</h2>
          <form onSubmit={submitComment} className="mt-5 flex gap-3">
            <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write your comment..." className="min-h-12 flex-1 rounded-2xl border border-gray-200 px-4 text-gray-900 outline-none focus:border-emerald-500" />
            <button disabled={commentMutation.isPending} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white disabled:opacity-60" type="submit"><Send size={18} /></button>
          </form>

          <div className="mt-6 space-y-5">
            {(post.comments ?? []).map((item) => (
              <div key={item.id} className="rounded-2xl bg-[#F7F8FC] p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100">
                    <Image src={item.author.avatarUrl ?? defaultAvatarImage} alt={item.author.name} fill className="object-cover" sizes="36px" />
                  </div>
                  <div><p className="font-medium text-gray-900">{item.author.name}</p><p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p></div>
                </div>
                <p className="mt-3 text-gray-700">{item.content}</p>
                {item.replies?.length ? <div className="mt-3 space-y-3 border-l-2 border-emerald-100 pl-4">{item.replies.map((reply) => <p key={reply.id} className="text-sm text-gray-600"><span className="font-medium">{reply.author.name}:</span> {reply.content}</p>)}</div> : null}
              </div>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
