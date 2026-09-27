/**
 * Chapter 2 — Tree Python DFS 模板（挖空），与 chapters/ch02/ch02-notes.html 正文一致。
 */
window.CH02_TREE_PYTHON_TEMPLATE = {
  id: 'ch2-tree-py',
  title: 'Tree Python 模板',
  codeTableHtml: `<tr>
<td class="ln">1</td>
<td class="lc"><span class="seg">def </span><span class="blank-group"><input type="text" class="blank" data-answer="dfs" data-answers='["dfs"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">dfs</span></span><span class="seg">(self, root):</span></td>
</tr>
<tr>
<td class="ln">2</td>
<td class="lc"><span class="seg">    if </span><span class="blank-group"><input type="text" class="blank" data-answer="not" data-answers='["not"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">not</span></span><span class="seg"> root:</span></td>
</tr>
<tr>
<td class="ln">3</td>
<td class="lc"><span class="seg">        return </span><span class="blank-group"><input type="text" class="blank" data-answer="0" data-answers='["0"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">0</span></span></td>
</tr>
<tr>
<td class="ln">4</td>
<td class="lc"><span class="seg"></span></td>
</tr>
<tr>
<td class="ln">5</td>
<td class="lc"><span class="seg">    leftReturn = self.</span><span class="blank-group"><input type="text" class="blank" data-answer="dfs" data-answers='["dfs"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">dfs</span></span><span class="seg">(root.left)</span></td>
</tr>
<tr>
<td class="ln">6</td>
<td class="lc"><span class="seg">    rightReturn = self.</span><span class="blank-group"><input type="text" class="blank" data-answer="dfs" data-answers='["dfs"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">dfs</span></span><span class="seg">(root.right)</span></td>
</tr>
<tr>
<td class="ln">7</td>
<td class="lc"><span class="seg"></span></td>
</tr>
<tr>
<td class="ln">8</td>
<td class="lc"><span class="cm">    # Optional Leaf processing</span></td>
</tr>
<tr>
<td class="ln">9</td>
<td class="lc"><span class="seg">    if root.left </span><span class="blank-group"><input type="text" class="blank" data-answer="is None" data-answers='["is None"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">is None</span></span><span class="seg"> and root.right </span><span class="blank-group"><input type="text" class="blank" data-answer="is None" data-answers='["is None"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">is None</span></span><span class="seg">:</span></td>
</tr>
<tr>
<td class="ln">10</td>
<td class="lc"><span class="seg">        return </span><span class="blank-group"><input type="text" class="blank" data-answer="1" data-answers='["1"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">1</span></span></td>
</tr>
<tr>
<td class="ln">11</td>
<td class="lc"><span class="seg"></span></td>
</tr>
<tr>
<td class="ln">12</td>
<td class="lc"><span class="seg">    height = </span><span class="blank-group"><input type="text" class="blank" data-answer="max(leftReturn, rightReturn) + 1" data-answers='["max(leftReturn, rightReturn) + 1"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">max(leftReturn, rightReturn) + 1</span></span></td>
</tr>
<tr>
<td class="ln">13</td>
<td class="lc"><span class="seg">    return </span><span class="blank-group"><input type="text" class="blank" data-answer="height" data-answers='["height"]' autocomplete="off" /><span class="ind" aria-hidden="true"></span><span class="answer-ref">height</span></span></td>
</tr>`,
};
