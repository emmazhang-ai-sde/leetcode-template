/* Chapter 7: Heap + TOP K + Monotonic Stack — problem data */
(function () {
  'use strict';

  const placeholderRow =
    '<tr><td class="ln">1</td><td class="lc"><span class="seg">Blank-fill template for this problem is not in the repo yet — use the LeetCode link in the title bar.</span></td></tr>';

  function p(num, name, url) {
    return { num: String(num), name, url, codeTableHtml: placeholderRow };
  }

  window.CH07_FILL_HEAP = [
    p('23',  'Merge k Sorted Lists',                    'https://leetcode.com/problems/merge-k-sorted-lists/'),
    p('295', 'Find Median from Data Stream',             'https://leetcode.com/problems/find-median-from-data-stream/'),
    p('378', 'Kth Smallest Element in a Sorted Matrix', 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/'),
    p('373', 'Find K Pairs with Smallest Sums',         'https://leetcode.com/problems/find-k-pairs-with-smallest-sums/'),
    p('767', 'Reorganize String',                       'https://leetcode.com/problems/reorganize-string/'),
  ];

  window.CH07_FILL_TOPK = [
    p('215', 'Kth Largest Element in an Array', 'https://leetcode.com/problems/kth-largest-element-in-an-array/'),
    p('692', 'Top K Frequent Words',             'https://leetcode.com/problems/top-k-frequent-words/'),
  ];

  window.CH07_FILL_MONO = [
    p('496', 'Next Greater Element I',  'https://leetcode.com/problems/next-greater-element-i/'),
    p('503', 'Next Greater Element II', 'https://leetcode.com/problems/next-greater-element-ii/'),
    p('739', 'Daily Temperatures',      'https://leetcode.com/problems/daily-temperatures/'),
  ];
})();
