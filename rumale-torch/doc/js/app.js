(function () {
  var localStorage = {},
    sessionStorage = {};
  try {
    localStorage = window.localStorage;
  } catch (e) {}
  try {
    sessionStorage = window.sessionStorage;
  } catch (e) {}

  function nextAll(el, selector) {
    var nextEls = [];
    while (el = el.nextElementSibling) {
      if (el.matches(selector)) nextEls.push(el);
    }
    return nextEls;
  }

  function createSourceLinks() {
    document.querySelectorAll('.method_details_list .source_code').forEach(function(el) {
      var aNode = document.createElement('a');
      aNode.href = '#';
      aNode.className = 'toggleSource';
      aNode.appendChild(document.createTextNode('View source'));
      aNode.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.textContent === 'View source') {
          this.parentNode.nextElementSibling.style.display = 'block';
          this.textContent = 'Hide source';
        } else {
          this.parentNode.nextElementSibling.style.display = 'none';
          this.textContent = 'View source';
        }
      });
      var spanNode = document.createElement('span');
      spanNode.className = 'showSource';
      spanNode.appendChild(document.createTextNode('['));
      spanNode.appendChild(aNode);
      spanNode.appendChild(document.createTextNode(']'));
      el.parentNode.insertBefore(spanNode, el);
    });
  }

  function createDefineLinks() {
    var tHeight = 0;
    var defsEl = document.querySelector('.defines');
    if (defsEl) {
      var aNode = document.createElement('a');
      aNode.href = '#';
      aNode.className = 'toggleDefines';
      aNode.appendChild(document.createTextNode('more...'));
      aNode.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.textContent === 'more...') {
          tHeight = this.parentNode.previousElementSibling.innerHeight;
          this.previousElementSibling.style.display = 'inline';
          this.parentNode.previousElementSibling.style.height = this.parentNode.innerHeight + 'px';
          this.textContent = '(less)';
        } else {
          this.previousElementSibling.style.display = 'none';
          this.parentNode.previousElementSibling.style.height = tHeight + 'px';
          this.textContent = 'more...';
        }
      });
      defsEl.parentNode.insertBefore(aNode, defsEl.nextElementSibling);
    }
  }

  function createFullTreeLinks() {
    var tHeight = 0;
    var inhTreeEl = document.querySelector('.inheritanceTree');
    if (inhTreeEl) {
      inhTreeEl.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.textContent === 'show all') {
          tHeight = this.parentNode.previousElementSibling.innerHeight;
          this.parentNode.classList.add('showAll');
          this.parentNode.previousElementSibling.style.height = this.parentNode.innerHeight + 'px';
          this.textContent = '(hide)';
        } else {
          this.parentNode.classList.remove('showAll');
          this.parentNode.previousElementSibling.style.height = tHeight + 'px';
          this.textContent = 'show all';
        }
      });
    }
  }

  function searchFrameButtons() {
    document.querySelector('.full_list_link').addEventListener('click', function() {
      toggleSearchFrame(this, this.getAttribute('href'));
      return false;
    });
    window.addEventListener('message', function(e) {
      if (e.data === 'navEscape') {
        document.getElementById('nav').style.display = 'none';
        document.querySelectorAll('#search a').forEach(function(el) {
          el.classList.remove('active', 'inactive');
        });
        window.focus();
      }
    });
    window.addEventListener('resize', function(_e) {
      var lenVisibleSearch = 0;
      document.querySelectorAll('#search').forEach(function(el) {
        if (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) {
          lenVisibleSearch += 1;
        }
      });
      if (lenVisibleSearch === 0) {
        document.getElementById('nav').removeAttribute('style');
        document.querySelectorAll('#search a').forEach(function(el) {
          el.classList.remove('active', 'inactive');
        });
        window.focus();
      }
    });
  }

  function toggleSearchFrame(id, link) {
    var frame = document.getElementById('nav');
    document.querySelectorAll('#search a').forEach(function(el) {
      el.classList.remove('active');
      el.classList.add('inactive');
    });
    if (frame.getAttribute('src') === link && frame.style.display !== 'none') {
      frame.style.display = 'none';
      document.querySelectorAll('#search a').forEach(function(el) {
        el.classList.remove('active', 'inactive');
      });
    } else {
      id.classList.add('active');
      id.classList.remove('inactive');
      if (frame.getAttribute('src') !== link) {
        frame.setAttribute('src', link);
      }
      frame.style.display = 'block';
    }
  }

  function linkSummaries() {
    var sumSignEl = document.querySelector('.summary_signature');
    if (sumSignEl) {
      sumSignEl.addEventListener('click', function() {
        var aTag = this.getElementsByTagName('a')[0];
        if (aTag) document.location = aTag.getAttribute('href');
      });
    }
  }

  function summaryToggle() {
    var summaryToggles = document.querySelectorAll('.summary_toggle')
    if (summaryToggles.length === 0) return false;

    summaryToggles.forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.summaryCollapsed = this.textContent;
        document.querySelectorAll('.summary_toggle').forEach(function(toggleEl) {
          toggleEl.textContent = toggleEl.textContent == 'collapse' ? 'expand' : 'collapse';
          var next = nextAll(toggleEl.parentNode.parentNode, 'ul.summary')[0];
          if (next.classList.contains('compact')) {
            var firstSummary = nextAll(next, 'ul.summary')[0];
            firstSummary.style.display = firstSummary.style.display === 'none' ? 'block' : 'none';
            next.style.display = next.style.display === 'none' ? 'block' : 'none';
          } else if (next.classList.contains('summary')) {
            var list = document.createElement('ul');
            list.className = 'summary compact';
            list.innerHTML = next.innerHTML;
            list.querySelectorAll('.summary_desc, .note').forEach(function(noteEl) { noteEl.remove(); });
            list.querySelectorAll('a').forEach(function(aTag) {
              aTag.innerHTML = aTag.querySelector('strong').innerHTML;
              aTag.parentNode.innerHTML = aTag.outerHTML;
            });
            next.parentNode.insertBefore(list, next);
            next.style.display = next.style.display === 'none' ? 'block' : 'none';
          }
        });
        return false;
      });
    });
    if (localStorage.summaryCollapsed == 'collapse') {
      summaryToggles[0].click();
    } else {
      localStorage.summaryCollapsed = 'expand';
    }
  }

  function constantSummaryToggle() {
    var constantsSummaryToggles = document.querySelectorAll('.constants_summary_toggle')
    if (constantsSummaryToggles.length === 0) return;

    constantsSummaryToggles.forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.summaryCollapsed = this.textContent;
        document.querySelectorAll('.constants_summary_toggle').forEach(function(toggleEl) {
          toggleEl.textContent = toggleEl.textContent == "collapse" ? "expand" : "collapse";
          var next = nextAll(toggleEl.parentNode.parentNode, 'dl.constants')[0];
          if (next.classList.contains('compact')) {
            var firstConstant = nextAll(next, 'dl.constants')[0];
            firstConstant.style.display = firstConstant.style.display === 'none' ? 'block' : 'none';
            next.style.display = next.style.display === 'none' ? 'block' : 'none';
          } else if (next.classList.contains('constants')) {
            var list = document.createElement('dl');
            list.className = 'constants compact';
            list.innerHTML = next.innerHTML;
            list.querySelectorAll('dt').forEach(function(dtEl) {
              dtEl.classList.add('summary_signature');
              dtEl.textContent = dtEl.textContent.split('=')[0];
              if (dtEl.querySelectorAll('.deprecated').length > 0) {
                dtEl.classList.add('deprecated');
              }
            });
            // Add the value of the constant as "Tooltip" to the summary object
            list.querySelectorAll('pre.code').forEach(function(preEl) {
              var dtEl = preEl.parentNode.previousElementSibling;
              var tooltip = preEl.textContent;
              if (dtEl.classList.contains('deprecated')) {
                 tooltip = 'Deprecated. ' + tooltip;
              };
              dtEl.setAttribute('title', tooltip);
            });
            list.querySelectorAll('.docstring, .tags, dd').forEach(function(ddEl) { ddEl.remove(); });
            next.parentNode.insertBefore(list, next);
            next.style.display = next.style.display === 'none' ? 'block' : 'none';
          }
        });
        return false;
      });
    });
    if (localStorage.summaryCollapsed == "collapse") {
      constantsSummaryToggles[0].click();
    } else {
      localStorage.summaryCollapsed = "expand";
    }
  }

  function generateTOC() {
    if (document.querySelectorAll('#filecontents').length === 0) return;
    var _toc = document.createElement('ol');
    _toc.className = 'top';
    var show = false;
    var toc = _toc;
    var counter = 0;
    var tags = ['h2', 'h3', 'h4', 'h5', 'h6'];
    var i;
    var curli;
    if (document.querySelectorAll('#filecontents h1').length > 1) tags.unshift('h1');
    for (i = 0; i < tags.length; i++) { tags[i] = '#filecontents ' + tags[i]; }
    var lastTag = parseInt(tags[0][1], 10);
    document.querySelectorAll(tags.join(', ')).forEach(function(el) {
      var targetEls = document.querySelectorAll('.method_details .docstring');
      if (targetEls.length != 0) {
        var finded = false;
        var parentEl = el;
        while (!finded && ((parentEl = parentEl.parentElement) !== null)) {
          for (i = 0; i < targetEls.length; i++) {
            if (parentEl.isEqualNode(targetEls[i])) {
              finded = true;
              break;
            }
          }
        }
        if (finded) return;
      }
      if (el.id == "filecontents") return;
      show = true;
      var thisTag = parseInt(el.tagName[1], 10);
      if (el.id.length === 0) {
        var proposedId = el.getAttribute('toc-id');
        if (typeof(proposedId) != "undefined") el.id = proposedId;
        else {
          var proposedId = el.textContent.replace(/[^a-z0-9-]/ig, '_');
          if (document.querySelectorAll('#' + proposedId).length > 0) { proposedId += counter; counter++; }
          el.id = proposedId;
        }
      }
      if (thisTag > lastTag) {
        for (i = 0; i < thisTag - lastTag; i++) {
          if ( typeof(curli) == "undefined" ) {
            curli = document.createElement('li');
            toc.appendChild(curli);
          }
          toc = document.createElement('ol');
          curli.appendChild(toc);
          curli = undefined;
        }
      }
      if (thisTag < lastTag) {
        for (i = 0; i < lastTag - thisTag; i++) {
          toc = toc.parentNode;
          toc = toc.parentNode;
        }
      }
      var title = el.getAttribute('toc-title');
      if (title === null) title = el.textContent;
      curli = document.createElement('li');
      var curli_a = document.createElement('a');
      curli_a.href = '#' + el.id;
      curli_a.textContent = title;
      curli.appendChild(curli_a);
      toc.appendChild(curli);
      lastTag = thisTag;
    });
    if (!show) return;
    var tocEl = document.createElement('div');
    tocEl.id = 'toc';
    tocEl.innerHTML = '<p class="title hide_toc"><a href="#"><strong>Table of Contents</strong></a></p>';
    var contentEl = document.querySelector('#content');
    contentEl.insertBefore(tocEl, contentEl.firstChild);
    toc = document.querySelector('#toc');
    toc.appendChild(_toc);
    document.querySelector('#toc .hide_toc').addEventListener('click', function() {
      var tocTitleSmallEl = document.querySelector('#toc .title small');
      if (document.querySelector('#toc').classList.contains('hidden')) {
        document.querySelector('#toc .top').style.display = 'block';
        if (tocTitleSmallEl) tocTitleSmallEl.style.display = 'block';
      } else {
        document.querySelector('#toc .top').style.display = 'none';
        if (tocTitleSmallEl) tocTitleSmallEl.style.display = 'none';
      }
      document.querySelector('#toc').classList.toggle('hidden');
    });
  }

  function navResizeFn(e) {
    if (e.which !== 1) {
      navResizeFnStop();
      return;
    }

    sessionStorage.navWidth = e.pageX.toString();
    var el = document.querySelector('.nav_wrap');
    el.style.width = e.pageX + 'px';
    el.style.msFlex = 'inherit';
  }

  function navResizeFnStop() {
    window.removeEventListener('mousemove', navResizeFn);
    window.removeEventListener('message', navMessageFn, false);
  }

  function navMessageFn(e) {
    if (e.data.action === "mousemove") navResizeFn(e.data.event);
    if (e.data.action === "mouseup") navResizeFnStop();
  }

  function navResizer() {
    document.querySelector('#resizer').addEventListener('mousedown', function(e) {
      e.preventDefault();
      window.addEventListener('mousemove', navResizeFn);
      window.addEventListener('message', navMessageFn, false);
    });
    window.addEventListener('mouseup', navResizeFnStop);

    if (sessionStorage.navWidth) {
      navResizeFn({which: 1, pageX: parseInt(sessionStorage.navWidth, 10)});
    }
  }

  function navExpander() {
    if (typeof pathId === "undefined") return;
    var done = false,
      timer = setTimeout(postMessage, 500);
    function postMessage() {
      if (done) return;
      clearTimeout(timer);
      var opts = { action: "expand", path: pathId };
      document.getElementById("nav").contentWindow.postMessage(opts, "*");
      done = true;
    }

    window.addEventListener(
      "message",
      function (event) {
        if (event.data === "navReady") postMessage();
        return false;
      },
      false
    );
  }

  function mainFocus() {
    var hash = window.location.hash;
    if (hash !== '') {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView();
    }

    setTimeout(function() {
      document.querySelector('#main').focus();
    }, 10);
  }

  function navigationChange() {
    // This works around the broken anchor navigation with the YARD template.
    window.onpopstate = function () {
      var hash = window.location.hash;
      if (hash !== '') {
        var el = document.querySelector(hash);
        if (el) el.scrollIntoView();
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function() {
    navResizer();
    navExpander();
    createSourceLinks();
    createDefineLinks();
    createFullTreeLinks();
    searchFrameButtons();
    linkSummaries();
    summaryToggle();
    constantSummaryToggle();
    generateTOC();
    mainFocus();
    navigationChange();
  });
})();
