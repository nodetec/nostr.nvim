import {
  hexToBytes
} from "./chunk-SLYNB64A.js";

// src/lib/longform.ts
import { SimplePool } from "nostr-tools/pool";
import { finalizeEvent } from "nostr-tools/pure";
async function postLongform(privateKeyHex, content, options, relays) {
  const pool = new SimplePool();
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const tags = [];
    tags.push(["d", options.identifier]);
    if (options.title) {
      tags.push(["title", options.title]);
    }
    if (options.summary) {
      tags.push(["summary", options.summary]);
    }
    if (options.image) {
      tags.push(["image", options.image]);
    }
    if (options.publishedAt) {
      tags.push(["published_at", options.publishedAt.toString()]);
    }
    if (options.topics) {
      for (const topic of options.topics) {
        tags.push(["t", topic.toLowerCase()]);
      }
    }
    const event = finalizeEvent(
      {
        kind: 30023,
        created_at: Math.floor(Date.now() / 1e3),
        tags,
        content
      },
      privateKey
    );
    const results = await Promise.allSettled(pool.publish(relays, event));
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === 0) {
      throw new Error(`Failed to publish to all ${relays.length} relay(s)`);
    }
    return event.id;
  } finally {
    pool.close(relays);
  }
}
function generateIdentifier(title) {
  if (title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 64);
  }
  return `article-${Date.now()}`;
}
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  if (!match) {
    return { frontmatter: {}, markdown: content };
  }
  const frontmatterText = match[1];
  const markdown = match[2];
  const frontmatter = {};
  const lines = frontmatterText.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    if (key === "tags" || key === "topics") {
      frontmatter[key] = value.split(",").map((v) => v.trim());
    } else {
      frontmatter[key] = value;
    }
  }
  return { frontmatter, markdown };
}
function extractTitleFromMarkdown(markdown) {
  const lines = markdown.split("\n");
  const firstLine = lines[0]?.trim();
  if (firstLine && firstLine.startsWith("# ")) {
    const title = firstLine.substring(2).trim();
    let contentStartIndex = 1;
    while (contentStartIndex < lines.length && lines[contentStartIndex].trim() === "") {
      contentStartIndex++;
    }
    const content = lines.slice(contentStartIndex).join("\n");
    return { title, content };
  }
  return { title: void 0, content: markdown };
}
export {
  extractFrontmatter,
  extractTitleFromMarkdown,
  generateIdentifier,
  postLongform
};
