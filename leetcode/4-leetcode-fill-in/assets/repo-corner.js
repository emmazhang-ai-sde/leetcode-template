/**
 * 右上角：本地 Lyon 答案目录 + 本题对应答案文件。
 * 老师的 GitHub 仓库（QiuzhiLyon/Algo_class）2026-08-29 已下线，改指后端：
 *   /lyon/        —— 0-Lyon-Python + 0-my-answers 文件清单
 *   /lyon/<题号>  —— 按题号解析到答案文件，纯文本显示（Lyon 文件名不规则，
 *                    交给后端 _answer_index() 认前导数字，前端不猜文件名）
 */
(function () {
  'use strict';

  var TREE = '/lyon/';

  function buildBlobUrl(num) {
    return TREE + encodeURIComponent(String(num).trim());
  }

  function inject() {
    if (document.querySelector('.repo-corner-wrap')) return;

    var wrap = document.createElement('div');
    wrap.className = 'repo-corner-wrap';
    wrap.setAttribute('aria-label', 'Lyon 答案链接');

    var folder = document.createElement('a');
    folder.className = 'repo-corner repo-corner--folder';
    folder.href = TREE;
    folder.target = '_blank';
    folder.rel = 'noopener noreferrer';
    folder.textContent = '0-Lyon-Python';
    folder.title = '浏览本地 0-Lyon-Python / 0-my-answers 答案目录';
    folder.setAttribute('aria-label', '打开本地 Lyon 答案目录');

    var blob = document.createElement('a');
    blob.className = 'repo-corner repo-corner--blob';
    blob.target = '_blank';
    blob.rel = 'noopener noreferrer';
    blob.textContent = '本题 .py';
    blob.setAttribute('aria-label', '打开本题对应的 Python 答案文件');
    blob.hidden = true;

    wrap.appendChild(blob);
    wrap.appendChild(folder);
    document.body.appendChild(wrap);

    window.setRepoCornerBlob = function (num, name) {
      if (!blob) return;
      blob.href = buildBlobUrl(num);
      blob.title = '本地答案：' + num + '. ' + name;
    };

    window.setRepoCornerBlobVisible = function (show) {
      if (!blob) return;
      blob.hidden = !show;
    };

    syncBlobFromProbDom();
  }

  function syncBlobFromProbDom() {
    var numEl = document.getElementById('probNum');
    var nameEl = document.getElementById('probName');
    if (!numEl || !nameEl || !window.setRepoCornerBlob) return;
    var num = numEl.textContent.replace(/\./g, '').trim();
    var name = nameEl.textContent.trim();
    if (!num || !name) return;
    window.setRepoCornerBlob(num, name);
    window.setRepoCornerBlobVisible(true);
  }

  function boot() {
    // 课件页在 index 里以 iframe 嵌入时，父页面已有角标；子文档再注入会叠出两个角标
    if (window.self !== window.top) return;
    inject();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
