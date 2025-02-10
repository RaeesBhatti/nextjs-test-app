// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 0;

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true; // or false, to 404 on unknown paths

export async function generateStaticParams() {
  const posts = await fetch("https://api.vercel.app/blog").then((res) => res.json());
  return posts.map((post) => ({
    id: String(post.id),
  }));
}

export default async function Page(props) {
  const params = await props.params;
  const post = await fetch(`https://api.vercel.app/blog/${params.id}`, {
    next: { tags: [`blog${params.id}`], revalidate: 60 },
    cache: "force-cache",
  }).then((res) => res.json());
  return (
    <main>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </main>
  );
}
