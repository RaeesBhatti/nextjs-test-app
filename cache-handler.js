module.exports = class CacheHandler {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    console.log("cache trying to get", key);
    return null;
  }

  async set(key, value, ctx) {
    console.log("cache setting", key, value, ctx);
  }

  async revalidateTag(tagOrTags) {
    console.log("cache revalidating", tagOrTags);
  }
};
