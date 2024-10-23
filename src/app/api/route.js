import { revalidateTag } from "next/cache";

export async function GET(request) {
  revalidateTag("ding");

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
        "Edge-Cache-Control": `max-age=15`,
        "Edge-Cache-Tags": `ding dong`,
      },
    },
  );
}
