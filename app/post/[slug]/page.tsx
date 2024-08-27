import MarkdownContent from "@/component/MarkdownContent";
import PlayoffTable from "@/component/PlayoffTable";
import createDeps from "@/service/create-deps";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const { postService } = createDeps();

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await postService.getPostBySlug(params.slug);
  if (!post) {
    return {};
  }

  const { title, description, slug, image } = post;
  const url = "https://ebtt.ru/post/" + slug;
  const images = [
    {
      url: image.src,
      width: image.width,
      height: image.height,
      alt: "Фото поста",
    },
  ];

  return {
    metadataBase: new URL("https://ebtt.ru/"),
    title: title + " — Теннис. Евроберег",
    description,
    openGraph: {
      title,
      description,
      url,
      images,
    },
    twitter: {
      title,
      description,
      images,
    },
    robots: "index, follow",
    alternates: {
      canonical: url,
    },
  };
}

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  const posts = await postService.getAllPosts();

  const routes = posts.map((post) => ({
    slug: post.slug,
  }));

  return routes;
};

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await postService.getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container pb-32 pt-24">
      <div className="flex mb-8 justify-between">
        <p className="text-secondary-base">{post.author}</p>
        <p className="text-secondary-base">
          {post.date.toLocaleDateString("ru")}
        </p>
      </div>
      <MarkdownContent content={post.content}></MarkdownContent>
    </div>
  );
}
