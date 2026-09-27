/* =========================================================================
   catalog.js — 动画站唯一的题目目录（2026-08-06 从 sidebar.js 抽出）。

   为什么单独一个文件：章节/分类/题目列表以前在 sidebar.js 里手写数组，
   各处各存一份，加一道题要改好几处。现在这里是
   唯一数据源：sidebar / index 首页卡片 / notes.js（LC_ANIM_DATA）全部
   从这份 catalog 派生渲染。答案文件（standard-answers / user-answers）后端按
   题号自动对上，天然对齐。

   每题一条，只存事实，不存渲染细节：
     num  题号（非 LC 题目如 Monotonic Stack Basic 用 null）
     name 题名（notes/checkin 的 key = "num. name"，改名会断历史，慎改）
     slug 力扣 URL slug（没动画时 placeholder 页用它拼题目链接）
     anim 动画页文件名；没有动画就不写这个字段（sidebar 自动指到 placeholder）
     page 非动画的图文页文件名（OA 题解等）：链接指到它，但不算"有动画"、
          不出 🎬 徽标。anim / page 二选一，都没有才是 placeholder
     solAuthor Solution 卡第一个 tab 的作者名；不写默认 'Standard'。需要标注
          自定义标准答案来源时可填作者名
     tiktok TikTok 高频题标记（2026-09-01，来源：Lyon 给的高频题参考文档）。
          题目本身归进各自 chapter（归不进任何章的收在最后的 tiktok-uncat
          block），tiktok-frequent.html 按这个标记派生"只看 TikTok 高频"
          的章节分组视图——加/删高频题只改这个标记，那页自动跟上

   加一道题：在对应章节 problems 里加一行；标准答案放进 standard-answers/
   里（原样不动），用户自己的答案可丢进 user-answers/（后端按题号自动认，
   两个目录都扫）。做好动画后补 anim 字段。
   每个页面在 <script src="sidebar.js"> 之前先加载本文件。
   ========================================================================= */
