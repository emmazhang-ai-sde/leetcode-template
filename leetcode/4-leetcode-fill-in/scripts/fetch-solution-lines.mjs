#!/usr/bin/env node
/**
 * 从老师 GitHub 上的 .py（或本地文件）得到源码，打印 **T/CM 行骨架**（供参考）。
 * 挖空请直接改 chapters/ch01 下对应 HTML 的 table#ct，然后 `npm run build:ch01`。
 *
 * 用法：
 *   node scripts/fetch-solution-lines.mjs 34
 *   node scripts/fetch-solution-lines.mjs 34 --github-filename="34. Custom Name.py"
 *   node scripts/fetch-solution-lines.mjs --file ~/Downloads/34.py
 *   node scripts/fetch-solution-lines.mjs --url "https://raw.githubusercontent.com/.../file.py"
 */

import fs from 'fs';
import { PROBLEMS_META } from './ch01-problems.mjs';

function parseArgs(argv) {
  const out = {
    num: null,
    githubFilename: null,
    file: null,
    url: null,
    branch: 'master',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file') out.file = argv[++i];
    else if (a === '--url') out.url = argv[++i];
    else if (a.startsWith('--github-filename='))
      out.githubFilename = a.slice('--github-filename='.length).replace(/^"|"$/g, '');
    else if (a === '--branch') out.branch = argv[++i];
    else if (/^\d+$/.test(a)) out.num = a;
  }
  return out;
}

function problemMeta(num) {
  const p = PROBLEMS_META.find((x) => x.num === String(num));
  if (!p) {
    console.error(
      `Unknown problem number "${num}" in PROBLEMS_META. Add it to scripts/ch01-manifest.json, run npm run build:ch01, or use --file / --url.`
    );
    process.exit(1);
  }
  return p;
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

function rawUrlForProblem(num, name, githubFilename, branch) {
  const file =
    githubFilename != null && String(githubFilename).trim() !== ''
      ? String(githubFilename).trim()
      : `${String(num).trim()}. ${String(name).trim()}.py`;
  const base = `https://raw.githubusercontent.com/QiuzhiLyon/Algo_class/${branch}/Python/`;
  return base + encodeURIComponent(file);
}

/** 与 generate-ch01-html 中 T / CM 一致 */
function sourceToLinesBlock(source) {
  const normalized = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const rows = lines.map((line) => {
    if (/^\s*#/.test(line)) {
      return `      [CM(${JSON.stringify(line)})],`;
    }
    return `      [T(${JSON.stringify(line)})],`;
  });
  return rows.join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  let source;

  if (args.file) {
    source = fs.readFileSync(args.file, 'utf8');
    console.error(`Read ${args.file} (${source.length} chars)\n`);
  } else if (args.url) {
    source = await fetchText(args.url);
    console.error(`Fetched ${args.url} (${source.length} chars)\n`);
  } else if (args.num) {
    const p = problemMeta(args.num);
    const url = rawUrlForProblem(
      p.num,
      p.name,
      args.githubFilename,
      args.branch
    );
    console.error(`Trying: ${url}\n`);
    try {
      source = await fetchText(url);
    } catch (e) {
      console.error(String(e.message));
      console.error(
        '\n若 404：仓库可能为私有、分支不是 master，或文件名与老师仓库不一致。' +
          '可：\n' +
          '  1) 用 --branch main 再试；\n' +
          '  2) 用 --github-filename="精确文件名.py"；\n' +
          '  3) 浏览器打开本题 .py → Raw → 复制 --url "..."；\n' +
          '  4) 下载后用 --file path/to/34.py\n'
      );
      process.exit(1);
    }
  } else {
    console.error(
      'Usage: node scripts/fetch-solution-lines.mjs <num> [--github-filename="..."] [--branch master]\n' +
        '   or: node scripts/fetch-solution-lines.mjs --file <path>\n' +
        '   or: node scripts/fetch-solution-lines.mjs --url <raw-github-url>'
    );
    process.exit(1);
  }

  const block = sourceToLinesBlock(source);
  const num = args.num || '(see scripts/ch01-manifest.json)';
  console.log(`// --- reference lines for problem ${num} (paste into chapters/ch01/*.html table#ct by hand) ---`);
  console.log('    lines: [');
  console.log(block);
  console.log('    ],');
  console.log(`// --- end ---`);
  console.error(
    '\n下一步：在 chapters/ch01 对应题页中编辑挖空，保存后运行 npm run build:ch01 更新 index（见 fill-skill.md）。'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
