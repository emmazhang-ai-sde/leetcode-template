(function () {
  'use strict';

  const FB = window.FillBlanks;
  if (!FB) {
    console.error('fill-blanks.js must load before fill-core.js');
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('ct');
    if (!table) return;
    const inputs = FB.initBlanks(table);

    const btnCheck = document.getElementById('btnCheck');
    const btnReset = document.getElementById('btnReset');
    const btnReveal = document.getElementById('btnReveal');
    const btnCopy = document.getElementById('btnCopy');
    const btnToggleAnswers = document.getElementById('btnToggleAnswers');

    if (btnCheck) btnCheck.addEventListener('click', () => FB.checkAll(inputs));
    if (btnReset) btnReset.addEventListener('click', () => FB.resetAll(inputs));
    if (btnReveal) btnReveal.addEventListener('click', () => FB.revealAll(inputs));
    if (btnCopy) btnCopy.addEventListener('click', () => FB.copyMergedCode(table.closest('.code-with-actions') || document.body));
    if (btnToggleAnswers) {
      btnToggleAnswers.addEventListener('click', function () {
        const showing = document.body.classList.contains('answers-revealed');
        if (showing) {
          document.body.classList.remove('answers-revealed');
          this.setAttribute('aria-pressed', 'false');
          this.textContent = '显示参考答案';
        } else {
          document.body.classList.add('answers-revealed');
          this.setAttribute('aria-pressed', 'true');
          this.textContent = '隐藏参考答案';
        }
      });
    }
  });
})();
