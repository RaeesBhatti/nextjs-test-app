import { format } from "node:util";

export async function POST(request) {
  console.log("POST request", request);

  return new Response(JSON.stringify({ status: "received" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Edge-Cache-Control": `max-age=100`,
      "Edge-Cache-Tags": `ding dong`,
    },
  });
}
