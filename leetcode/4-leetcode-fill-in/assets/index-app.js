/**
 * index 入口：hash 路由，串联课件区与填空区
 */
(function () {
  'use strict';

  const F = window.FillExerciseIndex;
  const C = window.CoursewareIndex;
  if (!F || !C) {
    throw new Error('Missing fill-exercise-index.js or courseware-index.js');
  }

  function applyRouteFromHash() {
    const route = F.parseHash();
    if (route.kind === 'ch2TreePy') {
      F.showCh2TreePythonTemplate();
      return;
    }
    if (route.kind === 'ch2Problem') {
      F.renderCh2Problem(route.num);
      return;
    }
    if (route.kind === 'ch3Problem') {
      const p = F.findCh3Problem(route.num, route.group);
      if (p) { F.openCh3Problem(p, route.group); return; }
      C.showNotesCh3(); return;
    }
    if (route.kind === 'ch5Problem') {
      const p = F.findCh5Problem(route.num, route.group);
      if (p) { F.openCh5Problem(p, route.group); return; }
      C.showNotesCh5(); return;
    }
    if (route.kind === 'ch6Problem') {
      const p = F.findCh6Problem(route.num, route.group);
      if (p) { F.openCh6Problem(p, route.group); return; }
      C.showNotesCh6(); return;
    }
    if (route.kind === 'ch7Problem') {
      const p = F.findCh7Problem(route.num, route.group);
      if (p) { F.openCh7Problem(p, route.group); return; }
      C.showNotesCh7(); return;
    }
    if (route.kind === 'ch8Problem') {
      const p = F.findCh8Problem(route.num, route.group);
      if (p) { F.openCh8Problem(p, route.group); return; }
      C.showNotesCh8(); return;
    }
    if (route.kind === 'ch9Problem') {
      const p = F.findCh9Problem(route.num, route.group);
      if (p) { F.openCh9Problem(p, route.group); return; }
      C.showNotesCh9(); return;
    }
    if (!F.PROBLEMS || !F.PROBLEMS.length) return;
    if (route.kind === 'notes') {
      if (route.chapter === 7) C.showNotesCh7();
      else if (route.chapter === 6) C.showNotesCh6();
      else if (route.chapter === 5) C.showNotesCh5();
      else if (route.chapter === 4) C.showNotesCh4();
      else if (route.chapter === 3) C.showNotesCh3();
      else if (route.chapter === 2) C.showNotesCh2();
      else C.showNotes();
    } else {
      F.renderProblem(F.indexFromNum(route.num));
    }
  }

  try {
    F.buildTabs();
    F.buildCh2Tabs();
    F.buildCh3Tabs();
    F.buildCh5Tabs();
    F.buildCh6Tabs();
    F.buildCh7Tabs();
    F.buildCh8Tabs();
    F.buildCh9Tabs();
    applyRouteFromHash();
  } catch (e) {
    throw e;
  }

  history.scrollRestoration = 'manual';

  const shell = window.AppShellLayout;
  if (shell && shell.syncNavFromTitle) {
    shell.syncNavFromTitle();
  }

  window.addEventListener('hashchange', applyRouteFromHash);
})();
