/**
 * index 整站壳层：侧栏宽度与视口变化（与课件/填空业务无关）
 */
(function () {
  'use strict';

  let navContentWidth = 0;

  function shouldUseStackedMobileNav() {
    return window.matchMedia('(max-width: 800px) and (pointer: coarse)').matches;
  }

  function syncNavFromTitle() {
    const nav = document.querySelector('.chapter-nav');
    if (!nav) return;
    if (shouldUseStackedMobileNav()) {
      nav.style.width = '';
      nav.style.flex = '';
      return;
    }

    const items = nav.querySelectorAll('.chapter-sidebar-title, .nav-category-head, .prob-tab');
    if (!items.length) return;

    const measure = document.createElement('div');
    measure.style.cssText = [
      'position:absolute',
      'visibility:hidden',
      'pointer-events:none',
      'height:0',
      'overflow:hidden',
      'left:0',
      'top:0',
      'white-space:nowrap',
    ].join(';');

    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('aria-controls');
      clone.style.width = 'max-content';
      clone.style.maxWidth = 'none';
      clone.style.whiteSpace = 'nowrap';
      clone.style.overflowWrap = 'normal';
      clone.style.wordBreak = 'normal';
      measure.appendChild(clone);
    });

    nav.appendChild(measure);
    const maxW = Math.max(...Array.from(measure.children).map((item) => item.scrollWidth));
    measure.remove();

    navContentWidth = Math.max(navContentWidth, Math.ceil(maxW) + 20);
    nav.style.flex = `0 0 ${navContentWidth}px`;
    nav.style.width = `${navContentWidth}px`;
  }

  function setActiveChapterTab(chNum) {
    const key = String(chNum);
    document.querySelectorAll('.chapter-tab').forEach((btn) => {
      const active = btn.dataset.chapter === key;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.chapter-panel').forEach((panel) => {
      panel.hidden = panel.dataset.chapter !== key;
    });
  }

  // Wire up chapter tab strip clicks (sidebar-only; right side is unchanged)
  document.querySelectorAll('.chapter-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveChapterTab(parseInt(btn.dataset.chapter, 10));
    });
  });

  let resizeDebounceTimer;
  window.addEventListener('resize', () => {
    syncNavFromTitle();
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(syncNavFromTitle, 120);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNavFromTitle);
  }

  window.AppShellLayout = {
    syncNavFromTitle,
    setActiveChapterTab,
  };
})();