window.LC_CATALOG = {

  others: {
    id: 'others',
    title: 'Others',
    sections: [{
      title: null,
      problems: [
        // 2026-08-29 清理：已经在第 6/7 章出现、指向同一动画页的 10 条删掉
        // （75/23/26/295/373/378/496 Stack/503/692/739）。496 的暴力版是另一
        // 个动画页，章节里没有，留在这里。
        { num: 496,  name: 'Next Greater Element I (Brute Force)', slug: 'next-greater-element-i',                  anim: '496-next-greater-element.html' },
        { num: null, name: 'Monotonic Stack (Basic)',                                                               anim: 'monotonic-stack-basic.html' },
        { num: null, name: 'Build Adjacency List',                                                                  anim: 'graph-build-animation.html' },
      ],
    }],
  },

  chapters: [
    {
      id: 'chapter-1',
      title: 'Chapter 1 · Binary Search (二分法)',
      sections: [
        {
          title: 'Template（套模板）',
          problems: [
            { num: 704, name: 'Binary Search',                            slug: 'binary-search' },
            { num: 702, name: 'Search in a Sorted Array of Unknown Size', slug: 'search-in-a-sorted-array-of-unknown-size' },
            { num: 74,  name: 'Search a 2D Matrix',                       slug: 'search-a-2d-matrix' },
            { num: 240, name: 'Search a 2D Matrix II',                    slug: 'search-a-2d-matrix-ii' },
          ],
        },
        {
          title: 'OOXX（找边界 / 分界）',
          problems: [
            { num: 34,  name: 'Find First and Last Position of Element in Sorted Array', slug: 'find-first-and-last-position-of-element-in-sorted-array', tiktok: true },
            { num: 35,  name: 'Search Insert Position',                   slug: 'search-insert-position' },
            { num: 162, name: 'Find Peak Element',                        slug: 'find-peak-element',                        anim: '162-find-peak-element.html', tiktok: true },
            { num: 278, name: 'First Bad Version',                        slug: 'first-bad-version' },
            { num: 153, name: 'Find Minimum in Rotated Sorted Array',     slug: 'find-minimum-in-rotated-sorted-array',     anim: '153-find-minimum-in-rotated-sorted-array.html' },
            { num: 33,  name: 'Search in Rotated Sorted Array',           slug: 'search-in-rotated-sorted-array',           anim: '33-search-in-rotated-sorted-array.html' },
          ],
        },
        {
          title: 'Binary Search on Answer（二分答案）',
          problems: [
            { num: 69,   name: 'Sqrt(x)',                                 slug: 'sqrtx', tiktok: true },
            { num: 287,  name: 'Find the Duplicate Number',               slug: 'find-the-duplicate-number', tiktok: true, solAuthor: 'Shuyang' },
            { num: 875,  name: 'Koko Eating Bananas',                     slug: 'koko-eating-bananas',                      anim: '875-koko-eating-bananas.html' },
            { num: 1060, name: 'Missing Element in Sorted Array',         slug: 'missing-element-in-sorted-array' },
            { num: 410,  name: 'Split Array Largest Sum',                 slug: 'split-array-largest-sum' },
            { num: 774,  name: 'Minimize Max Distance to Gas Station',    slug: 'minimize-max-distance-to-gas-station' },
            { num: 475,  name: 'Heaters',                                 slug: 'heaters' },
            { num: 1231, name: 'Divide Chocolate',                        slug: 'divide-chocolate' },
          ],
        },
      ],
    },
    {
      id: 'chapter-2',
      title: 'Chapter 2 · Binary Trees + Divide and Conquer',
      sections: [
        {
          title: 'Tree Traversal',
          problems: [
            { num: 144, name: 'Binary Tree Preorder Traversal',           slug: 'binary-tree-preorder-traversal',           anim: '144-binary-tree-preorder-traversal.html', tiktok: true },
            { num: 94,  name: 'Binary Tree Inorder Traversal',            slug: 'binary-tree-inorder-traversal', tiktok: true },
            { num: 145, name: 'Binary Tree Postorder Traversal',          slug: 'binary-tree-postorder-traversal', tiktok: true },
            { num: 783, name: 'Minimum Distance Between BST Nodes',       slug: 'minimum-distance-between-bst-nodes', tiktok: true, solAuthor: 'Shuyang' },
            { num: 104, name: 'Maximum Depth of Binary Tree',             slug: 'maximum-depth-of-binary-tree',             anim: '104-maximum-depth-of-binary-tree.html' },
          ],
        },
        {
          title: 'Tree DFS — Divide and Conquer',
          problems: [
            { num: 257,  name: 'Binary Tree Paths',                       slug: 'binary-tree-paths',                        anim: '257-binary-tree-paths.html' },
            { num: 112,  name: 'Path Sum',                                slug: 'path-sum' },
            { num: 113,  name: 'Path Sum II',                             slug: 'path-sum-ii' },
            { num: 1120, name: 'Maximum Average Subtree',                 slug: 'maximum-average-subtree',                  anim: '1120-maximum-average-subtree.html' },
            { num: 110,  name: 'Balanced Binary Tree',                    slug: 'balanced-binary-tree' },
            { num: 236,  name: 'Lowest Common Ancestor of a Binary Tree', slug: 'lowest-common-ancestor-of-a-binary-tree',  anim: '236-lowest-common-ancestor-of-a-binary-tree.html' },
            { num: 98,   name: 'Validate Binary Search Tree',             slug: 'validate-binary-search-tree' },
            { num: 549,  name: 'Binary Tree Longest Consecutive Sequence II', slug: 'binary-tree-longest-consecutive-sequence-ii' },
            { num: 114,  name: 'Flatten Binary Tree to Linked List',      slug: 'flatten-binary-tree-to-linked-list',       anim: '114-flatten-binary-tree-to-linked-list.html' },
            { num: 235,  name: 'Lowest Common Ancestor of a Binary Search Tree', slug: 'lowest-common-ancestor-of-a-binary-search-tree', tiktok: true, solAuthor: 'Shuyang' },
            { num: 572,  name: 'Subtree of Another Tree',                 slug: 'subtree-of-another-tree', tiktok: true, solAuthor: 'Shuyang' },
            { num: 1740, name: 'Find Distance in a Binary Tree',          slug: 'find-distance-in-a-binary-tree', tiktok: true, solAuthor: 'Shuyang' },
            { num: 2673, name: 'Make Costs of Paths Equal in a Binary Tree', slug: 'make-costs-of-paths-equal-in-a-binary-tree', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
      ],
    },
    {
      id: 'chapter-3',
      title: 'Chapter 3 · BFS + Topological Sorting',
      sections: [
        {
          title: 'BFS',
          problems: [
            { num: 200, name: 'Number of Islands',                        slug: 'number-of-islands',                        anim: '200-number-of-islands.html' },
            { num: 102, name: 'Binary Tree Level Order Traversal',        slug: 'binary-tree-level-order-traversal',        anim: '102-binary-tree-level-order-traversal.html' },
            { num: 103, name: 'Binary Tree Zigzag Level Order Traversal', slug: 'binary-tree-zigzag-level-order-traversal' },
            { num: 994, name: 'Rotting Oranges',                          slug: 'rotting-oranges' },
            { num: 199, name: 'Binary Tree Right Side View',              slug: 'binary-tree-right-side-view' },
            { num: 286, name: 'Walls and Gates',                          slug: 'walls-and-gates' },
            { num: 490, name: 'The Maze',                                 slug: 'the-maze' },
            { num: 297, name: 'Serialize and Deserialize Binary Tree',    slug: 'serialize-and-deserialize-binary-tree',    anim: '297-serialize-and-deserialize-binary-tree.html' },
            { num: 662, name: 'Maximum Width of Binary Tree',             slug: 'maximum-width-of-binary-tree', tiktok: true, solAuthor: 'Shuyang' },
            { num: 958, name: 'Check Completeness of a Binary Tree',      slug: 'check-completeness-of-a-binary-tree', tiktok: true, solAuthor: 'Shuyang' },
            { num: 1091, name: 'Shortest Path in Binary Matrix',          slug: 'shortest-path-in-binary-matrix', tiktok: true, solAuthor: 'Shuyang' },
            { num: 2258, name: 'Escape the Spreading Fire',               slug: 'escape-the-spreading-fire', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
        {
          title: 'Topological Sorting',
          problems: [
            { num: 207, name: 'Course Schedule',                          slug: 'course-schedule',                          anim: '207-course-schedule.html', tiktok: true },
            { num: 210, name: 'Course Schedule II',                       slug: 'course-schedule-ii', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
        {
          title: 'BFS + Heap: Dijkstra',
          problems: [
            { num: 743, name: 'Network Delay Time',                       slug: 'network-delay-time' },
            { num: 787, name: 'Cheapest Flights Within K Stops',          slug: 'cheapest-flights-within-k-stops' },
            { num: 1631, name: 'Path With Minimum Effort',                slug: 'path-with-minimum-effort', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
      ],
    },
    {
      id: 'chapter-4',
      title: 'Chapter 4 · DFS',
      sections: [
        {
          title: 'Combinations',
          problems: [
            { num: 78,  name: 'Subsets',                                  slug: 'subsets',                                  anim: '78-subsets.html' },
            { num: 90,  name: 'Subsets II',                               slug: 'subsets-ii' },
            { num: 77,  name: 'Combinations',                             slug: 'combinations' },
            { num: 39,  name: 'Combination Sum',                          slug: 'combination-sum' },
            { num: 40,  name: 'Combination Sum II',                       slug: 'combination-sum-ii' },
            { num: 216, name: 'Combination Sum III',                      slug: 'combination-sum-iii' },
            { num: 17,  name: 'Letter Combinations of a Phone Number',    slug: 'letter-combinations-of-a-phone-number' },
            { num: 140, name: 'Word Break II',                            slug: 'word-break-ii', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
        {
          title: 'Permutations',
          problems: [
            { num: 46, name: 'Permutations',                              slug: 'permutations',                              anim: '46-permutations.html', tiktok: true },
            { num: 47, name: 'Permutations II',                           slug: 'permutations-ii', tiktok: true },
          ],
        },
        {
          title: 'Graph / Grid DFS',
          problems: [
            { num: 79,  name: 'Word Search',                              slug: 'word-search',                              anim: '79-word-search.html', tiktok: true },
            { num: 733, name: 'Flood Fill',                               slug: 'flood-fill',                               anim: '733-flood-fill.html' },
            { num: 694, name: 'Number of Distinct Islands',               slug: 'number-of-distinct-islands',               solAuthor: 'Shuyang', tiktok: true },
            { num: 711, name: 'Number of Distinct Islands II',            slug: 'number-of-distinct-islands-ii', tiktok: true, solAuthor: 'Shuyang' },
            { num: 212, name: 'Word Search II',                           slug: 'word-search-ii', tiktok: true },
            { num: 208, name: 'Implement Trie (Prefix Tree)',             slug: 'implement-trie-prefix-tree',               anim: '208-implement-trie-prefix-tree.html' },
            { num: 105, name: 'Construct Binary Tree from Preorder and Inorder Traversal', slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', anim: '105-construct-binary-tree-from-preorder-and-inorder-traversal.html', tiktok: true },
          ],
        },
      ],
    },
    {
      id: 'chapter-5',
      title: 'Chapter 5 · Graph',
      sections: [
        {
          title: 'DFS / Backtracking',
          problems: [
            { num: 797, name: 'All Paths From Source to Target',          slug: 'all-paths-from-source-to-target',                                           algo: 'DFS' },
          ],
        },
        {
          title: 'Graph Theory (BFS + DFS)',
          problems: [
            { num: 127, name: 'Word Ladder',                              slug: 'word-ladder',                             anim: '127-word-ladder.html',    algo: 'BFS' },
            { num: 126, name: 'Word Ladder II',                           slug: 'word-ladder-ii',                          anim: '126-word-ladder-ii.html', algo: 'BFS+DFS' },
            { num: 261, name: 'Graph Valid Tree',                         slug: 'graph-valid-tree',                                                          algo: 'BFS' },
            { num: 133, name: 'Clone Graph',                              slug: 'clone-graph',                             anim: 'clone_graph_133.html',    algo: 'BFS' },
            { num: 547, name: 'Number of Provinces',                      slug: 'number-of-provinces',                                                       algo: 'BFS' },
            { num: 863, name: 'All Nodes Distance K in Binary Tree',      slug: 'all-nodes-distance-k-in-binary-tree',                                       algo: 'BFS+DFS', tiktok: true },
            { num: 785, name: 'Is Graph Bipartite?',                      slug: 'is-graph-bipartite',                                                        algo: 'BFS', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
        {
          title: 'Topological Sort',
          problems: [
            { num: 269, name: 'Alien Dictionary',                         slug: 'alien-dictionary',                        anim: '269-alien-dictionary.html', algo: 'BFS' },
            { num: 332, name: 'Reconstruct Itinerary',                    slug: 'reconstruct-itinerary',                                                     algo: 'DFS' },
          ],
        },
        {
          title: 'Union Find',
          problems: [
            { num: 323, name: 'Number of Connected Components in an Undirected Graph', slug: 'number-of-connected-components-in-an-undirected-graph' },
            { num: 959, name: 'Regions Cut by Slashes',                   slug: 'regions-cut-by-slashes', tiktok: true, solAuthor: 'Shuyang' },
            { num: 1361, name: 'Validate Binary Tree Nodes',              slug: 'validate-binary-tree-nodes', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
      ],
    },
    {
      id: 'chapter-6',
      title: 'Chapter 6 · Two Pointer & Linked List',
      sections: [
        {
          title: 'Two Pointer',
          problems: [
            { num: 283, name: 'Move Zeroes',                        slug: 'move-zeroes',                         anim: '283-move-zeroes.html' },
            { num: 26,  name: 'Remove Duplicates from Sorted Array', slug: 'remove-duplicates-from-sorted-array', anim: '26-remove-duplicates-from-sorted-array.html' },
            { num: 75,  name: 'Sort Colors',                         slug: 'sort-colors',                         anim: '75-sort-colors.html' },
            { num: 56,  name: 'Merge Intervals',                     slug: 'merge-intervals' },
            { num: 1,   name: 'Two Sum',                             slug: 'two-sum', anim: '1-two-sum.html' },
            { num: 15,  name: '3Sum',                                 slug: '3sum', tiktok: true },
            { num: 611, name: 'Valid Triangle Number',                slug: 'valid-triangle-number' },
            { num: 170, name: 'Two Sum III - Data structure design',  slug: 'two-sum-iii-data-structure-design', anim: '170-two-sum-iii-data-structure-design.html' },
            { num: null, name: 'Debugger Actions (TikTok OA, 2026-08-16)', pageName: 'Debugger Actions', anim: 'debugger-actions.html' },
          ],
        },
        {
          title: 'Linked List',
          problems: [
            { num: 876, name: 'Middle of the Linked List',           slug: 'middle-of-the-linked-list' },
            { num: 141, name: 'Linked List Cycle',                   slug: 'linked-list-cycle' },
            { num: 142, name: 'Linked List Cycle II',                slug: 'linked-list-cycle-ii' },
            { num: 146, name: 'LRU Cache',                           slug: 'lru-cache', tiktok: true, solAuthor: 'Shuyang' },
            { num: 206, name: 'Reverse Linked List',                 slug: 'reverse-linked-list', tiktok: true },
            { num: 234, name: 'Palindrome Linked List',              slug: 'palindrome-linked-list' },
          ],
        },
        {
          title: 'Quick Sort',
          problems: [
            // 纯算法演示页,不是 LC 题(912 用同一份 quickSort,但那是 Chapter 7 的条目,动画各归各)
            { num: null, name: 'Quick Sort', anim: 'quick-sort.html' },
          ],
        },
      ],
    },
    {
      id: 'chapter-7',
      title: 'Chapter 7 · Heap + Top K + Monotonic Stack',
      sections: [
        {
          title: 'Heap',
          problems: [
            { num: 23,  name: 'Merge k Sorted Lists',                     slug: 'merge-k-sorted-lists',                     anim: '23-merge-k-lists.html' },
            { num: 295, name: 'Find Median from Data Stream',             slug: 'find-median-from-data-stream',             anim: '295-find-median-data-stream.html' },
            { num: 378, name: 'Kth Smallest Element in a Sorted Matrix',  slug: 'kth-smallest-element-in-a-sorted-matrix',  anim: '378-kth-smallest-matrix.html' },
            { num: 373, name: 'Find K Pairs with Smallest Sums',          slug: 'find-k-pairs-with-smallest-sums',          anim: '373-find-k-pairs-smallest-sums.html' },
            { num: 767, name: 'Reorganize String',                        slug: 'reorganize-string', page: '767-reorganize-string.html' },
            // Top K 本来是独立分类，2026-08-20 归进 Heap（Top K 就是 heap 的
            // 典型用法），题名上标注 (Top K) 区分
            { num: 215, name: 'Kth Largest Element in an Array (Top K)',  pageName: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array', page: '215-kth-largest-element-in-array.html', tiktok: true },
            { num: 347, name: 'Top K Frequent Elements (Top K)',          pageName: 'Top K Frequent Elements',         slug: 'top-k-frequent-elements', tiktok: true, solAuthor: 'Shuyang' },
            { num: 3408, name: 'Design Task Manager',                     slug: 'design-task-manager', tiktok: true, solAuthor: 'Shuyang' },
            { num: 692, name: 'Top K Frequent Words (Top K)',             pageName: 'Top K Frequent Words',            slug: 'top-k-frequent-words', anim: '692-top-k-frequent-words.html' },
            // name 是 sidebar 显示名（带课程备注）；pageName 是干净题名，给
            // placeholder 页标题用——那个标题是打卡/笔记的 key，不能带备注
            { num: 912, name: 'Sort an Array (quickSort from Chapter 6)', pageName: 'Sort an Array', slug: 'sort-an-array', page: '912-sort-an-array.html' },
            { num: null, name: 'Reorder W/D/L Characters (TikTok OA, 2026-08-08)', pageName: 'Reorder W/D/L Characters', page: 'reorder-w-d-l-characters.html' },
          ],
        },
        {
          title: 'Hashmap',
          problems: [
            { num: 49,  name: 'Group Anagrams',                           slug: 'group-anagrams' },
            { num: 128, name: 'Longest Consecutive Sequence',             slug: 'longest-consecutive-sequence', tiktok: true, solAuthor: 'Shuyang' },
            { num: 359, name: 'Logger Rate Limiter',                      slug: 'logger-rate-limiter', tiktok: true, solAuthor: 'Shuyang' },
            { num: 1647, name: 'Minimum Deletions to Make Character Frequencies Unique', slug: 'minimum-deletions-to-make-character-frequencies-unique', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
        {
          title: 'Monotonic Stack',
          problems: [
            { num: 496, name: 'Next Greater Element I',                   slug: 'next-greater-element-i',                   anim: '496-monotonic-stack.html' },
            { num: 503, name: 'Next Greater Element II',                  slug: 'next-greater-element-ii',                  anim: '503-next-greater-element-ii.html' },
            { num: 739, name: 'Daily Temperatures',                       slug: 'daily-temperatures',                       anim: '739-daily-temperatures.html', tiktok: true },
            { num: 402, name: 'Remove K Digits',                          slug: 'remove-k-digits' },
            { num: 85,  name: 'Maximal Rectangle',                        slug: 'maximal-rectangle', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
      ],
    },
    {
      id: 'chapter-8',
      title: 'Chapter 8 · Sliding Window + Sweep Line',
      sections: [
        {
          title: 'Sliding Window',
          problems: [
            { num: 3,   name: 'Longest Substring Without Repeating Characters',          slug: 'longest-substring-without-repeating-characters',          anim: '3-longest-substring-consider-starting.html' },
            { num: 159, name: 'Longest Substring with At Most Two Distinct Characters',  slug: 'longest-substring-with-at-most-two-distinct-characters',  anim: '159-longest-substring-at-most-two-distinct.html' },
            { num: 340, name: 'Longest Substring with At Most K Distinct Characters',    slug: 'longest-substring-with-at-most-k-distinct-characters',    anim: '340-longest-substring-at-most-k-distinct.html' },
            { num: 438, name: 'Find All Anagrams in a String',            slug: 'find-all-anagrams-in-a-string',            anim: '438-find-all-anagrams-in-string.html' },
            { num: 209, name: 'Minimum Size Subarray Sum',                slug: 'minimum-size-subarray-sum',                anim: '209-minimum-size-subarray-sum.html' },
            { num: 713, name: 'Subarray Product Less Than K',             slug: 'subarray-product-less-than-k', page: '713-subarray-product-less-than-k.html' },
            { num: 76,  name: 'Minimum Window Substring',                 slug: 'minimum-window-substring',                 anim: '76-minimum-window-substring.html', tiktok: true },
            // 标签只标 Monotonic Deque——这题本来就在 Sliding Window 分类下，
            // 不用重复（2026-08-25）
            { num: 239, name: 'Sliding Window Maximum',                   slug: 'sliding-window-maximum', anim: '239-sliding-window-maximum.html', algo: 'Monotonic Deque' },
          ],
        },
        {
          title: 'Sweep Line',
          problems: [
            { num: 252, name: 'Meeting Rooms',                            slug: 'meeting-rooms',                            anim: '252-meeting-rooms.html' },
            { num: 253, name: 'Meeting Rooms II',                         slug: 'meeting-rooms-ii',                         anim: '253-meeting-rooms-ii.html' },
            { num: 218, name: 'The Skyline Problem',                      slug: 'the-skyline-problem', tiktok: true, solAuthor: 'Shuyang' },
            { num: null, name: 'Retail Store Sales and Discounts (TikTok OA, 2026-08-08)', pageName: 'Retail Store Sales and Discounts', anim: 'retail-store-sales-and-discounts.html' },
            { num: null, name: 'Lamps on a Coordinate Line (TikTok OA, 2026-08-08)',        pageName: 'Lamps on a Coordinate Line',        page: 'lamps-on-a-coordinate-line.html' },
          ],
        },
      ],
    },
    {
      id: 'chapter-9',
      title: 'Chapter 9 · Prefix Sum + Stack + DP',
      sections: [
        {
          title: 'Prefix Sum',
          problems: [
            { num: 303, name: 'Range Sum Query - Immutable',              slug: 'range-sum-query-immutable',                anim: '303-range-sum-query-immutable.html' },
            { num: 325, name: 'Maximum Size Subarray Sum Equals k',       slug: 'maximum-size-subarray-sum-equals-k',       anim: '325-maximum-size-subarray-sum-equals-k.html' },
            { num: 525, name: 'Contiguous Array',                         slug: 'contiguous-array',                         anim: '525-contiguous-array.html' },
            { num: 523, name: 'Continuous Subarray Sum',                  slug: 'continuous-subarray-sum' },
            { num: 528, name: 'Random Pick with Weight',                  slug: 'random-pick-with-weight', tiktok: true, solAuthor: 'Shuyang' },
            { num: 560, name: 'Subarray Sum Equals K',                    slug: 'subarray-sum-equals-k', tiktok: true, solAuthor: 'Shuyang' },
            { num: null, name: 'Blocks and Obstacles on an Infinite Number Line (TikTok OA, 2026-08-16)', pageName: 'Blocks and Obstacles on an Infinite Number Line', anim: 'blocks-and-obstacles.html' },
          ],
        },
        {
          title: 'Stack',
          problems: [
            { num: 20, name: 'Valid Parentheses',                         slug: 'valid-parentheses',                        anim: '20-valid-parentheses.html' },
            { num: 42, name: 'Trapping Rain Water',                       slug: 'trapping-rain-water',                      anim: '42-trapping-rain-water.html' },
            { num: 32, name: 'Longest Valid Parentheses',                 slug: 'longest-valid-parentheses',                anim: '32-longest-valid-parentheses.html' },
            { num: 155, name: 'Min Stack',                                slug: 'min-stack', tiktok: true, solAuthor: 'Shuyang' },
            { num: 227, name: 'Basic Calculator II',                      slug: 'basic-calculator-ii', tiktok: true, solAuthor: 'Shuyang' },
            { num: 394, name: 'Decode String',                            slug: 'decode-string', tiktok: true, solAuthor: 'Shuyang' },
            { num: 678, name: 'Valid Parenthesis String',                 slug: 'valid-parenthesis-string', tiktok: true, solAuthor: 'Shuyang' },
            { num: 726, name: 'Number of Atoms',                          slug: 'number-of-atoms', tiktok: true, solAuthor: 'Shuyang' },
            { num: 1047, name: 'Remove All Adjacent Duplicates In String', slug: 'remove-all-adjacent-duplicates-in-string', tiktok: true, solAuthor: 'Shuyang' },
            { num: 1249, name: 'Minimum Remove to Make Valid Parentheses', slug: 'minimum-remove-to-make-valid-parentheses', tiktok: true, solAuthor: 'Shuyang' },
            { num: null, name: 'Minimum Remaining String Length (JPMorgan OA, 2026-08-08)', pageName: 'Minimum Remaining String Length', anim: 'minimum-remaining-string-length.html' },
          ],
        },
        {
          title: 'DP',
          note: '⚠️ Lyon: DP is appearing less often; keep it lower priority.',
          problems: [
            { num: 64,  name: 'Minimum Path Sum',                         slug: 'minimum-path-sum',                         anim: '64-minimum-path-sum.html', tiktok: true },
            { num: 322, name: 'Coin Change',                              slug: 'coin-change',                              anim: '322-coin-change.html', tiktok: true },
            { num: 91,  name: 'Decode Ways',                              slug: 'decode-ways' },
            { num: 53,  name: 'Maximum Subarray',                         slug: 'maximum-subarray', tiktok: true, solAuthor: 'Shuyang' },
            { num: 221, name: 'Maximal Square',                           slug: 'maximal-square', tiktok: true, solAuthor: 'Shuyang' },
            { num: 546, name: 'Remove Boxes',                             slug: 'remove-boxes', tiktok: true, solAuthor: 'Shuyang' },
            { num: 55,  name: 'Jump Game',                                slug: 'jump-game',                                anim: '55-jump-game.html' },
            { num: 45,  name: 'Jump Game II',                             slug: 'jump-game-ii',                             anim: '45-jump-game-ii.html' },
          ],
        },
      ],
    },
    {
      id: 'chapter-10',
      title: 'Chapter 10 · Online Assessment Uncategorized',
      sections: [
        {
          title: 'Math / Simulation',
          problems: [
            { num: null, name: 'Product of Digits Minus Sum of Digits (TikTok OA, 2026-08-08)', pageName: 'Product of Digits Minus Sum of Digits', page: 'product-of-digits-minus-sum-of-digits.html' },
            { num: null, name: 'Reverse Letters in Pairs (TikTok OA, 2026-08-16)', pageName: 'Reverse Letters in Pairs', page: 'reverse-letters-in-pairs.html' },
            { num: null, name: 'Robot and Lasers on a Board (TikTok OA, 2026-08-16)', pageName: 'Robot and Lasers on a Board', page: 'robot-and-lasers-on-a-board.html' },
            { num: null, name: 'Maximum XOR Binary String (JPMorgan OA, 2026-08-08)', pageName: 'Maximum XOR Binary String', anim: 'maximum-xor-binary-string.html' },
          ],
        },
      ],
    },
    {
      // TikTok 高频题里归不进 1–9 章任何套路的（2026-09-01）：单独一个 block。
      // 跟 chapter-10 的思路一样是兜底，但那边收 OA 原题、这边收 LC 高频题，
      // 不混在一起
      id: 'tiktok-uncat',
      title: 'TikTok 高频 · Uncategorized',
      sections: [
        {
          title: 'Design / Simulation',
          problems: [
            { num: 68,  name: 'Text Justification',                       slug: 'text-justification', tiktok: true, solAuthor: 'Shuyang' },
            { num: 348, name: 'Design Tic-Tac-Toe',                       slug: 'design-tic-tac-toe', tiktok: true, solAuthor: 'Shuyang' },
            { num: 796, name: 'Rotate String',                            slug: 'rotate-string', tiktok: true, solAuthor: 'Shuyang' },
          ],
        },
      ],
    },
  ],
};

/* =========================================================================
   算法视角的目录（2026-08-14）：同一批题按 BFS / DFS 重新归类，
   bfs / dfs-all-in-one 两个页面和侧栏的 bfs / dfs 模式共用这一份。
   只存题号（题名/链接/🎬 从上面的 LC_CATALOG 反查，不复制事实）；
   条目可以是纯题号，或 { num, tag } 给 BFS+DFS 混合题单独标。
   ========================================================================= */
window.LC_ALGO_CATALOG = {
  bfs: {
    heading: 'Breadth First Search',
    tag: 'BFS',
    blocks: [
      { id: 'bfs-tree',     title: 'Tree BFS',             page: 'bfs-tree.html', sections: [{ title: null, items: [102, 103, 199, 297] }] },
      { id: 'bfs-grid',     title: 'Grid BFS',             page: 'bfs-grid.html', sections: [{ title: null, items: [200, 994, 286, 490] }] },
      { id: 'bfs-graph',    title: 'Graph BFS',            page: 'bfs-graph.html', sections: [{ title: null, items: [127, 261, 133, 547, { num: 126, tag: 'BFS+DFS' }, { num: 863, tag: 'BFS+DFS' }] }] },
      { id: 'bfs-topo',     title: 'Topological Sorting',  page: 'bfs-topological-sorting.html', sections: [{ title: null, items: [207, 269] }] },
      { id: 'bfs-dijkstra', title: 'BFS + Heap · Dijkstra', page: 'bfs-dijkstra.html', sections: [{ title: null, items: [743, 787] }] },
    ],
  },
  dfs: {
    heading: 'Depth First Search',
    tag: 'DFS',
    blocks: [
      { id: 'dfs-tree', title: 'Tree DFS', sections: [
        { title: 'Traversal',        items: [144, 94, 145] },
        { title: 'Divide & Conquer', items: [104, 257, 112, 113, 1120, 110, 236, 98, 549, 114, 105] },
      ]},
      { id: 'dfs-grid', title: 'Grid DFS', sections: [
        { title: null, items: [79, 733, 212] },
      ]},
      { id: 'dfs-graph', title: 'Graph DFS', sections: [
        { title: null, items: [797, 332, { num: 126, tag: 'BFS+DFS' }, { num: 863, tag: 'BFS+DFS' }] },
      ]},
      { id: 'dfs-backtracking', title: 'Backtracking', sections: [
        { title: 'Combinations', items: [78, 90, 77, 39, 40, 216, 17] },
        { title: 'Permutations', items: [46, 47] },
      ]},
    ],
  },
};
