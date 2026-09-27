/* Chapter 8: Sliding Window + Sweep Line — problem data */
(function () {
  'use strict';

  const placeholderRow =
    '<tr><td class="ln">1</td><td class="lc"><span class="seg">Blank-fill template for this problem is not in the repo yet — use the LeetCode link in the title bar.</span></td></tr>';

  function p(num, name, url) {
    return { num: String(num), name, url, codeTableHtml: placeholderRow };
  }

  window.CH08_FILL_SW = [
    p('3',   'Longest Substring Without Repeating Characters',          'https://leetcode.com/problems/longest-substring-without-repeating-characters/'),
    p('159', 'Longest Substring with At Most Two Distinct Characters',  'https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/'),
    p('340', 'Longest Substring with At Most K Distinct Characters',    'https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/'),
    p('209', 'Minimum Size Subarray Sum',                               'https://leetcode.com/problems/minimum-size-subarray-sum/'),
    p('438', 'Find All Anagrams in a String',                           'https://leetcode.com/problems/find-all-anagrams-in-a-string/'),
    p('76',  'Minimum Window Substring',                                'https://leetcode.com/problems/minimum-window-substring/'),
    p('239', 'Sliding Window Maximum',                                  'https://leetcode.com/problems/sliding-window-maximum/'),
    p('713', 'Subarray Product Less Than K',                            'https://leetcode.com/problems/subarray-product-less-than-k/'),
  ];

  window.CH08_FILL_SWEEP = [
    p('252', 'Meeting Rooms',    'https://leetcode.com/problems/meeting-rooms/'),
    p('253', 'Meeting Rooms II', 'https://leetcode.com/problems/meeting-rooms-ii/'),
  ];
})();
