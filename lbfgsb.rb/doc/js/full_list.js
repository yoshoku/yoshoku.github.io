(function() {

var clicked = null;
var searchTimeout = null;
var searchCache = [];
var caseSensitiveMatch = false;
var ignoreKeyCodeMin = 8;
var ignoreKeyCodeMax = 46;
var commandKey = 91;

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function escapeShortcut() {
  document.addEventListener('keydown', function(e) {
    if (e.which == 27) {
      window.parent.postMessage('navEscape', '*');
    }
  });
}

function navResizer() {
  window.addEventListener('mousemove', function(e) {
    window.parent.postMessage({
      action: 'mousemove', event: { pageX: e.pageX, which: e.which }
    }, '*');
  });
  window.addEventListener('mouseup', function(e) {
    window.parent.postMessage({
      action: 'mouseup'
    }, '*');
  });
  window.parent.postMessage("navReady", "*");
}

function clearSearchTimeout() {
  clearTimeout(searchTimeout);
  searchTimeout = null;
}

function enableLinks() {
  // load the target page in the parent window
  document.querySelectorAll('#full_list li').forEach(function(li) {
    li.addEventListener('click', function(evt) {
      document.querySelectorAll('#full_list li').forEach(function(el) { el.classList.remove('clicked'); });
      clicked = this;
      this.classList.add('clicked');
      evt.stopPropagation();

      if (evt.target.tagName === 'A') return true;

      var el = this.querySelectorAll(':scope > .item .object_link a')[0];
      el.dispatchEvent(new MouseEvent(evt.type, evt));
      evt.preventDefault();
      return false;
    });
  });
}

function enableToggles() {
  // show/hide nested classes on toggle click
  document.querySelectorAll('#full_list a.toggle').forEach(function(el) {
    el.addEventListener('click', function(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      this.parentElement.parentElement.classList.toggle('collapsed');
      var ariaExpanded = this.getAttribute('aria-expanded') == 'true' ? 'false' : 'true';
      this.setAttribute('aria-expanded', ariaExpanded);
      highlight();
    });
  });

  // navigation of nested classes using keyboard
  document.querySelectorAll('#full_list a.toggle').forEach(function(el) {
    el.addEventListener('keypress', function(evt) {
      if (evt.code == 13) {
        evt.stopPropagation();
        evt.preventDefault();
        this.parentElement.parentElement.classList.toggle('collapsed');
        var ariaExpanded = this.getAttribute('aria-expanded') == 'true' ? 'false' : 'true';
        this.setAttribute('aria-expanded', ariaExpanded);
        highlight();
      }
    });
  });
}

function populateSearchCache() {
  document.querySelectorAll('#full_list li .item').forEach(function(node) {
    var link = node.querySelector('.object_link a');
    if (link) {
      searchCache.push({
        node: node,
        link: link,
        name: link.textContent,
        fullName: link.getAttribute('title').split(' ')[0]
      });
    }
  });
}

function enableSearch() {
  document.querySelector('#search input').addEventListener('keyup', function(event) {
    if (ignoredKeyPress(event)) return;
    if (this.value === "") {
      clearSearch();
    } else {
      performSearch(this.value);
    }
  });

  var el = document.getElementById('full_list');
  var divEl = document.createElement('div');
  divEl.id = 'noresults';
  divEl.style.display = 'none';
  el.parentNode.insertBefore(divEl, el.nextSibling);
}

function ignoredKeyPress(event) {
  if (
    (event.keyCode > ignoreKeyCodeMin && event.keyCode < ignoreKeyCodeMax) ||
    (event.keyCode == commandKey)
  ) {
    return true;
  } else {
    return false;
  }
}

function clearSearch() {
  clearSearchTimeout();
  document.querySelectorAll('#full_list .found').forEach(function(el) {
    el.classList.remove('found');
    var link = el.querySelector('.object_link a');
    link.textContent = link.textContent;
  });
  document.querySelectorAll('#full_list, #content').forEach(function(el) {
    el.classList.remove('insearch');
  });
  if (clicked) {
    var parentNode = clicked.parentNode;
    while (parentNode && parentNode.nodeType != 9) {
      if (parentNode.nodeType == 1) {
        if (parentNode.classList.contains('collapsed')) {
          parentNode.classList.remove('collapsed');
        }
      }
      parentNode = parentNode.parentNode;
    }
  }
  highlight();
}

function performSearch(searchString) {
  clearSearchTimeout();
  document.querySelectorAll('#full_list, #content').forEach(function(el) {
    el.classList.add('insearch');
  });
  var el = document.getElementById('noresults');
  el.textContent = '';
  el.style.display = 'none';
  partialSearch(searchString, 0);
}

function partialSearch(searchString, offset) {
  var lastRowClass = '';
  var i = null;
  for (i = offset; i < Math.min(offset + 50, searchCache.length); i++) {
    var item = searchCache[i];
    var searchName = (searchString.indexOf('::') != -1 ? item.fullName : item.name);
    var matchString = buildMatchString(searchString);
    var matchRegexp = new RegExp(matchString, caseSensitiveMatch ? "" : "i");
    if (searchName.match(matchRegexp) == null) {
      item.node.classList.remove('found');
      item.link.textContent = item.link.textContent;
    } else {
      item.node.classList.add('found');
      if (item.node.classList.contains(lastRowClass)) {
        item.node.classList.remove(lastRowClass);
      }
      item.node.classList.add(lastRowClass == 'r1' ? 'r2' : 'r1');
      lastRowClass = item.node.classList.contains('r1') ? 'r1' : 'r2';
      item.link.innerHTML = item.name.replace(matchRegexp, "<strong>$&</strong>");
    }
  }
  if(i == searchCache.length) {
    searchDone();
  } else {
    searchTimeout = setTimeout(function() {
      partialSearch(searchString, i);
    }, 0);
  }
}

function searchDone() {
  searchTimeout = null;
  highlight();
  var found = 0;
  document.querySelectorAll('#full_list li').forEach(function(el) {
    if (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) {
      found += 1;
    }
  });
  if (found === 0) {
    document.getElementById('noresults').textContent = 'No results were found.';
  } else {
    // This is read out to screen readers
    document.getElementById('noresults').textContent = 'There are ' + found + ' results.';
  }
  document.getElementById('noresults').style.display = 'block';
  document.getElementById('content').classList.remove('insearch');
}

function buildMatchString(searchString, event) {
  caseSensitiveMatch = searchString.match(/[A-Z]/) != null;
  var regexSearchString = RegExp.escape(searchString);
  if (caseSensitiveMatch) {
    regexSearchString += "|" +
      searchString.split('').map(function(e) { return RegExp.escape(e); }).
      join('.+?');
  }
  return regexSearchString;
}

function highlight() {
  document.querySelectorAll('#full_list li').forEach(function(el, n) {
    if (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) {
      if (el.classList.contains('even')) {
        el.classList.remove('even');
      }
      if (el.classList.contains('odd')) {
        el.classList.remove('odd');
      }
      el.classList.add(n % 2 == 0 ? 'odd' : 'even');
    }
  });
}

/**
 * Expands the tree to the target element and its immediate
 * children.
 */
function expandTo(path) {
  var target = document.getElementById('object_' + path);
  if (target) {
    target.classList.add('clicked');
    if (target.classList.contains('collapsed')) {
      target.classList.remove('collapsed');
    }
    var parentNode = target.parentNode;
    while (parentNode && parentNode.nodeType != 9) {
      if (parentNode.nodeType == 1) {
        if (parentNode.id == 'full_list') break;
        if (parentNode.tagName == 'LI') {
          if (parentNode.classList.contains('collapsed')) {
            parentNode.classList.remove('collapsed');
          }
        }
      }
      parentNode = parentNode.parentNode;
    }

    var toggle = target.querySelector('a.toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
    }
    parentNode = target.parentNode;
    while (parentNode && parentNode.nodeType != 9) {
      if (parentNode.nodeType == 1) {
        if (parentNode.id == 'full_list') break;
        if (parentNode.tagName == 'LI') {
          toggle = parentNode.querySelector('a.toggle')
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
          }
        }
      }
      parentNode = parentNode.parentNode;
    }

    window.scrollTo(window.scrollX, target.offsetTop - 250);
    highlight();
  }
}

function windowEvents(event) {
  var msg = event.data;
  if (msg.action === "expand") {
    expandTo(msg.path);
  }
  return false;
}

window.addEventListener("message", windowEvents, false);

document.addEventListener('DOMContentLoaded', function() {
  escapeShortcut();
  navResizer();
  enableLinks();
  enableToggles();
  populateSearchCache();
  enableSearch();
});

})();
