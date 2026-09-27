/* Chapter 6: Two Pointer & Linked List — problem data */
(function () {
  'use strict';

  const placeholderRow =
    '<tr><td class="ln">1</td><td class="lc"><span class="seg">Blank-fill template for this problem is not in the repo yet — use the LeetCode link in the title bar.</span></td></tr>';

  function p(num, name, url) {
    return { num: String(num), name, url, codeTableHtml: placeholderRow };
  }

  window.CH06_FILL_TP1 = [
    p('283', 'Move Zeroes',                         'https://leetcode.com/problems/move-zeroes/'),
    p('26',  'Remove Duplicates from Sorted Array', 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/'),
  ];

  window.CH06_FILL_TP2 = [
    p('75',  'Sort Colors', 'https://leetcode.com/problems/sort-colors/'),
  ];

  window.CH06_FILL_TP3 = [
    p('1',   'Two Sum（排序版）',      'https://leetcode.com/problems/two-sum/'),
    p('611', 'Valid Triangle Number', 'https://leetcode.com/problems/valid-triangle-number/'),
  ];

  window.CH06_FILL_TP4 = [
    p('170', 'Two Sum III - Data structure design', 'https://leetcode.com/problems/two-sum-iii-data-structure-design/'),
    p('1b',  'Two Sum（unsorted 版）',               'https://leetcode.com/problems/two-sum/'),
  ];

  window.CH06_FILL_TP5 = [
    p('56', 'Merge Intervals', 'https://leetcode.com/problems/merge-intervals/'),
  ];

  window.CH06_FILL_LL1 = [
    p('876', 'Middle of the Linked List', 'https://leetcode.com/problems/middle-of-the-linked-list/'),
    p('141', 'Linked List Cycle',         'https://leetcode.com/problems/linked-list-cycle/'),
    p('142', 'Linked List Cycle II',      'https://leetcode.com/problems/linked-list-cycle-ii/'),
  ];

  window.CH06_FILL_LL2 = [
    p('206', 'Reverse Linked List',                    'https://leetcode.com/problems/reverse-linked-list/'),
    p('234', 'Palindrome Linked List（反转后半段）', 'https://leetcode.com/problems/palindrome-linked-list/'),
  ];

  window.CH06_FILL_EXTRA = [
    p('912', 'Sort an Array', 'https://leetcode.com/problems/sort-an-array/'),
  ];
})();
