/**
 * Chapter 1 元数据（题号、slug、侧栏顺序）。
 * 题面与代码块的真源为 chapters/ch01/*.html；index 数据由 `npm run build:ch01` 生成。
 */
export { PROBLEMS_META } from './ch01-problems-meta.generated.mjs';

export const SLUGS = {
  '704': 'binary-search',
  '702': 'search-in-a-sorted-array-of-unknown-size',
  '74': 'search-a-2d-matrix',
  '240': 'search-a-2d-matrix-ii',
  '34': 'find-first-and-last-position-of-element-in-sorted-array',
  '35': 'search-insert-position',
  '162': 'find-peak-element',
  '278': 'first-bad-version',
  '153': 'find-minimum-in-rotated-sorted-array',
  '33': 'search-in-rotated-sorted-array',
};

/** 与 all-in-one 侧栏「套模板类型」一致（独立 HTML 文件名前缀） */
export const PROBLEM_ORDER_TEMPLATE = ['704', '702', '74', '240'];
/** 与 all-in-one 侧栏「OOXX 类型」一致 */
export const PROBLEM_ORDER_OOXX = ['34', '35', '162', '278', '153', '33'];

export function categoryFilenamePrefix(num) {
  if (PROBLEM_ORDER_TEMPLATE.includes(num)) return '套模板类型-';
  if (PROBLEM_ORDER_OOXX.includes(num)) return 'OOXX 类型-';
  return '';
}
