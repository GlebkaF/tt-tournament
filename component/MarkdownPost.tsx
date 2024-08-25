"use client";
import { ImageObject, Post, FreshPost } from "@/interface";
import Image from "next/image";
import PostNavigation from "./post-navigation";
import MarkdownContent from "@/component/markdown-content";
import InfiniteContent from "@/component/infinite-content/infinite-content";
import { useEffect, useState } from "react";
import React, { ReactNode } from "react";

interface Props {
  // md разметка
  post: Post;
  image: ImageObject | null;
  showNavigation: boolean;
  popularPosts?: Post[];
  freshArticles?: Record<string, FreshPost[]>;
  children?: ReactNode;
}

export function MarkdownPost({ post, image }: Props): JSX.Element {
  const { id: postId, content } = post;

  const [articleIds, setArticleIds] = useState<string[]>([]);

  useEffect(() => {
    if (postId) {
      setArticleIds([`article${postId}`]);
    }
  }, [postId]);

  return (
    <div className="flex gap-40">
      <article className="w-[800px] tablet:w-full">
        {image ? (
          <Image
            src={image.url}
            alt="article image"
            width={image.width}
            height={image.height}
            priority={true}
            title="article image"
          ></Image>
        ) : null}
        <MarkdownContent content={content} postId={postId} />
      </article>
    </div>
  );
}
