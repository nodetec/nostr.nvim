import {
  hexToBytes
} from "./chunk-SLYNB64A.js";

// src/lib/snippet.ts
import { SimplePool } from "nostr-tools/pool";
import { finalizeEvent } from "nostr-tools/pure";
async function postSnippet(privateKeyHex, content, options, relays) {
  const pool = new SimplePool();
  try {
    const privateKey = hexToBytes(privateKeyHex);
    const tags = [];
    if (options.language) {
      tags.push(["l", options.language.toLowerCase()]);
    }
    if (options.name) {
      tags.push(["name", options.name]);
    }
    if (options.extension) {
      tags.push(["extension", options.extension]);
    }
    if (options.description) {
      tags.push(["description", options.description]);
    }
    if (options.runtime) {
      tags.push(["runtime", options.runtime]);
    }
    if (options.license) {
      tags.push(["license", options.license]);
    }
    if (options.dependencies) {
      for (const dep of options.dependencies) {
        tags.push(["dep", dep]);
      }
    }
    if (options.repo) {
      tags.push(["repo", options.repo]);
    }
    if (options.tags) {
      for (const tag of options.tags) {
        tags.push(["t", tag.toLowerCase()]);
      }
    }
    const event = finalizeEvent(
      {
        kind: 1337,
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
function detectLanguageFromExtension(extension) {
  const languageMap = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    lua: "lua",
    sh: "bash",
    bash: "bash",
    zsh: "zsh",
    fish: "fish",
    vim: "vim",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    md: "markdown",
    sql: "sql",
    ex: "elixir",
    exs: "elixir",
    erl: "erlang",
    clj: "clojure",
    hs: "haskell",
    scala: "scala",
    r: "r",
    m: "objective-c",
    pl: "perl",
    dart: "dart",
    elm: "elm",
    fs: "fsharp",
    lisp: "lisp",
    ml: "ocaml",
    nim: "nim",
    pas: "pascal",
    proto: "protobuf",
    sol: "solidity",
    tex: "latex",
    vb: "vb",
    zig: "zig"
  };
  return languageMap[extension.toLowerCase()] || extension.toLowerCase();
}
function getFileExtension(filename) {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1] : void 0;
}
export {
  detectLanguageFromExtension,
  getFileExtension,
  postSnippet
};
