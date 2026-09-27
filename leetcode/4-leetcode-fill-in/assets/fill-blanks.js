/**
 * 填空表格共用逻辑（index 与独立题页 fill-core 共用）。
 * 须在 fill-core.js 之前加载。
 */
(function () {
  'use strict';

  function normalize(s) {
    return String(s).trim().replace(/\s+/g, '');
  }

  function setWidth(el) {
    const minLen = parseInt(el.dataset.minLen, 10) || 0;
    const len = Math.max(el.value.length, minLen);
    el.style.width = len + 2 + 'ch';
  }

  function getAnswers(el) {
    try {
      const parsed = JSON.parse(el.dataset.answers || '[]');
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (_) {}
    return el.dataset.answer ? [el.dataset.answer] : [];
  }

  function checkOne(el) {
    const ind = el.nextElementSibling;
    if (!el.value.trim()) {
      el.className = 'blank';
      ind.textContent = '';
      ind.className = 'ind';
      return null;
    }
    const answers = getAnswers(el);
    const u = normalize(el.value);
    const ok = answers.some((a) => u === normalize(a));
    el.className = 'blank ' + (ok ? 'correct' : 'wrong');
    ind.textContent = ok ? '✓' : '✗';
    ind.className = 'ind ' + (ok ? 'correct' : 'wrong');
    return ok;
  }

  function initBlanks(container) {
    const inputs = [];
    container.querySelectorAll('input.blank').forEach((inp) => {
      const answers = getAnswers(inp);
      const primary = answers[0] || '';
      if (!inp.dataset.answer && primary) inp.dataset.answer = primary;
      if (!inp.dataset.answers && answers.length) {
        inp.dataset.answers = JSON.stringify(answers);
      }
      const maxLen = Math.max(...answers.map((a) => String(a).length), primary.length);
      inp.dataset.minLen = String(maxLen);
      inp.style.width = maxLen + 2 + 'ch';
      inp.spellcheck = false;
      inp.autocomplete = 'off';
      inp.setAttribute('autocorrect', 'off');
      inp.setAttribute('autocapitalize', 'none');
      inp.addEventListener('input', () => {
        setWidth(inp);
        checkOne(inp);
      });
      inputs.push(inp);
    });
    return inputs;
  }

  function checkAll(inputs) {
    let c = 0;
    inputs.forEach((el) => {
      if (checkOne(el) === true) c++;
    });
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = `得分：${c} / ${inputs.length}`;
  }

  function resetAll(inputs) {
    inputs.forEach((el) => {
      el.value = '';
      el.className = 'blank';
      const minLen = parseInt(el.dataset.minLen, 10) || 0;
      el.style.width = minLen + 2 + 'ch';
      const ind = el.nextElementSibling;
      if (ind) {
        ind.textContent = '';
        ind.className = 'ind';
      }
    });
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = '';
  }

  function revealAll(inputs) {
    inputs.forEach((el) => {
      const answers = getAnswers(el);
      el.value = answers[0] || '';
      setWidth(el);
      checkOne(el);
    });
  }

  function collectLineText(lc) {
    let s = '';
    for (let i = 0; i < lc.children.length; i++) {
      const node = lc.children[i];
      if (node.classList.contains('blank')) {
        s += node.value;
      } else if (node.classList.contains('ind') || node.classList.contains('answer-ref')) {
        continue;
      } else if (node.classList.contains('blank-group')) {
        for (let j = 0; j < node.children.length; j++) {
          const inner = node.children[j];
          if (inner.classList.contains('blank')) {
            s += inner.value;
          } else if (inner.classList.contains('ind') || inner.classList.contains('answer-ref')) {
            continue;
          } else {
            s += inner.textContent;
          }
        }
      } else {
        s += node.textContent;
      }
    }
    return s;
  }

  function fallbackCopy(text, showToast) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('已复制');
    } catch (_) {
      showToast('复制失败');
    }
    document.body.removeChild(ta);
  }

  function copyMergedCode(container) {
    const rows = container.querySelectorAll('.code-table tr');
    const lines = [];
    rows.forEach((tr) => {
      const lc = tr.querySelector('.lc');
      if (lc) lines.push(collectLineText(lc));
    });
    const text = lines.join('\n');
    const toast = document.getElementById('copyToast');

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-on');
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => toast.classList.remove('is-on'), 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('已复制')).catch(() => fallbackCopy(text, showToast));
    } else {
      fallbackCopy(text, showToast);
    }
  }

  window.FillBlanks = {
    normalize,
    setWidth,
    getAnswers,
    checkOne,
    initBlanks,
    checkAll,
    resetAll,
    revealAll,
    collectLineText,
    copyMergedCode,
    fallbackCopy,
  };
})();
