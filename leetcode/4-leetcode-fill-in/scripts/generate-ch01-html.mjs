#!/usr/bin/env node
/**
 * @deprecated 已废弃。
 *
 * 本脚本曾根据 scripts/ch01-problems.mjs 中的 `lines` 覆盖生成 chapters/ch01/*.html。
 * 现在题面与代码表的真源为 **手改的 chapters/ch01/*.html**；更新首页请运行：
 *   npm run build:ch01
 *
 * 若需从 git 历史恢复旧版「从 mjs 生成 HTML」工作流，请检出旧提交中的本文件与 ch01-problems.mjs。
 */
console.error(`
generate-ch01-html.mjs 已废弃：会覆盖手改章节 HTML。
请直接编辑 chapters/ch01/ 下对应文件，然后运行 npm run build:ch01 更新 index。
`);
process.exit(1);
