/** Chapter 5 graph practice list — aligns with chapters/ch05/ch05-notes.html prob groups */
(function () {
  'use strict';

  const placeholderRow =
    '<tr><td class="ln">1</td><td class="lc"><span class="seg">Blank-fill template for this problem is not in the repo yet — use the LeetCode link in the title bar.</span></td></tr>';

  function p(num, name, slug) {
    return {
      num: String(num),
      name,
      url: 'https://leetcode.com/problems/' + slug + '/description/',
      codeTableHtml: placeholderRow,
    };
  }

  window.CH05_FILL_BFS = [p(127, 'Word Ladder', 'word-ladder')];

  window.CH05_FILL_DFS_BACKTRACK = [p(797, 'All Paths From Source to Target', 'all-paths-from-source-to-target')];

  window.CH05_FILL_GRAPH_THEORY = [
    {
      num: '261',
      name: 'Graph Valid Tree',
      url: 'https://leetcode.com/problems/graph-valid-tree/description/',
      codeTableHtml: `<tr><td class="ln">1</td><td class="lc"><span class="seg">import collections</span></td></tr>
<tr><td class="ln">2</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">3</td><td class="lc"><span class="seg">class Solution:</span></td></tr>
<tr><td class="ln">4</td><td class="lc"><span class="seg">    def validTree(self, n: int, edges: List[List[int]]) -&gt; bool:</span></td></tr>
<tr><td class="ln">5</td><td class="lc"><span class="seg">        if len(edges) != </span><span class="blank-group"><input type="text" class="blank" data-answer="n-1" data-answers='["n-1","n - 1"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">n-1</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">6</td><td class="lc"><span class="seg">            return False</span></td></tr>
<tr><td class="ln">7</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">8</td><td class="lc"><span class="seg">        # Create Graph</span></td></tr>
<tr><td class="ln">9</td><td class="lc"><span class="seg">        graphs = collections.</span><span class="blank-group"><input type="text" class="blank" data-answer="defaultdict" data-answers='["defaultdict"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">defaultdict</span></span><span class="seg">(list)</span></td></tr>
<tr><td class="ln">10</td><td class="lc"><span class="seg">        for edge in edges:</span></td></tr>
<tr><td class="ln">11</td><td class="lc"><span class="seg">            graphs[edge[0]].append(</span><span class="blank-group"><input type="text" class="blank" data-answer="edge[1]" data-answers='["edge[1]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">edge[1]</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">12</td><td class="lc"><span class="seg">            graphs[edge[1]].append(</span><span class="blank-group"><input type="text" class="blank" data-answer="edge[0]" data-answers='["edge[0]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">edge[0]</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">13</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">14</td><td class="lc"><span class="seg">        queue = collections.</span><span class="blank-group"><input type="text" class="blank" data-answer="deque" data-answers='["deque"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">deque</span></span><span class="seg">([])</span></td></tr>
<tr><td class="ln">15</td><td class="lc"><span class="seg">        visited = {</span><span class="blank-group"><input type="text" class="blank" data-answer="0" data-answers='["0"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">0</span></span><span class="seg">}</span></td></tr>
<tr><td class="ln">16</td><td class="lc"><span class="seg">        queue.append(</span><span class="blank-group"><input type="text" class="blank" data-answer="0" data-answers='["0"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">0</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">17</td><td class="lc"><span class="seg">        while len(queue) &gt; 0:</span></td></tr>
<tr><td class="ln">18</td><td class="lc"><span class="seg">            for _ in range(</span><span class="blank-group"><input type="text" class="blank" data-answer="len(queue)" data-answers='["len(queue)","len ( queue )"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">len(queue)</span></span><span class="seg">):</span></td></tr>
<tr><td class="ln">19</td><td class="lc"><span class="seg">                curr = queue.</span><span class="blank-group"><input type="text" class="blank" data-answer="popleft" data-answers='["popleft"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">popleft</span></span><span class="seg">()</span></td></tr>
<tr><td class="ln">20</td><td class="lc"><span class="seg">                neighbours = graphs.get(curr, </span><span class="blank-group"><input type="text" class="blank" data-answer="[]" data-answers='["[]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">[]</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">21</td><td class="lc"><span class="seg">                for neighbour in neighbours:</span></td></tr>
<tr><td class="ln">22</td><td class="lc"><span class="seg">                    if </span><span class="blank-group"><input type="text" class="blank" data-answer="neighbour not in visited" data-answers='["neighbour not in visited"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbour not in visited</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">23</td><td class="lc"><span class="seg">                        visited.add(</span><span class="blank-group"><input type="text" class="blank" data-answer="neighbour" data-answers='["neighbour"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbour</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">24</td><td class="lc"><span class="seg">                        queue.append(</span><span class="blank-group"><input type="text" class="blank" data-answer="neighbour" data-answers='["neighbour"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbour</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">25</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">26</td><td class="lc"><span class="seg">        return len(visited) == </span><span class="blank-group"><input type="text" class="blank" data-answer="n" data-answers='["n"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">n</span></span></td></tr>`,
    },
    {
      num: '133',
      name: 'Clone Graph',
      url: 'https://leetcode.com/problems/clone-graph/description/',
      codeTableHtml: `<tr><td class="ln">1</td><td class="lc"><span class="cm">"""</span></td></tr>
<tr><td class="ln">2</td><td class="lc"><span class="cm"># Definition for a Node.</span></td></tr>
<tr><td class="ln">3</td><td class="lc"><span class="cm">class Node:</span></td></tr>
<tr><td class="ln">4</td><td class="lc"><span class="cm">    def __init__(self, val = 0, neighbors = None):</span></td></tr>
<tr><td class="ln">5</td><td class="lc"><span class="cm">        self.val = val</span></td></tr>
<tr><td class="ln">6</td><td class="lc"><span class="cm">        self.neighbors = neighbors if neighbors is not None else []</span></td></tr>
<tr><td class="ln">7</td><td class="lc"><span class="cm">"""</span></td></tr>
<tr><td class="ln">8</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">9</td><td class="lc"><span class="seg">import collections</span></td></tr>
<tr><td class="ln">10</td><td class="lc"><span class="seg">from typing import Optional</span></td></tr>
<tr><td class="ln">11</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">12</td><td class="lc"><span class="seg">class Solution:</span></td></tr>
<tr><td class="ln">13</td><td class="lc"><span class="seg">    def cloneGraph(self, node: Optional['Node']) -&gt; Optional['Node']:</span></td></tr>
<tr><td class="ln">14</td><td class="lc"><span class="seg">        if node is </span><span class="blank-group"><input type="text" class="blank" data-answer="None" data-answers='["None"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">None</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">15</td><td class="lc"><span class="seg">            return None</span></td></tr>
<tr><td class="ln">16</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">17</td><td class="lc"><span class="seg">        queue = collections.deque(</span><span class="blank-group"><input type="text" class="blank" data-answer="[node]" data-answers='["[node]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">[node]</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">18</td><td class="lc"><span class="seg">        maps = {}</span></td></tr>
<tr><td class="ln">19</td><td class="lc"><span class="seg">        while len(queue) &gt; 0:</span></td></tr>
<tr><td class="ln">20</td><td class="lc"><span class="seg">            curr = queue.popleft()</span></td></tr>
<tr><td class="ln">21</td><td class="lc"><span class="seg">            maps[curr] = </span><span class="blank-group"><input type="text" class="blank" data-answer="Node(curr.val)" data-answers='["Node(curr.val)"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">Node(curr.val)</span></span></td></tr>
<tr><td class="ln">22</td><td class="lc"><span class="seg">            for nei in curr.neighbors:</span></td></tr>
<tr><td class="ln">23</td><td class="lc"><span class="seg">                if nei not in </span><span class="blank-group"><input type="text" class="blank" data-answer="maps" data-answers='["maps"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">maps</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">24</td><td class="lc"><span class="seg">                    queue.append(</span><span class="blank-group"><input type="text" class="blank" data-answer="nei" data-answers='["nei"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">nei</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">25</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">26</td><td class="lc"><span class="seg">        for old_node, new_node in maps.items():</span></td></tr>
<tr><td class="ln">27</td><td class="lc"><span class="seg">            for old_nei in old_node.neighbors:</span></td></tr>
<tr><td class="ln">28</td><td class="lc"><span class="seg">                newNei = maps[</span><span class="blank-group"><input type="text" class="blank" data-answer="old_nei" data-answers='["old_nei"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">old_nei</span></span><span class="seg">]</span></td></tr>
<tr><td class="ln">29</td><td class="lc"><span class="seg">                new_node.neighbors.append(</span><span class="blank-group"><input type="text" class="blank" data-answer="newNei" data-answers='["newNei"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">newNei</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">30</td><td class="lc"><span class="seg">        return </span><span class="blank-group"><input type="text" class="blank" data-answer="maps[node]" data-answers='["maps[node]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">maps[node]</span></span></td></tr>`,
    },
    {
      num: '547',
      name: 'Number of Provinces',
      url: 'https://leetcode.com/problems/number-of-provinces/description/',
      layout: 'stack',
      solutions: [
        {
          title: 'BFS',
          codeTableHtml: `<tr><td class="ln">1</td><td class="lc"><span class="seg">class Solution:</span></td></tr>
<tr><td class="ln">2</td><td class="lc"><span class="seg">    def findCircleNum(self, isConnected: List[List[int]]) -&gt; int:</span></td></tr>
<tr><td class="ln">3</td><td class="lc"><span class="seg">        visited = set()</span></td></tr>
<tr><td class="ln">4</td><td class="lc"><span class="seg">        ans = 0</span></td></tr>
<tr><td class="ln">5</td><td class="lc"><span class="seg">        for i in range(len(isConnected)):</span></td></tr>
<tr><td class="ln">6</td><td class="lc"><span class="seg">            if i in </span><span class="blank-group"><input type="text" class="blank" data-answer="visited" data-answers='["visited"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">visited</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">7</td><td class="lc"><span class="seg">                continue</span></td></tr>
<tr><td class="ln">8</td><td class="lc"><span class="seg">            ans += </span><span class="blank-group"><input type="text" class="blank" data-answer="1" data-answers='["1"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">1</span></span></td></tr>
<tr><td class="ln">9</td><td class="lc"><span class="seg">            self.bfs(i, visited, isConnected)</span></td></tr>
<tr><td class="ln">10</td><td class="lc"><span class="seg">        return ans</span></td></tr>
<tr><td class="ln">11</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">12</td><td class="lc"><span class="seg">    def bfs(self, i, visited, isConnected):</span></td></tr>
<tr><td class="ln">13</td><td class="lc"><span class="seg">        import collections</span></td></tr>
<tr><td class="ln">14</td><td class="lc"><span class="seg">        queue = collections.deque(</span><span class="blank-group"><input type="text" class="blank" data-answer="[i]" data-answers='["[i]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">[i]</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">15</td><td class="lc"><span class="seg">        visited.add(</span><span class="blank-group"><input type="text" class="blank" data-answer="i" data-answers='["i"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">i</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">16</td><td class="lc"><span class="seg">        while queue:</span></td></tr>
<tr><td class="ln">17</td><td class="lc"><span class="seg">            curr = queue.popleft()</span></td></tr>
<tr><td class="ln">18</td><td class="lc"><span class="seg">            for neighbor in range(len(isConnected)):</span></td></tr>
<tr><td class="ln">19</td><td class="lc"><span class="seg">                if </span><span class="blank-group"><input type="text" class="blank" data-answer="isConnected[curr][neighbor]" data-answers='["isConnected[curr][neighbor]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">isConnected[curr][neighbor]</span></span><span class="seg"> and </span><span class="blank-group"><input type="text" class="blank" data-answer="neighbor not in visited" data-answers='["neighbor not in visited"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbor not in visited</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">20</td><td class="lc"><span class="seg">                    visited.add(neighbor)</span></td></tr>
<tr><td class="ln">21</td><td class="lc"><span class="seg">                    queue.append(</span><span class="blank-group"><input type="text" class="blank" data-answer="neighbor" data-answers='["neighbor"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbor</span></span><span class="seg">)</span></td></tr>`,
        },
        {
          title: 'DFS',
          codeTableHtml: `<tr><td class="ln">1</td><td class="lc"><span class="seg">class Solution:</span></td></tr>
<tr><td class="ln">2</td><td class="lc"><span class="seg">    def findCircleNum(self, isConnected: List[List[int]]) -&gt; int:</span></td></tr>
<tr><td class="ln">3</td><td class="lc"><span class="seg">        visited = set()</span></td></tr>
<tr><td class="ln">4</td><td class="lc"><span class="seg">        ans = 0</span></td></tr>
<tr><td class="ln">5</td><td class="lc"><span class="seg">        for i in range(len(isConnected)):</span></td></tr>
<tr><td class="ln">6</td><td class="lc"><span class="seg">            if i in </span><span class="blank-group"><input type="text" class="blank" data-answer="visited" data-answers='["visited"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">visited</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">7</td><td class="lc"><span class="seg">                continue</span></td></tr>
<tr><td class="ln">8</td><td class="lc"><span class="seg">            ans += </span><span class="blank-group"><input type="text" class="blank" data-answer="1" data-answers='["1"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">1</span></span></td></tr>
<tr><td class="ln">9</td><td class="lc"><span class="seg">            self.dfs(i, visited, isConnected)</span></td></tr>
<tr><td class="ln">10</td><td class="lc"><span class="seg">        return ans</span></td></tr>
<tr><td class="ln">11</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">12</td><td class="lc"><span class="seg">    def dfs(self, i, visited, isConnected):</span></td></tr>
<tr><td class="ln">13</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">14</td><td class="lc"><span class="seg">        for neighbor in range(</span><span class="blank-group"><input type="text" class="blank" data-answer="len(isConnected)" data-answers='["len(isConnected)"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">len(isConnected)</span></span><span class="seg">):</span></td></tr>
<tr><td class="ln">15</td><td class="lc"><span class="seg">            if isConnected[i][neighbor] and </span><span class="blank-group"><input type="text" class="blank" data-answer="neighbor not in visited" data-answers='["neighbor not in visited"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbor not in visited</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">16</td><td class="lc"><span class="seg">                visited.add(</span><span class="blank-group"><input type="text" class="blank" data-answer="neighbor" data-answers='["neighbor"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbor</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">17</td><td class="lc"><span class="seg">                self.dfs(</span><span class="blank-group"><input type="text" class="blank" data-answer="neighbor" data-answers='["neighbor"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbor</span></span><span class="seg">, visited, isConnected)</span></td></tr>`,
        },
      ],
    },
    {
      num: '863',
      name: 'All Nodes Distance K in Binary Tree',
      url: 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/description/',
      codeTableHtml: `<tr><td class="ln">1</td><td class="lc"><span class="cm"># Definition for a binary tree node.</span></td></tr>
<tr><td class="ln">2</td><td class="lc"><span class="cm"># class TreeNode:</span></td></tr>
<tr><td class="ln">3</td><td class="lc"><span class="cm">#     def __init__(self, x):</span></td></tr>
<tr><td class="ln">4</td><td class="lc"><span class="cm">#         self.val = x</span></td></tr>
<tr><td class="ln">5</td><td class="lc"><span class="cm">#         self.left = None</span></td></tr>
<tr><td class="ln">6</td><td class="lc"><span class="cm">#         self.right = None</span></td></tr>
<tr><td class="ln">7</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">8</td><td class="lc"><span class="seg">class Solution:</span></td></tr>
<tr><td class="ln">9</td><td class="lc"><span class="seg">    def distanceK(self, root: TreeNode, target: TreeNode, k: int) -&gt; List[int]:</span></td></tr>
<tr><td class="ln">10</td><td class="lc"><span class="seg">        graph = collections.</span><span class="blank-group"><input type="text" class="blank" data-answer="defaultdict(list)" data-answers='["defaultdict(list)"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">defaultdict(list)</span></span></td></tr>
<tr><td class="ln">11</td><td class="lc"><span class="seg">        self.dfs(root, graph, </span><span class="blank-group"><input type="text" class="blank" data-answer="None" data-answers='["None"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">None</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">12</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">13</td><td class="lc"><span class="seg">        queue = collections.deque(</span><span class="blank-group"><input type="text" class="blank" data-answer="[target]" data-answers='["[target]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">[target]</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">14</td><td class="lc"><span class="seg">        visited = set()</span></td></tr>
<tr><td class="ln">15</td><td class="lc"><span class="seg">        visited.add(</span><span class="blank-group"><input type="text" class="blank" data-answer="target" data-answers='["target"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">target</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">16</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">17</td><td class="lc"><span class="seg">        while len(queue) &gt; 0 and </span><span class="blank-group"><input type="text" class="blank" data-answer="k >= 0" data-answers='["k >= 0","k>=0","k >=0"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">k &gt;= 0</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">18</td><td class="lc"><span class="seg">            size = len(queue)</span></td></tr>
<tr><td class="ln">19</td><td class="lc"><span class="seg">            res = []</span></td></tr>
<tr><td class="ln">20</td><td class="lc"><span class="seg">            for _ in range(size):</span></td></tr>
<tr><td class="ln">21</td><td class="lc"><span class="seg">                curr = queue.popleft()</span></td></tr>
<tr><td class="ln">22</td><td class="lc"><span class="seg">                res.append(</span><span class="blank-group"><input type="text" class="blank" data-answer="curr.val" data-answers='["curr.val"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">curr.val</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">23</td><td class="lc"><span class="seg">                for neighbour in </span><span class="blank-group"><input type="text" class="blank" data-answer="graph[curr]" data-answers='["graph[curr]"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">graph[curr]</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">24</td><td class="lc"><span class="seg">                    if </span><span class="blank-group"><input type="text" class="blank" data-answer="neighbour not in visited" data-answers='["neighbour not in visited"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">neighbour not in visited</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">25</td><td class="lc"><span class="seg">                        visited.add(neighbour)</span></td></tr>
<tr><td class="ln">26</td><td class="lc"><span class="seg">                        queue.append(neighbour)</span></td></tr>
<tr><td class="ln">27</td><td class="lc"><span class="seg">            </span><span class="blank-group"><input type="text" class="blank" data-answer="k -= 1" data-answers='["k -= 1","k-=1","k-= 1"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">k -= 1</span></span></td></tr>
<tr><td class="ln">28</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">29</td><td class="lc"><span class="seg">        if k == </span><span class="blank-group"><input type="text" class="blank" data-answer="-1" data-answers='["-1"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">-1</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">30</td><td class="lc"><span class="seg">            return res</span></td></tr>
<tr><td class="ln">31</td><td class="lc"><span class="seg">        else:</span></td></tr>
<tr><td class="ln">32</td><td class="lc"><span class="seg">            return []</span></td></tr>
<tr><td class="ln">33</td><td class="lc"><span class="seg"></span></td></tr>
<tr><td class="ln">34</td><td class="lc"><span class="seg">    def dfs(self, node, graph, parent):</span></td></tr>
<tr><td class="ln">35</td><td class="lc"><span class="seg">        if </span><span class="blank-group"><input type="text" class="blank" data-answer="parent" data-answers='["parent"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">parent</span></span><span class="seg">:</span></td></tr>
<tr><td class="ln">36</td><td class="lc"><span class="seg">            graph[node].append(</span><span class="blank-group"><input type="text" class="blank" data-answer="parent" data-answers='["parent"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">parent</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">37</td><td class="lc"><span class="seg">        if node.left:</span></td></tr>
<tr><td class="ln">38</td><td class="lc"><span class="seg">            graph[node].append(</span><span class="blank-group"><input type="text" class="blank" data-answer="node.left" data-answers='["node.left"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">node.left</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">39</td><td class="lc"><span class="seg">            self.dfs(node.left, graph, </span><span class="blank-group"><input type="text" class="blank" data-answer="node" data-answers='["node"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">node</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">40</td><td class="lc"><span class="seg">        if node.right:</span></td></tr>
<tr><td class="ln">41</td><td class="lc"><span class="seg">            graph[node].append(</span><span class="blank-group"><input type="text" class="blank" data-answer="node.right" data-answers='["node.right"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">node.right</span></span><span class="seg">)</span></td></tr>
<tr><td class="ln">42</td><td class="lc"><span class="seg">            self.dfs(node.right, graph, </span><span class="blank-group"><input type="text" class="blank" data-answer="node" data-answers='["node"]' autocomplete="off"><span class="ind" aria-hidden="true"></span><span class="answer-ref">node</span></span><span class="seg">)</span></td></tr>`,
    },
  ];

  window.CH05_FILL_TOPO = [
    p(269, 'Alien Dictionary', 'alien-dictionary'),
    p(332, 'Reconstruct Itinerary', 'reconstruct-itinerary'),
  ];

  window.CH05_FILL_UNION_FIND = [
    p(323, 'Number of Connected Components in an Undirected Graph', 'number-of-connected-components-in-an-undirected-graph'),
  ];
})();