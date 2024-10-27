const { inspect } = require("node:util");
const { Agent } = require("node:http");

const agent = new Agent({
  keepAlive: true,
});

const EnvTildaDeploymentId = process.env.TILDA_DEPLOYMENT_ID;
const EnvTildaCacheApiBaseUrl = process.env.TILDA_CACHE_API_BASE_URL;

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    console.log("CacheHandler.get", key);
    // This could be stored anywhere, like durable storage
    const cacheUrl = `${EnvTildaCacheApiBaseUrl}?key=${encodeURIComponent(key)}`;
    const response = await fetch(cacheUrl, {
      cache: "no-store",
      agent: agent,
      headers: {
        Authorization: EnvTildaDeploymentId,
      },
    });
    if (!response.ok) {
      console.warn("CacheHandler.get", "Cache miss", key);
      return null;
    }

    const cachedItem = await response.json();

    const body =
      Array.isArray(cachedItem.value?.body?.data) && cachedItem.value?.body?.type === "Buffer"
        ? Buffer.from(cachedItem.value.body.data)
        : cachedItem.value.body?.type === "BufferBase64"
          ? Buffer.from(cachedItem.value.body.data, "base64")
          : cachedItem.value.body;

    return { value: { ...cachedItem.value, body: body }, tags: cachedItem.tags, lastModified: cachedItem.lastModifiedAtEpochMs };
  }

  async set(key, data, ctx) {
    const cacheUrl = `${EnvTildaCacheApiBaseUrl}?key=${encodeURIComponent(key)}`;

    const payload = JSON.stringify(
      {
        key,
        value: data,
        tags: ctx.tags || [],
        expiresInSeconds: ctx.revalidate || 0,
        kind: data.kind === "ROUTE" ? "httpResponse" : "json",
      },
      (key, value) => {
        if (value?.type === "Buffer" && Array.isArray(value?.data)) {
          value.data = Buffer.from(value.data).toString("base64");
          value.type = "BufferBase64";
        }

        return value;
      },
    );

    console.log("CacheHandler.set payload:", payload);

    const response = await fetch(cacheUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: EnvTildaDeploymentId,
      },
      body: payload,
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

    const cacheUrl = `${EnvTildaCacheApiBaseUrl}?key=${encodeURIComponent(key)}`;

    const response = await fetch(cacheUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: EnvTildaDeploymentId,
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
