import { SimplePool } from 'nostr-tools/pool';
import { finalizeEvent } from 'nostr-tools/pure';
import { hexToBytes } from '@noble/hashes/utils';

export interface LongformOptions {
  identifier: string; // Required 'd' tag for addressable events
  title?: string;
  summary?: string;
  image?: string;
  publishedAt?: number; // Unix timestamp
  topics?: string[]; // Hashtags/topics
}

export async function postLongform(
  privateKeyHex: string,
  content: string,
  options: LongformOptions,
  relays: string[]
): Promise<string> {
  const pool = new SimplePool();

  try {
    const privateKey = hexToBytes(privateKeyHex);

    // Build tags for the long-form content
    const tags: string[][] = [];

    // Required: identifier for addressable event
    tags.push(['d', options.identifier]);

    if (options.title) {
      tags.push(['title', options.title]);
    }

    if (options.summary) {
      tags.push(['summary', options.summary]);
    }

    if (options.image) {
      tags.push(['image', options.image]);
    }

    if (options.publishedAt) {
      tags.push(['published_at', options.publishedAt.toString()]);
    }

    if (options.topics) {
      for (const topic of options.topics) {
        tags.push(['t', topic.toLowerCase()]);
      }
    }

    // Create kind:30023 long-form content event (NIP-23)
    const event = finalizeEvent(
      {
        kind: 30023,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
      },
      privateKey
    );

    // Publish to all relays
    const results = await Promise.allSettled(pool.publish(relays, event));

    // Check if at least one relay succeeded
    const succeeded = results.filter(r => r.status === 'fulfilled').length;

    if (succeeded === 0) {
      throw new Error(`Failed to publish to all ${relays.length} relay(s)`);
    }

    return event.id;
  } finally {
    pool.close(relays);
  }
}

export function generateIdentifier(title?: string): string {
  // Generate a URL-friendly identifier
  if (title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 64); // Limit length
  }

  // Fallback to timestamp-based identifier
  return `article-${Date.now()}`;
}

export function extractFrontmatter(content: string): {
  frontmatter: Record<string, any>;
  markdown: string;
} {
  // Check for YAML frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, markdown: content };
  }

  const frontmatterText = match[1];
  const markdown = match[2];
  const frontmatter: Record<string, any> = {};

  // Simple YAML parser for common fields
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }

    // Handle arrays (simple comma-separated)
    if (key === 'tags' || key === 'topics') {
      frontmatter[key] = value.split(',').map(v => v.trim());
    } else {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, markdown };
}

export function extractTitleFromMarkdown(markdown: string): {
  title: string | undefined;
  content: string;
} {
  // Check if first line is a top-level header
  const lines = markdown.split('\n');
  const firstLine = lines[0]?.trim();

  if (firstLine && firstLine.startsWith('# ')) {
    const title = firstLine.substring(2).trim();
    // Remove the title line and any immediately following blank lines
    let contentStartIndex = 1;
    while (contentStartIndex < lines.length && lines[contentStartIndex].trim() === '') {
      contentStartIndex++;
    }
    const content = lines.slice(contentStartIndex).join('\n');
    return { title, content };
  }

  return { title: undefined, content: markdown };
}
