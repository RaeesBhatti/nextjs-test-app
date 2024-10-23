const { inspect } = require("node:util");
const { Agent } = require("node:http");

const agent = new Agent({
  keepAlive: true,
});

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    console.log("CacheHandler.get", key);
    // This could be stored anywhere, like durable storage
    const cacheUrl = new URL("http://127.0.0.1:1337/v1/cache");
    cacheUrl.searchParams.set("key", key);
    const response = await fetch(cacheUrl.toString(), {
      cache: "no-store",
      agent: agent,
    });
    if (!response.ok) {
      console.warn("CacheHandler.get", "Cache miss", key);
      return null;
    }

    const cachedItem = await response.json();
    return { value: cachedItem.value.json, tags: cachedItem.tags, lastModified: cachedItem.lastModifiedAtEpochMs };
  }

  async set(key, data, ctx) {
    console.log("CacheHandler.set key:", key);
    console.log("CacheHandler.set data:", data);
    console.log("CacheHandler.set ctx:", ctx);

    const cacheUrl = new URL("http://127.0.0.1:1337/v1/cache");

    const response = await fetch(cacheUrl.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, value: { json: data }, tags: ctx.tags, expiresInSeconds: ctx.revalidate || 0 }),
      cache: "no-store",
      agent: agent,
    });

    if (!response.ok) {
      console.error("CacheHandler.set", "Failed to set cache", key, response.status, response.statusText);

      return;
    }

    console.log("CacheHandler.set", "Set cache", key);
  }

  async revalidateTag(tag) {
    console.log("CacheHandler.revalidateTag", tag);

    const tags = Array.isArray(tag) ? tag : [tag];
    for (const tag of tags) {
      if (typeof tag !== "string") {
        throw new Error(`Expected tag to be a string, but got ${inspect(tag)}`);
      }
    }

    if (tags.length < 1) {
      console.warn("CacheHandler.revalidateTag", "No tags provided");
      return;
    }

    const cacheUrl = new URL("http://127.0.0.1:1337/v1/cache");

    const response = await fetch(cacheUrl.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: tags }),
      cache: "no-store",
      agent: agent,
    });

    if (!response.ok) {
      console.error("CacheHandler.revalidateTag", "Failed to revalidate tag", tag, response.status, response.statusText);

      return;
    }

    console.log("CacheHandler.revalidateTag", "Revalidated tag", tag);
  }
};
