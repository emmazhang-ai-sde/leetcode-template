/**
 * index 中课件 iframe 区：切换章节课件、与填空区互斥显示
 */
(function () {
  'use strict';

  const F = () => window.FillExerciseIndex;
  if (!F()) {
    console.error('fill-exercise-index.js must load before courseware-index.js');
    return;
  }

  function clearProblemTabSelection() {
    document.querySelectorAll(
      '#probTabs .prob-tab, #ooxxTabs .prob-tab, #ch2Tabs .prob-tab, #ch2TraversalTabs .prob-tab, #ch2DfsTabs .prob-tab, #ch3BfsTreeTabs .prob-tab, #ch3TopoTabs .prob-tab, #ch3DijkstraTabs .prob-tab, #ch5BfsTabs .prob-tab, #ch5DfsTabs .prob-tab, #ch5GraphTheoryTabs .prob-tab, #ch5TopoTabs .prob-tab, #ch5UfTabs .prob-tab'
    ).forEach((btn) => {
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-selected', 'false');
    });
  }

  function showNotes() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(1);
    const notesPanel = document.getElementById('chapterNotesPanel');
    const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
    const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
    const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
    const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
    const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
    const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
    const probPanel = document.getElementById('probPanel');
    if (notesPanel) notesPanel.hidden = false;
    if (notesPanelCh2) notesPanelCh2.hidden = true;
    if (notesPanelCh3) notesPanelCh3.hidden = true;
    if (notesPanelCh4) notesPanelCh4.hidden = true;
    if (notesPanelCh5) notesPanelCh5.hidden = true;
    if (notesPanelCh6) notesPanelCh6.hidden = true;
    if (notesPanelCh7) notesPanelCh7.hidden = true;
    if (probPanel) probPanel.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: true,
      notesCh7Mode: false,
      notesCh2Mode: false,
      notesCh3Mode: false,
      notesCh4Mode: false,
      notesCh5Mode: false,
      ch2TreePyMode: false,
      ch2FillGroup: null,
      ch3FillGroup: null,
    });
    document.title = 'Chapter 1: Binary Search（二分法）· 洛岩老师课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch1');
  }

  function showNotesCh2() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(2);
    const notesPanel = document.getElementById('chapterNotesPanel');
    const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
    const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
    const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
    const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
    const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
    const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
    const probPanel = document.getElementById('probPanel');
    if (notesPanel) notesPanel.hidden = true;
    if (notesPanelCh2) notesPanelCh2.hidden = false;
    if (notesPanelCh3) notesPanelCh3.hidden = true;
    if (notesPanelCh4) notesPanelCh4.hidden = true;
    if (notesPanelCh5) notesPanelCh5.hidden = true;
    if (notesPanelCh6) notesPanelCh6.hidden = true;
    if (notesPanelCh7) notesPanelCh7.hidden = true;
    if (probPanel) probPanel.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: false,
      notesCh7Mode: false,
      notesCh2Mode: true,
      notesCh3Mode: false,
      notesCh4Mode: false,
      notesCh5Mode: false,
      ch2TreePyMode: false,
      ch2FillGroup: null,
      ch3FillGroup: null,
    });
    document.title = 'Chapter 2: Binary Trees + Divide and Conquer · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch2');
  }

  function showNotesCh3() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(3);
    const notesPanel = document.getElementById('chapterNotesPanel');
    const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
    const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
    const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
    const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
    const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
    const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
    const probPanel = document.getElementById('probPanel');
    if (notesPanel) notesPanel.hidden = true;
    if (notesPanelCh2) notesPanelCh2.hidden = true;
    if (notesPanelCh3) notesPanelCh3.hidden = false;
    if (notesPanelCh4) notesPanelCh4.hidden = true;
    if (notesPanelCh5) notesPanelCh5.hidden = true;
    if (notesPanelCh6) notesPanelCh6.hidden = true;
    if (notesPanelCh7) notesPanelCh7.hidden = true;
    if (probPanel) probPanel.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: false,
      notesCh7Mode: false,
      notesCh2Mode: false,
      notesCh3Mode: true,
      notesCh4Mode: false,
      notesCh5Mode: false,
      ch2TreePyMode: false,
      ch2FillGroup: null,
      ch3FillGroup: null,
    });
    document.title = 'Chapter 3: BFS + Topological Sorting · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch3');
  }

  function showNotesCh4() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(4);
    const notesPanel = document.getElementById('chapterNotesPanel');
    const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
    const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
    const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
    const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
    const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
    const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
    const probPanel = document.getElementById('probPanel');
    if (notesPanel) notesPanel.hidden = true;
    if (notesPanelCh2) notesPanelCh2.hidden = true;
    if (notesPanelCh3) notesPanelCh3.hidden = true;
    if (notesPanelCh4) notesPanelCh4.hidden = false;
    if (notesPanelCh5) notesPanelCh5.hidden = true;
    if (notesPanelCh6) notesPanelCh6.hidden = true;
    if (notesPanelCh7) notesPanelCh7.hidden = true;
    if (probPanel) probPanel.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: false,
      notesCh7Mode: false,
      notesCh2Mode: false,
      notesCh3Mode: false,
      notesCh4Mode: true,
      notesCh5Mode: false,
      ch2TreePyMode: false,
      ch2FillGroup: null,
      ch3FillGroup: null,
    });
    document.title = 'Chapter 4: DFS · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch4');
  }

  function showNotesCh5() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(5);
    const notesPanel = document.getElementById('chapterNotesPanel');
    const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
    const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
    const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
    const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
    const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
    const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
    const probPanel = document.getElementById('probPanel');
    if (notesPanel) notesPanel.hidden = true;
    if (notesPanelCh2) notesPanelCh2.hidden = true;
    if (notesPanelCh3) notesPanelCh3.hidden = true;
    if (notesPanelCh4) notesPanelCh4.hidden = true;
    if (notesPanelCh5) notesPanelCh5.hidden = false;
    if (notesPanelCh6) notesPanelCh6.hidden = true;
    if (notesPanelCh7) notesPanelCh7.hidden = true;
    if (probPanel) probPanel.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().clearCh5TabSelection();
    F().updateNavCategoryHeads(0, {
      notesMode: false,
      notesCh7Mode: false,
      notesCh2Mode: false,
      notesCh3Mode: false,
      notesCh4Mode: false,
      notesCh5Mode: true,
      ch2TreePyMode: false,
      ch2FillGroup: null,
      ch3FillGroup: null,
    });
    document.title = 'Chapter 5: Graph · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch5');
  }

  function showNotesCh6() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(6);
    const notesPanel = document.getElementById('chapterNotesPanel');
    const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
    const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
    const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
    const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
    const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
    const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
    const probPanel = document.getElementById('probPanel');
    if (notesPanel) notesPanel.hidden = true;
    if (notesPanelCh2) notesPanelCh2.hidden = true;
    if (notesPanelCh3) notesPanelCh3.hidden = true;
    if (notesPanelCh4) notesPanelCh4.hidden = true;
    if (notesPanelCh5) notesPanelCh5.hidden = true;
    if (notesPanelCh6) notesPanelCh6.hidden = false;
    if (notesPanelCh7) notesPanelCh7.hidden = true;
    if (probPanel) probPanel.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: false,
      notesCh7Mode: false,
      notesCh2Mode: false,
      notesCh3Mode: false,
      notesCh4Mode: false,
      notesCh5Mode: false,
      notesCh6Mode: true,
      ch2TreePyMode: false,
      ch2FillGroup: null,
      ch3FillGroup: null,
    });
    document.title = 'Chapter 6: Two Pointer & Linked List · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch6');
  }

  function showNotesCh7() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(7);
    const notesPanel = document.getElementById('chapterNotesPanel');
    const notesPanelCh2 = document.getElementById('chapter2NotesPanel');
    const notesPanelCh3 = document.getElementById('chapter3NotesPanel');
    const notesPanelCh4 = document.getElementById('chapter4NotesPanel');
    const notesPanelCh5 = document.getElementById('chapter5NotesPanel');
    const notesPanelCh6 = document.getElementById('chapter6NotesPanel');
    const notesPanelCh7 = document.getElementById('chapter7NotesPanel');
    const probPanel = document.getElementById('probPanel');
    if (notesPanel) notesPanel.hidden = true;
    if (notesPanelCh2) notesPanelCh2.hidden = true;
    if (notesPanelCh3) notesPanelCh3.hidden = true;
    if (notesPanelCh4) notesPanelCh4.hidden = true;
    if (notesPanelCh5) notesPanelCh5.hidden = true;
    if (notesPanelCh6) notesPanelCh6.hidden = true;
    if (notesPanelCh7) notesPanelCh7.hidden = false;
    if (probPanel) probPanel.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: false,
      notesCh7Mode: true,
      notesCh2Mode: false,
      notesCh3Mode: false,
      notesCh4Mode: false,
      notesCh5Mode: false,
      ch2TreePyMode: false,
      ch2FillGroup: null,
      ch3FillGroup: null,
    });
    document.title = 'Chapter 7: Heap + TOP K + Monotonic Stack · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch7');
  }

  function showNotesCh8() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(8);
    const panels = ['chapterNotesPanel','chapter2NotesPanel','chapter3NotesPanel',
                    'chapter4NotesPanel','chapter5NotesPanel','chapter6NotesPanel','chapter7NotesPanel'];
    panels.forEach(function(id) { var el = document.getElementById(id); if (el) el.hidden = true; });
    const p8 = document.getElementById('chapter8NotesPanel');
    const prob = document.getElementById('probPanel');
    if (p8) p8.hidden = false;
    if (prob) prob.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: false, notesCh8Mode: true, notesCh7Mode: false,
      notesCh2Mode: false, notesCh3Mode: false, notesCh4Mode: false, notesCh5Mode: false, notesCh6Mode: false,
      ch2TreePyMode: false, ch2FillGroup: null, ch3FillGroup: null,
    });
    document.title = 'Chapter 8: Sliding Window + Sweep Line · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch8');
  }

  document.getElementById('navCategoryNotes').addEventListener('click', showNotes);
  document.getElementById('navCategoryNotesCh2').addEventListener('click', showNotesCh2);
  document.getElementById('navCategoryNotesCh3').addEventListener('click', showNotesCh3);
  document.getElementById('navCategoryNotesCh4').addEventListener('click', showNotesCh4);
  document.getElementById('navCategoryNotesCh5').addEventListener('click', showNotesCh5);
  document.getElementById('navCategoryNotesCh6').addEventListener('click', showNotesCh6);
  document.getElementById('navCategoryNotesCh7').addEventListener('click', showNotesCh7);
  function showNotesCh9() {
    if (window.AppShellLayout) window.AppShellLayout.setActiveChapterTab(9);
    const panels = ['chapterNotesPanel','chapter2NotesPanel','chapter3NotesPanel',
                    'chapter4NotesPanel','chapter5NotesPanel','chapter6NotesPanel',
                    'chapter7NotesPanel','chapter8NotesPanel'];
    panels.forEach(function(id) { var el = document.getElementById(id); if (el) el.hidden = true; });
    const p9 = document.getElementById('chapter9NotesPanel');
    const prob = document.getElementById('probPanel');
    if (p9) p9.hidden = false;
    if (prob) prob.hidden = true;
    clearProblemTabSelection();
    F().setCh2TemplateTabSelected(false);
    F().updateNavCategoryHeads(0, {
      notesMode: false, notesCh9Mode: true, notesCh8Mode: false, notesCh7Mode: false,
      notesCh2Mode: false, notesCh3Mode: false, notesCh4Mode: false, notesCh5Mode: false, notesCh6Mode: false,
      ch2TreePyMode: false, ch2FillGroup: null, ch3FillGroup: null,
    });
    document.title = 'Chapter 9: Prefix Sum + Stack + DP · 课件';
    if (typeof window.setRepoCornerBlobVisible === 'function') {
      window.setRepoCornerBlobVisible(false);
    }
    F().setHashSilently('#notes-ch9');
  }

  document.getElementById('navCategoryNotesCh8').addEventListener('click', showNotesCh8);
  document.getElementById('navCategoryNotesCh9').addEventListener('click', showNotesCh9);

  window.CoursewareIndex = {
    showNotes,
    showNotesCh2,
    showNotesCh3,
    showNotesCh4,
    showNotesCh5,
    showNotesCh6,
    showNotesCh7,
    showNotesCh8,
    showNotesCh9,
  };
})();
