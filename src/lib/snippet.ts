import { SimplePool } from 'nostr-tools/pool';
import { finalizeEvent } from 'nostr-tools/pure';
import { hexToBytes } from '@noble/hashes/utils';

export interface SnippetOptions {
  language?: string;
  name?: string;
  extension?: string;
  description?: string;
  runtime?: string;
  license?: string;
  dependencies?: string[];
  repo?: string;
}

export async function postSnippet(
  privateKeyHex: string,
  content: string,
  options: SnippetOptions,
  relays: string[]
): Promise<string> {
  const pool = new SimplePool();

  try {
    const privateKey = hexToBytes(privateKeyHex);

    // Build tags for the snippet
    const tags: string[][] = [];

    if (options.language) {
      tags.push(['l', options.language.toLowerCase()]);
    }

    if (options.name) {
      tags.push(['name', options.name]);
    }

    if (options.extension) {
      tags.push(['extension', options.extension]);
    }

    if (options.description) {
      tags.push(['description', options.description]);
    }

    if (options.runtime) {
      tags.push(['runtime', options.runtime]);
    }

    if (options.license) {
      tags.push(['license', options.license]);
    }

    if (options.dependencies) {
      for (const dep of options.dependencies) {
        tags.push(['dep', dep]);
      }
    }

    if (options.repo) {
      tags.push(['repo', options.repo]);
    }

    // Create kind:1337 code snippet event (NIP-C0)
    const event = finalizeEvent(
      {
        kind: 1337,
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
    const failed = results.filter(r => r.status === 'rejected').length;

    if (succeeded === 0) {
      throw new Error(`Failed to publish to all ${relays.length} relay(s)`);
    }

    return event.id;
  } finally {
    pool.close(relays);
  }
}

export function detectLanguageFromExtension(extension: string): string {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    lua: 'lua',
    sh: 'bash',
    bash: 'bash',
    zsh: 'zsh',
    fish: 'fish',
    vim: 'vim',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    md: 'markdown',
    sql: 'sql',
    ex: 'elixir',
    exs: 'elixir',
    erl: 'erlang',
    clj: 'clojure',
    hs: 'haskell',
    scala: 'scala',
    r: 'r',
    m: 'objective-c',
    pl: 'perl',
    dart: 'dart',
    elm: 'elm',
    fs: 'fsharp',
    lisp: 'lisp',
    ml: 'ocaml',
    nim: 'nim',
    pas: 'pascal',
    proto: 'protobuf',
    sol: 'solidity',
    tex: 'latex',
    vb: 'vb',
    zig: 'zig',
  };

  return languageMap[extension.toLowerCase()] || extension.toLowerCase();
}

export function getFileExtension(filename: string): string | undefined {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1] : undefined;
}
