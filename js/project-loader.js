(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 1. Parse simple YAML-style frontmatter
  //    Supports:  key: value  lines between opening and closing ---
  // ------------------------------------------------------------------
  function parseFrontmatter(raw) {
    var match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return { meta: {}, content: raw };

    var meta = {};
    match[1].split('\n').forEach(function (line) {
      var idx = line.indexOf(':');
      if (idx === -1) return;
      var key   = line.slice(0, idx).trim();
      var value = line.slice(idx + 1).trim();
      if (key) meta[key] = value;
    });

    return { meta: meta, content: match[2] };
  }

  // ------------------------------------------------------------------
  // 2. Read ?file= URL param
  // ------------------------------------------------------------------
  var params   = new URLSearchParams(window.location.search);
  var mdFile   = params.get('file');

  var loadingEl = document.getElementById('proj-loading');
  var headerEl  = document.getElementById('proj-header');
  var hrEl      = document.getElementById('proj-hr');
  var contentEl = document.getElementById('proj-content');
  var navEl     = document.getElementById('proj-nav');
  var titleEl   = document.getElementById('proj-title');
  var timeEl    = document.getElementById('proj-time');
  var tagsEl    = document.getElementById('proj-tags');
  var linksEl   = document.getElementById('proj-links');
  var prevEl    = document.getElementById('proj-prev-container');
  var nextEl    = document.getElementById('proj-next-container');

  function showError(msg) {
    if (loadingEl) loadingEl.textContent = msg || 'Project not found.';
  }

  // Only allow bare filenames like "my-project.md" — no slashes or path traversal
  if (!mdFile || !/^[\w-]+\.md$/.test(mdFile)) {
    showError('No project specified.');
    return;
  }

  // ------------------------------------------------------------------
  // 3. Fetch → parse → render
  // ------------------------------------------------------------------
  fetch(mdFile)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function (raw) {
      var parsed  = parseFrontmatter(raw);
      var meta    = parsed.meta;
      var content = parsed.content;

      // Page title & meta description
      if (meta.title) {
        document.title = meta.title + ' \u2014 Shawn CLQ';
        var descEl = document.querySelector('meta[name="description"]');
        if (descEl) descEl.setAttribute('content', meta.title + ' \u2014 Shawn CLQ');
      }

      // H1
      if (titleEl) titleEl.textContent = meta.title || '';

      // Date
      if (timeEl) {
        timeEl.textContent = meta.date_display || '';
        if (meta.date_iso) timeEl.setAttribute('datetime', meta.date_iso);
      }

      // Tech tags
      if (tagsEl && meta.tags) {
        meta.tags.split(',').forEach(function (t) {
          var tag = t.trim();
          if (!tag) return;
          var span = document.createElement('span');
          span.className = 'dark-tag';
          span.textContent = tag;
          tagsEl.appendChild(span);
        });
      }

      // External links (GitHub + Live Demo)
      if (linksEl) {
        if (meta.github) {
          var ghLink = document.createElement('a');
          ghLink.href = meta.github;
          ghLink.target = '_blank';
          ghLink.rel = 'noopener noreferrer';
          ghLink.className = 'inline-flex items-center gap-1.5 text-gray-500 hover:text-accent transition-colors';
          ghLink.innerHTML =
            '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">' +
            '<path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 ' +
            '0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 ' +
            '17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 ' +
            '1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-' +
            '2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 ' +
            '3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 ' +
            '3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 ' +
            '0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-' +
            '5.373-12-12-12z"/></svg> View on GitHub';
          linksEl.appendChild(ghLink);
        }
        if (meta.demo) {
          var demoLink = document.createElement('a');
          demoLink.href = meta.demo;
          demoLink.target = '_blank';
          demoLink.rel = 'noopener noreferrer';
          demoLink.className = 'inline-flex items-center gap-1.5 text-gray-500 hover:text-accent transition-colors';
          demoLink.innerHTML =
            '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>' +
            '</svg> Live Demo';
          linksEl.appendChild(demoLink);
        }
      }

      // Render markdown into the content article
      if (contentEl) {
        contentEl.innerHTML = marked.parse(content);
      }

      // Prev / Next project navigation
      if (navEl) {
        if (meta.prev_file && meta.prev_title && prevEl) {
          var prevA = document.createElement('a');
          prevA.href = 'project.html?file=' + meta.prev_file;
          prevA.className = 'hover:text-accent transition-colors';
          prevA.textContent = '\u2190 ' + meta.prev_title;
          prevEl.appendChild(prevA);
        }
        if (meta.next_file && meta.next_title && nextEl) {
          var nextA = document.createElement('a');
          nextA.href = 'project.html?file=' + meta.next_file;
          nextA.className = 'hover:text-accent transition-colors';
          nextA.textContent = meta.next_title + ' \u2192';
          nextEl.appendChild(nextA);
        }
        navEl.classList.remove('hidden');
      }

      // Reveal content, hide loading indicator
      if (loadingEl) loadingEl.classList.add('hidden');
      if (headerEl)  headerEl.classList.remove('hidden');
      if (hrEl)      hrEl.classList.remove('hidden');
    })
    .catch(function () {
      showError('Could not load project. Make sure the .md file exists in the projects/ folder.');
    });

})();
