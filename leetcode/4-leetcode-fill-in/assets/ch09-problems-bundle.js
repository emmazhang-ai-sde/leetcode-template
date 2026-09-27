/* Chapter 9: Prefix Sum + Stack + DP — problem data */
(function () {
  'use strict';

  const placeholderRow =
    '<tr><td class="ln">1</td><td class="lc"><span class="seg">Blank-fill template for this problem is not in the repo yet — use the LeetCode link in the title bar.</span></td></tr>';

  function p(num, name, url) {
    return { num: String(num), name, url, codeTableHtml: placeholderRow };
  }

  window.CH09_FILL_PS = [
    p('303', 'Range Sum Query - Immutable',          'https://leetcode.com/problems/range-sum-query-immutable/'),
    p('325', 'Maximum Size Subarray Sum Equals k',   'https://leetcode.com/problems/maximum-size-subarray-sum-equals-k/'),
    p('523', 'Continuous Subarray Sum',              'https://leetcode.com/problems/continuous-subarray-sum/'),
    p('525', 'Contiguous Array',                     'https://leetcode.com/problems/contiguous-array/'),
  ];

  window.CH09_FILL_STACK = [
    p('20',  'Valid Parentheses',          'https://leetcode.com/problems/valid-parentheses/'),
    p('32',  'Longest Valid Parentheses',  'https://leetcode.com/problems/longest-valid-parentheses/'),
    p('42',  'Trapping Rain Water',        'https://leetcode.com/problems/trapping-rain-water/'),
  ];

  window.CH09_FILL_DP = [
    p('322', 'Coin Change',        'https://leetcode.com/problems/coin-change/'),
    p('64',  'Minimum Path Sum',   'https://leetcode.com/problems/minimum-path-sum/'),
    p('91',  'Decode Ways',        'https://leetcode.com/problems/decode-ways/'),
  ];
})();
