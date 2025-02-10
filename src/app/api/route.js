import { revalidateTag, revalidatePath } from "next/cache";

export async function GET(request) {
  const url = new URL(request.url);
  const purgeTag = url.searchParams.get("purgeTag");
  if (purgeTag) {
    revalidateTag(purgeTag);
  }

  return new Response(
    JSON.stringify({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: await request.text(),
    }),
    {
      status: 200,
      headers: {
        "Tilda-Cache-Tags": "ding dong",
        // "Tilda-Cache-Control": "max-age=30",
        "Cache-Control": "max-age=0, stale-while-revalidate",
      },
    },
  );
}
