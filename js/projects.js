(function () {
  'use strict';

  var cards = Array.from(document.querySelectorAll('#projects-grid article'));
  var tagFiltersEl = document.getElementById('tag-filters');
  var countEl = document.getElementById('project-count');
  var sortSelect = document.getElementById('sort-select');
  var noResults = document.getElementById('no-results');
  var clearFiltersBtn = document.getElementById('clear-filters');

  // Track selected tags (empty Set = show all)
  var selectedTags = new Set();

  // ------------------------------------------------------------------
  // 1. Collect all unique tags across every project card
  // ------------------------------------------------------------------
  function getAllTags() {
    var tagSet = new Set();
    cards.forEach(function (card) {
      var raw = card.getAttribute('data-tags') || '';
      raw.split(',').forEach(function (t) {
        var tag = t.trim();
        if (tag) tagSet.add(tag);
      });
    });
    return Array.from(tagSet).sort();
  }

  // ------------------------------------------------------------------
  // 2. Build the filter chip UI
  // ------------------------------------------------------------------
  function buildTagFilters() {
    var tags = getAllTags();

    // "All" chip
    var allChip = document.createElement('button');
    allChip.className = 'filter-chip filter-chip--active';
    allChip.dataset.tag = '__all__';
    allChip.textContent = 'All';
    allChip.addEventListener('click', function () {
      selectedTags.clear();
      applyFilters();
      updateChipStates();
    });
    tagFiltersEl.appendChild(allChip);

    // One chip per tag
    tags.forEach(function (tag) {
      var chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.dataset.tag = tag;
      chip.textContent = tag;
      chip.addEventListener('click', function () {
        if (selectedTags.has(tag)) {
          selectedTags.delete(tag);
        } else {
          selectedTags.add(tag);
        }
        applyFilters();
        updateChipStates();
      });
      tagFiltersEl.appendChild(chip);
    });
  }

  // ------------------------------------------------------------------
  // 3. Update chip active states
  // ------------------------------------------------------------------
  function updateChipStates() {
    var chips = tagFiltersEl.querySelectorAll('.filter-chip');
    chips.forEach(function (chip) {
      var tag = chip.dataset.tag;
      if (tag === '__all__') {
        chip.classList.toggle('filter-chip--active', selectedTags.size === 0);
      } else {
        chip.classList.toggle('filter-chip--active', selectedTags.has(tag));
      }
    });
  }

  // ------------------------------------------------------------------
  // 4. Filter + sort cards, then update the DOM
  // ------------------------------------------------------------------
  function applyFilters() {
    // Filter
    var visible = cards.filter(function (card) {
      if (selectedTags.size === 0) return true;
      var cardTags = (card.getAttribute('data-tags') || '')
        .split(',')
        .map(function (t) { return t.trim(); });
      // Show card if it has ANY of the selected tags (OR logic)
      return Array.from(selectedTags).some(function (sel) {
        return cardTags.indexOf(sel) !== -1;
      });
    });

    // Sort
    var sortOrder = sortSelect ? sortSelect.value : 'newest';
    visible.sort(function (a, b) {
      var dateA = new Date(a.getAttribute('data-date') || '1970-01-01');
      var dateB = new Date(b.getAttribute('data-date') || '1970-01-01');
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Re-number only the visible cards (#1, #2, …)
    var grid = document.getElementById('projects-grid');
    var allNumberEls = grid.querySelectorAll('.project-number');

    // Hide all cards first
    cards.forEach(function (card) {
      card.style.display = 'none';
    });

    // Show and re-order visible cards
    visible.forEach(function (card, idx) {
      card.style.display = '';
      // Update the displayed number
      var numEl = card.querySelector('.project-number');
      if (numEl) {
        numEl.textContent = '#' + (idx + 1);
      }
      // Move to end of grid (preserves sort order in DOM)
      grid.appendChild(card);
    });

    // Count label
    if (countEl) {
      var total = cards.length;
      if (visible.length === total) {
        countEl.textContent = total + ' project' + (total !== 1 ? 's' : '');
      } else {
        countEl.textContent = visible.length + ' of ' + total + ' project' + (total !== 1 ? 's' : '');
      }
    }

    // Empty state
    if (noResults) {
      noResults.classList.toggle('hidden', visible.length > 0);
    }
  }

  // ------------------------------------------------------------------
  // 5. "Clear filters" button inside empty state
  // ------------------------------------------------------------------
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function () {
      selectedTags.clear();
      applyFilters();
      updateChipStates();
    });
  }

  // ------------------------------------------------------------------
  // 6. Sort select change
  // ------------------------------------------------------------------
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------
  buildTagFilters();
  applyFilters();

})();
