/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function (exports, undefined) {
  "use strict";

  var modules = {};

  function require(ids, callback) {
    var module, defs = [];

    for (var i = 0; i < ids.length; ++i) {
      module = modules[ids[i]] || resolve(ids[i]);
      if (!module) {
        throw 'module definition dependecy not found: ' + ids[i];
      }

      defs.push(module);
    }

    callback.apply(null, defs);
  }

  function define(id, dependencies, definition) {
    if (typeof id !== 'string') {
      throw 'invalid module definition, module id must be defined and be a string';
    }

    if (dependencies === undefined) {
      throw 'invalid module definition, dependencies must be specified';
    }

    if (definition === undefined) {
      throw 'invalid module definition, definition function must be specified';
    }

    require(dependencies, function () {
      modules[id] = definition.apply(null, arguments);
    });
  }

  function defined(id) {
    return !!modules[id];
  }

  function resolve(id) {
    var target = exports;
    var fragments = id.split(/[.\/]/);

    for (var fi = 0; fi < fragments.length; ++fi) {
      if (!target[fragments[fi]]) {
        return;
      }

      target = target[fragments[fi]];
    }

    return target;
  }

  function expose(ids) {
    for (var i = 0; i < ids.length; i++) {
      var target = exports;
      var id = ids[i];
      var fragments = id.split(/[.\/]/);

      for (var fi = 0; fi < fragments.length - 1; ++fi) {
        if (target[fragments[fi]] === undefined) {
          target[fragments[fi]] = {};
        }

        target = target[fragments[fi]];
      }

      target[fragments[fragments.length - 1]] = modules[id];
    }
  }

  // Included from: js/tinymce/plugins/spellchecker/classes/DomTextMatcher.js

  /**
   * DomTextMatcher.js
   *
   * Copyright, Moxiecode Systems AB
   * Released under LGPL License.
   *
   * License: http://www.tinymce.com/license
   * Contributing: http://www.tinymce.com/contributing
   */

  /*eslint no-labels:0, no-constant-condition: 0 */

  /**
   * This class logic for filtering text and matching words.
   *
   * @class tinymce.spellcheckerplugin.TextFilter
   * @private
   */
  define("tinymce/spellcheckerplugin/DomTextMatcher", [], function () {
    // Based on work developed by: James Padolsey http://james.padolsey.com
    // released under UNLICENSE that is compatible with LGPL
    // TODO: Handle contentEditable edgecase:
    // <p>text<span contentEditable="false">text<span contentEditable="true">text</span>text</span>text</p>
    return function (node, editor) {
      var m, matches = [],
        text, dom = editor.dom;
      var blockElementsMap, hiddenTextElementsMap, shortEndedElementsMap;

      blockElementsMap = editor.schema.getBlockElements(); // H1-H6, P, TD etc
      hiddenTextElementsMap = editor.schema.getWhiteSpaceElements(); // TEXTAREA, PRE, STYLE, SCRIPT
      shortEndedElementsMap = editor.schema.getShortEndedElements(); // BR, IMG, INPUT

      function createMatch(m, data) {
        if (!m[0]) {
          throw 'findAndReplaceDOMText cannot handle zero-length matches';
        }

        return {
          start: m.index,
          end: m.index + m[0].length,
          text: m[0],
          data: data
        };
      }

      function getText(node) {
        var txt;

        if (node.nodeType === 3) {
          return node.data;
        }

        if (hiddenTextElementsMap[node.nodeName] && !blockElementsMap[node.nodeName]) {
          return '';
        }

        txt = '';

        if (blockElementsMap[node.nodeName] || shortEndedElementsMap[node.nodeName]) {
          txt += '\n';
        }

        if ((node = node.firstChild)) {
          do {
            txt += getText(node);
          } while ((node = node.nextSibling));
        }

        return txt;
      }

      function stepThroughMatches(node, matches, replaceFn) {
        var startNode, endNode, startNodeIndex,
          endNodeIndex, innerNodes = [],
          atIndex = 0,
          curNode = node,
          matchLocation, matchIndex = 0;

        matches = matches.slice(0);
        matches.sort(function (a, b) {
          return a.start - b.start;
        });

        matchLocation = matches.shift();

        out: while (true) {
          if (blockElementsMap[curNode.nodeName] || shortEndedElementsMap[curNode.nodeName]) {
            atIndex++;
          }

          if (curNode.nodeType === 3) {
            if (!endNode && curNode.length + atIndex >= matchLocation.end) {
              // We've found the ending
              endNode = curNode;
              endNodeIndex = matchLocation.end - atIndex;
            } else if (startNode) {
              // Intersecting node
              innerNodes.push(curNode);
            }

            if (!startNode && curNode.length + atIndex > matchLocation.start) {
              // We've found the match start
              startNode = curNode;
              startNodeIndex = matchLocation.start - atIndex;
            }

            atIndex += curNode.length;
          }

          if (startNode && endNode) {
            curNode = replaceFn({
              startNode: startNode,
              startNodeIndex: startNodeIndex,
              endNode: endNode,
              endNodeIndex: endNodeIndex,
              innerNodes: innerNodes,
              match: matchLocation.text,
              matchIndex: matchIndex
            });

            // replaceFn has to return the node that replaced the endNode
            // and then we step back so we can continue from the end of the
            // match:
            atIndex -= (endNode.length - endNodeIndex);
            startNode = null;
            endNode = null;
            innerNodes = [];
            matchLocation = matches.shift();
            matchIndex++;

            if (!matchLocation) {
              break; // no more matches
            }
          } else if ((!hiddenTextElementsMap[curNode.nodeName] || blockElementsMap[curNode.nodeName]) && curNode.firstChild) {
            // Move down
            curNode = curNode.firstChild;
            continue;
          } else if (curNode.nextSibling) {
            // Move forward:
            curNode = curNode.nextSibling;
            continue;
          }

          // Move forward or up:
          while (true) {
            if (curNode.nextSibling) {
              curNode = curNode.nextSibling;
              break;
            } else if (curNode.parentNode !== node) {
              curNode = curNode.parentNode;
            } else {
              break out;
            }
          }
        }
      }

      /**
       * Generates the actual replaceFn which splits up text nodes
       * and inserts the replacement element.
       */
      function genReplacer(callback) {
        function makeReplacementNode(fill, matchIndex) {
          var match = matches[matchIndex];

          if (!match.stencil) {
            match.stencil = callback(match);
          }

          var clone = match.stencil.cloneNode(false);
          clone.setAttribute('data-mce-index', matchIndex);

          if (fill) {
            clone.appendChild(dom.doc.createTextNode(fill));
          }

          return clone;
        }

        return function (range) {
          var before, after, parentNode, startNode = range.startNode,
            endNode = range.endNode,
            matchIndex = range.matchIndex,
            doc = dom.doc;

          if (startNode === endNode) {
            var node = startNode;

            parentNode = node.parentNode;
            if (range.startNodeIndex > 0) {
              // Add "before" text node (before the match)
              before = doc.createTextNode(node.data.substring(0, range.startNodeIndex));
              parentNode.insertBefore(before, node);
            }

            // Create the replacement node:
            var el = makeReplacementNode(range.match, matchIndex);
            parentNode.insertBefore(el, node);
            if (range.endNodeIndex < node.length) {
              // Add "after" text node (after the match)
              after = doc.createTextNode(node.data.substring(range.endNodeIndex));
              parentNode.insertBefore(after, node);
            }

            node.parentNode.removeChild(node);

            return el;
          } else {
            // Replace startNode -> [innerNodes...] -> endNode (in that order)
            before = doc.createTextNode(startNode.data.substring(0, range.startNodeIndex));
            after = doc.createTextNode(endNode.data.substring(range.endNodeIndex));
            var elA = makeReplacementNode(startNode.data.substring(range.startNodeIndex), matchIndex);
            var innerEls = [];

            for (var i = 0, l = range.innerNodes.length; i < l; ++i) {
              var innerNode = range.innerNodes[i];
              var innerEl = makeReplacementNode(innerNode.data, matchIndex);
              innerNode.parentNode.replaceChild(innerEl, innerNode);
              innerEls.push(innerEl);
            }

            var elB = makeReplacementNode(endNode.data.substring(0, range.endNodeIndex), matchIndex);

            parentNode = startNode.parentNode;
            parentNode.insertBefore(before, startNode);
            parentNode.insertBefore(elA, startNode);
            parentNode.removeChild(startNode);

            parentNode = endNode.parentNode;
            parentNode.insertBefore(elB, endNode);
            parentNode.insertBefore(after, endNode);
            parentNode.removeChild(endNode);

            return elB;
          }
        };
      }

      function unwrapElement(element) {
        var parentNode = element.parentNode;
        parentNode.insertBefore(element.firstChild, element);
        element.parentNode.removeChild(element);
      }

      function getWrappersByIndex(index) {
        var elements = node.getElementsByTagName('*'),
          wrappers = [];

        index = typeof (index) == "number" ? "" + index : null;

        for (var i = 0; i < elements.length; i++) {
          var element = elements[i],
            dataIndex = element.getAttribute('data-mce-index');

          if (dataIndex !== null && dataIndex.length) {
            if (dataIndex === index || index === null) {
              wrappers.push(element);
            }
          }
        }

        return wrappers;
      }

      /**
       * Returns the index of a specific match object or -1 if it isn't found.
       *
       * @param  {Match} match Text match object.
       * @return {Number} Index of match or -1 if it isn't found.
       */
      function indexOf(match) {
        var i = matches.length;
        while (i--) {
          if (matches[i] === match) {
            return i;
          }
        }

        return -1;
      }

      /**
       * Filters the matches. If the callback returns true it stays if not it gets removed.
       *
       * @param {Function} callback Callback to execute for each match.
       * @return {DomTextMatcher} Current DomTextMatcher instance.
       */
      function filter(callback) {
        var filteredMatches = [];

        each(function (match, i) {
          if (callback(match, i)) {
            filteredMatches.push(match);
          }
        });

        matches = filteredMatches;

        /*jshint validthis:true*/
        return this;
      }

      /**
       * Executes the specified callback for each match.
       *
       * @param {Function} callback  Callback to execute for each match.
       * @return {DomTextMatcher} Current DomTextMatcher instance.
       */
      function each(callback) {
        for (var i = 0, l = matches.length; i < l; i++) {
          if (callback(matches[i], i) === false) {
            break;
          }
        }

        /*jshint validthis:true*/
        return this;
      }

      /**
       * Wraps the current matches with nodes created by the specified callback.
       * Multiple clones of these matches might occur on matches that are on multiple nodex.
       *
       * @param {Function} callback Callback to execute in order to create elements for matches.
       * @return {DomTextMatcher} Current DomTextMatcher instance.
       */
      function wrap(callback) {
        if (matches.length) {
          stepThroughMatches(node, matches, genReplacer(callback));
        }

        /*jshint validthis:true*/
        return this;
      }

      /**
       * Finds the specified regexp and adds them to the matches collection.
       *
       * @param {RegExp} regex Global regexp to search the current node by.
       * @param {Object} [data] Optional custom data element for the match.
       * @return {DomTextMatcher} Current DomTextMatcher instance.
       */
      function find(regex, data) {
        if (text && regex.global) {
          while ((m = regex.exec(text))) {
            matches.push(createMatch(m, data));
          }
        }

        return this;
      }

      /**
       * Unwraps the specified match object or all matches if unspecified.
       *
       * @param {Object} [match] Optional match object.
       * @return {DomTextMatcher} Current DomTextMatcher instance.
       */
      function unwrap(match) {
        var i, elements = getWrappersByIndex(match ? indexOf(match) : null);

        i = elements.length;
        while (i--) {
          unwrapElement(elements[i]);
        }

        return this;
      }

      /**
       * Returns a match object by the specified DOM element.
       *
       * @param {DOMElement} element Element to return match object for.
       * @return {Object} Match object for the specified element.
       */
      function matchFromElement(element) {
        return matches[element.getAttribute('data-mce-index')];
      }

      /**
       * Returns a DOM element from the specified match element. This will be the first element if it's split
       * on multiple nodes.
       *
       * @param {Object} match Match element to get first element of.
       * @return {DOMElement} DOM element for the specified match object.
       */
      function elementFromMatch(match) {
        return getWrappersByIndex(indexOf(match))[0];
      }

      /**
       * Adds match the specified range for example a grammar line.
       *
       * @param {Number} start Start offset.
       * @param {Number} length Length of the text.
       * @param {Object} data Custom data object for match.
       * @return {DomTextMatcher} Current DomTextMatcher instance.
       */
      function add(start, length, data) {
        matches.push({
          start: start,
          end: start + length,
          text: text.substr(start, length),
          data: data
        });

        return this;
      }

      /**
       * Returns a DOM range for the specified match.
       *
       * @param  {Object} match Match object to get range for.
       * @return {DOMRange} DOM Range for the specified match.
       */
      function rangeFromMatch(match) {
        var wrappers = getWrappersByIndex(indexOf(match));

        var rng = editor.dom.createRng();
        rng.setStartBefore(wrappers[0]);
        rng.setEndAfter(wrappers[wrappers.length - 1]);

        return rng;
      }

      /**
       * Replaces the specified match with the specified text.
       *
       * @param {Object} match Match object to replace.
       * @param {String} text Text to replace the match with.
       * @return {DOMRange} DOM range produced after the replace.
       */
      function replace(match, text) {
        var rng = rangeFromMatch(match);

        rng.deleteContents();

        if (text.length > 0) {
          rng.insertNode(editor.dom.doc.createTextNode(text));
        }

        return rng;
      }

      /**
       * Resets the DomTextMatcher instance. This will remove any wrapped nodes and remove any matches.
       *
       * @return {[type]} [description]
       */
      function reset() {
        matches.splice(0, matches.length);
        unwrap();

        return this;
      }

      text = getText(node);

      return {
        text: text,
        matches: matches,
        each: each,
        filter: filter,
        reset: reset,
        matchFromElement: matchFromElement,
        elementFromMatch: elementFromMatch,
        find: find,
        add: add,
        wrap: wrap,
        unwrap: unwrap,
        replace: replace,
        rangeFromMatch: rangeFromMatch,
        indexOf: indexOf
      };
    };
  });

  // Included from: js/tinymce/plugins/spellchecker/classes/Plugin.js

  /**
   * Plugin.js
   *
   * Copyright, Moxiecode Systems AB
   * Released under LGPL License.
   *
   * License: http://www.tinymce.com/license
   * Contributing: http://www.tinymce.com/contributing
   */

  /*jshint camelcase:false */

  /**
   * This class contains all core logic for the spellchecker plugin.
   *
   * @class tinymce.spellcheckerplugin.Plugin
   * @private
   */
  define("tinymce/spellcheckerplugin/Plugin", [
    "tinymce/spellcheckerplugin/DomTextMatcher",
    "tinymce/PluginManager",
    "tinymce/util/Tools",
    "tinymce/ui/Menu",
    "tinymce/dom/DOMUtils",
    "tinymce/util/XHR",
    "tinymce/util/URI",
    "tinymce/util/JSON"
  ], function (DomTextMatcher, PluginManager, Tools, Menu, DOMUtils, XHR, URI, JSON) {
    PluginManager.add('spellchecker', function (editor, url) {
      var languageMenuItems, self = this,
        lastSuggestions, started, suggestionsMenu, settings = editor.settings;
      var hasDictionarySupport;

      function getTextMatcher() {
        if (!self.textMatcher) {
          self.textMatcher = new DomTextMatcher(editor.getBody(), editor);
        }

        return self.textMatcher;
      }

      function buildMenuItems(listName, languageValues) {
        var items = [];

        Tools.each(languageValues, function (languageValue) {
          items.push({
            selectable: true,
            text: languageValue.name,
            data: languageValue.value
          });
        });

        return items;
      }

      // var languagesString = settings.spellchecker_languages ||
      //   'English=en,Danish=da,Dutch=nl,Finnish=fi,French=fr_FR,' +
      //   'German=de,Italian=it,Polish=pl,Portuguese=pt_BR,' +
      //   'Spanish=es,Swedish=sv';
      var languagesString = settings.spellchecker_languages || "Mongolian=mn";

      languageMenuItems = buildMenuItems('Language',
        Tools.map(languagesString.split(','), function (langPair) {
          langPair = langPair.split('=');

          return {
            name: langPair[0],
            value: langPair[1]
          };
        })
      );

      function isEmpty(obj) {
        /*jshint unused:false*/
        /*eslint no-unused-vars:0 */
        for (var name in obj) {
          return false;
        }

        return true;
      }

      function showSuggestions(word, spans) {
        var items = [],
          suggestions = lastSuggestions[word];

        Tools.each(suggestions, function (suggestion) {
          items.push({
            text: suggestion,
            onclick: function () {
              editor.insertContent(editor.dom.encode(L2Unicodetext(suggestion)));
              editor.dom.remove(spans);
              checkIfFinished();
            },
            class: "orhonspellitem"
          });
        });

        items.push({
          text: '-'
        });

        if (hasDictionarySupport) {
          items.push({
            text: 'Add to Dictionary',
            onclick: function () {
              addToDictionary(word, spans);
            }
          });
        }

        items.push.apply(items, [{
            text: 'Ignore',
            onclick: function () {
              ignoreWord(word, spans);
            }
          },

          {
            text: 'Ignore all',
            onclick: function () {
              ignoreWord(word, spans, true);
            }
          }
        ]);

        // Render menu
        suggestionsMenu = new Menu({
          items: items,
          context: 'contextmenu',
          onautohide: function (e) {
            if (e.target.className.indexOf('spellchecker') != -1) {
              e.preventDefault();
            }
          },
          onhide: function () {
            suggestionsMenu.remove();
            suggestionsMenu = null;
          }
        });

        suggestionsMenu.renderTo(document.body);

        // Position menu
        var pos = DOMUtils.DOM.getPos(editor.getContentAreaContainer());
        var targetPos = editor.dom.getPos(spans[0]);
        var root = editor.dom.getRoot();

        // Adjust targetPos for scrolling in the editor
        if (root.nodeName == 'BODY') {
          targetPos.x -= root.ownerDocument.documentElement.scrollLeft || root.scrollLeft;
          targetPos.y -= root.ownerDocument.documentElement.scrollTop || root.scrollTop;
        } else {
          targetPos.x -= root.scrollLeft;
          targetPos.y -= root.scrollTop;
        }

        pos.x += targetPos.x; // 竖版布局的时候启用这个
        pos.y += targetPos.y;
        // pos.y += targetPos.x; //镜像旋转的时候启用这个
        // pos.x += targetPos.y;

        suggestionsMenu.moveTo(pos.x, pos.y + spans[0].offsetHeight);
      }

      function getWordCharPattern() {
        // Regexp for finding word specific characters this will split words by
        // spaces, quotes, copy right characters etc. It's escaped with unicode characters
        // to make it easier to output scripts on servers using different encodings
        // so if you add any characters outside the 128 byte range make sure to escape it
        // return editor.getParam('spellchecker_wordchar_pattern') || new RegExp("[^" +
        // 				"\\s!\"#$%&()*+,-./:;<=>?@[\\]^_{|}`" +
        // 				"\u00a7\u00a9\u00ab\u00ae\u00b1\u00b6\u00b7\u00b8\u00bb" +
        // 				"\u00bc\u00bd\u00be\u00bf\u00d7\u00f7\u00a4\u201d\u201c\u201e\u00a0\u2002\u2003\u2009" +
        // 			"]+", "g");
        return editor.getParam('spellchecker_wordchar_pattern') || new RegExp("[^" + "\\n\\r\\t" + "\u0020" +
          "!\"#$%&()*+,-./:;<=>?@[\\]^_{|}`" +
          "\u00a7\u00a9\u00ab\u00ae\u00b1\u00b6\u00b7\u00b8\u00bb" +
          "\u00bc\u00bd\u00be\u00bf\u00d7\u00f7\u00a4\u201d\u201c\u201e\u00a0\u2002\u2003\u2009" +
          "]+", "g");
      }

      var ulKeyMap = {
        '\u1820': 'a',
        '\u1821': 'e',
        '\u1822': 'i',
        '\u1823': 'o',
        '\u1824': 'u',
        '\u1825': 'ö',
        '\u1826': 'ü',
        '\u1827': 'v',
        '\u1828': 'n',
        '\u1829': 'ń',
        '\u182A': 'b',
        '\u182B': 'p',
        '\u182C': 'h',
        '\u182D': 'g',
        '\u182E': 'm',
        '\u182F': 'l',
        '\u1830': 's',
        '\u1831': 'ş',
        '\u1832': 't',
        '\u1833': 'd',
        '\u1834': 'c',
        '\u1835': 'j',
        '\u1836': 'y',
        '\u1837': 'r',
        '\u1838': 'w',
        '\u1839': 'f',
        '\u183A': 'k',
        '\u183C': 'ç',
        '\u183D': 'z',
        '\u183E': 'x',
        '\u183F': 'ŕ',
        '\u1840': 'ĺ',
        '\u1841': 'ź',
        '\u1842': 'q',
        '\u180B': '\'',
        '\u180E': '_',
        '\u202F': '-',
        '\u200C': '^',
        '\u180C': '"',
        '\u180D': '`',
        '\u200D': '*',
        '\uFF01': '!'
      }
      var luKeyMap = {
        'a': '\u1820',
        'e': '\u1821',
        'i': '\u1822',
        'o': '\u1823',
        'u': '\u1824',
        'ö': '\u1825',
        'ü': '\u1826',
        'v': '\u1827',
        'n': '\u1828',
        'ń': '\u1829',
        'b': '\u182A',
        'p': '\u182B',
        'h': '\u182C',
        'g': '\u182D',
        'm': '\u182E',
        'l': '\u182F',
        's': '\u1830',
        'ş': '\u1831',
        't': '\u1832',
        'd': '\u1833',
        'c': '\u1834',
        'j': '\u1835',
        'y': '\u1836',
        'r': '\u1837',
        'w': '\u1838',
        'f': '\u1839',
        'k': '\u183A',
        'ç': '\u183C',
        'z': '\u183D',
        'x': '\u183E',
        'ŕ': '\u183F',
        'ĺ': '\u1840',
        'ź': '\u1841',
        'q': '\u1842',
        '\'': '\u180B',
        '_': '\u180E',
        '-': '\u202F',
        '^': '\u200C',
        '"': '\u180C',
        '`': '\u180D',
        '*': '\u200D',
        '!': '\uFF01'
      }
      /*var unicodePunctList = {
          '|':'\u1801',',':'\u1802','.':'\u1803',':':'\u1804','(':'\u0028',')':'\u0029',
          '~':'\u007E','`':'\u00B7','⁈':'\u2048','⁉':'\u2049','<':'\uFE3D','>':'\uFE3E',
          '{':'\uFE3F','}':'\uFE40','“':'\uFF0C',';':'\uFF1B','?':'\uFF1F','!':'\uFF01',
          '-':'\uFF5C'
      }*/

      function Unicode2L(text) {
        var u = text.split('');
        Tools.each(u, function (val, k) {
          Tools.each(ulKeyMap, function (value, key) {
            if (val == key) {
              u[k] = value;
              return false;
            }
          });
        });
        // alert(Unicode2M('ᠦᠰᠬᠦ ᠡᠴᠡ ᠰᠤᠷᠤᠭᠰᠠᠨ ᠦᠨᠳᠦᠰᠦᠨ ᠬᠡᠯᠡ  ᠮᠠᠷᠲᠠᠵᠣ ᠪᠣᠯᠣᠰᠢ ᠦᠭᠡᠢ ᠰᠣᠶᠯ  ᠦᠬᠦᠲᠡᠯ᠎ᠡ ᠣᠷᠤᠰᠢᠬᠤ ᠲᠦᠷᠦᠯᠬᠢ ᠨᠤᠲᠭ  ᠰᠠᠯᠵᠤ ᠪᠣᠯᠤᠰᠢ ᠦᠭᠡᠢ ᠣᠷᠤᠨ ！'));
        return u.join('');
      };

      function L2Unicode(text) {
        var t = new Array();

        Tools.each(text, function (va, k) {
          var arr = new Array();
          if (typeof (k) == 'string') {
            for (var i = 0; i < k.length; i++) {
              // document.write (str.charAt(i));
              Tools.each(luKeyMap, function (value, key) {
                if (k.charAt(i) == key) {
                  arr.push(value);
                  return false;
                }
              });
            }

          } else {
            Tools.each(k, function (val, ke) {
              Tools.each(luKeyMap, function (value, key) {
                if (val == key) {
                  arr.push(value);
                  return false;
                }
              });
            });
          }
          // alert(arr);
          t[Unicode2M(arr.join(''))] = va;
          t[arr.join('')] = va;
          arr = '';
        });
        return t;
      };

      function Unicode2Ltext(text) {
        var arr = new Array();
        Tools.each(text, function (val, k) {
          Tools.each(ulKeyMap, function (value, key) {
            if (val == value) {
              arr.push(key);
              return false;
            }
          });
        });
        return arr.join('');
      };

      function L2Unicodetext(text) {
        var arr = new Array();
        if (typeof (text) == 'string') {
          for (var i = 0; i < text.length; i++) {
            Tools.each(luKeyMap, function (value, key) {
              if (text.charAt(i) == key) {
                arr.push(value);
                return false;
              }
            });
          }

        } else {
          Tools.each(text, function (val, k) {
            Tools.each(luKeyMap, function (value, key) {
              if (val == key) {
                arr.push(value);
                return false;
              }
            });
          });
        }

        return arr.join('');
      };

      function defaultSpellcheckCallback(method, text, doneCallback, errorCallback) {
        var data = {
            method: method
          },
          postData = '';

        if (method == "spellcheck") {
          data.words = Unicode2L(M2Unicode(text));
          if (settings.spellchecker_language) {
            data.language = settings.spellchecker_language;
          } else {
            data.language = "mn";
          }
        }

        if (method == "addToDictionary") {
          data.words = Unicode2L(M2Unicode(text));
        }

        Tools.each(data, function (value, key) {
          if (postData) {
            postData += '&';
          }
          postData += key + '=' + encodeURIComponent(value);
        });
        // postData = {
        //   'method': 'spellcheck',
        //   'words': data.words ? data.words : '',
        //   'language':data.language
        // }
        var spellchecker_rpc_url = settings.spellchecker_rpc_url != undefined ? new URI(url).toAbsolute(settings.spellchecker_rpc_url) : "http://api.orhontech.com/api/sco/v1/spellchecker"
        XHR.send({
          url: spellchecker_rpc_url,
          type: "POST",
          content_type: 'application/x-www-form-urlencoded',
          data: postData,
          success: function (result) {
            result = JSON.parse(result);

            if (!result) {
              errorCallback("Sever response wasn't proper JSON.");
            } else if (result.error) {
              errorCallback(result.error);
            } else {
              doneCallback(result);
            }
          },
          error: function (type, xhr) {
            errorCallback("Spellchecker request error: " + xhr.status);
          }
        });
      }

      function sendRpcCall(name, data, successCallback, errorCallback) {
        var spellCheckCallback = settings.spellchecker_callback || defaultSpellcheckCallback;
        spellCheckCallback.call(self, name, data, successCallback, errorCallback);
      }

      function spellcheck() {
        if (started) {
          finish();
          return;
        } else {
          finish();
        }

        function errorCallback(message) {
          editor.windowManager.alert(message);
          editor.setProgressState(false);
          finish();
        }

        editor.setProgressState(true);
        sendRpcCall("spellcheck", getTextMatcher().text, markErrors, errorCallback);
        editor.focus();
      }

      function checkIfFinished() {
        if (!editor.dom.select('span.mce-spellchecker-word').length) {
          finish();
        }
      }

      function addToDictionary(word, spans) {
        editor.setProgressState(true);

        sendRpcCall("addToDictionary", word, function () {
          editor.setProgressState(false);
          editor.dom.remove(spans, true);
          checkIfFinished();
        }, function (message) {
          editor.windowManager.alert(message);
          editor.setProgressState(false);
        });
      }

      function ignoreWord(word, spans, all) {
        editor.selection.collapse();

        if (all) {
          Tools.each(editor.dom.select('span.mce-spellchecker-word'), function (span) {
            if (span.getAttribute('data-mce-word') == word) {
              editor.dom.remove(span, true);
            }
          });
        } else {
          editor.dom.remove(spans, true);
        }

        checkIfFinished();
      }

      function finish() {
        getTextMatcher().reset();
        self.textMatcher = null;

        if (started) {
          started = false;
          editor.fire('SpellcheckEnd');
        }
      }

      function getElmIndex(elm) {
        var value = elm.getAttribute('data-mce-index');

        if (typeof (value) == "number") {
          return "" + value;
        }

        return value;
      }

      function findSpansByIndex(index) {
        var nodes, spans = [];

        nodes = Tools.toArray(editor.getBody().getElementsByTagName('span'));
        if (nodes.length) {
          for (var i = 0; i < nodes.length; i++) {
            var nodeIndex = getElmIndex(nodes[i]);

            if (nodeIndex === null || !nodeIndex.length) {
              continue;
            }

            if (nodeIndex === index.toString()) {
              spans.push(nodes[i]);
            }
          }
        }

        return spans;
      }

      editor.on('click', function (e) {
        var target = e.target;

        if (target.className == "mce-spellchecker-word") {
          e.preventDefault();

          var spans = findSpansByIndex(getElmIndex(target));

          if (spans.length > 0) {
            var rng = editor.dom.createRng();
            rng.setStartBefore(spans[0]);
            rng.setEndAfter(spans[spans.length - 1]);
            editor.selection.setRng(rng);
            showSuggestions(target.getAttribute('data-mce-word'), spans);
          }
        }
      });

      editor.addMenuItem('spellchecker', {
        text: 'Spellcheck',
        context: 'tools',
        onclick: spellcheck,
        selectable: true,
        onPostRender: function () {
          var self = this;

          self.active(started);

          editor.on('SpellcheckStart SpellcheckEnd', function () {
            self.active(started);
          });
        }
      });

      function updateSelection(e) {
        var selectedLanguage = settings.spellchecker_language;

        e.control.items().each(function (ctrl) {
          ctrl.active(ctrl.settings.data === selectedLanguage);
        });
      }

      /**
       * Find the specified words and marks them. It will also show suggestions for those words.
       *
       * @example
       * editor.plugins.spellchecker.markErrors({
       *     dictionary: true,
       *     words: {
       *         "word1": ["suggestion 1", "Suggestion 2"]
       *     }
       * });
       * @param {Object} data Data object containing the words with suggestions.
       */
      function markErrors(data) {
        var suggestions;

        if (data.words) {
          hasDictionarySupport = !!data.dictionary;
          //suggestions = data.words;
          // L2Unicode(data.words);
          suggestions = L2Unicode(data.words);
        } else {
          // Fallback to old format
          suggestions = L2Unicode(data.words);
        }

        editor.setProgressState(false);

        if (isEmpty(suggestions)) {
          editor.windowManager.alert('    ');
          started = false;
          return;
        }

        lastSuggestions = suggestions;

        getTextMatcher().find(getWordCharPattern()).filter(function (match) {
          return !!suggestions[match.text];
        }).wrap(function (match) {
          return editor.dom.create('span', {
            "class": 'mce-spellchecker-word',
            "data-mce-bogus": 1,
            "data-mce-word": match.text
          });
        });

        started = true;
        editor.fire('SpellcheckStart');
      }

      var buttonArgs = {
        tooltip: 'Spellcheck',
        onclick: spellcheck,
        onPostRender: function () {
          var self = this;

          editor.on('SpellcheckStart SpellcheckEnd', function () {
            self.active(started);
          });
        }
      };

      if (languageMenuItems.length > 1) {
        buttonArgs.type = 'splitbutton';
        buttonArgs.menu = languageMenuItems;
        buttonArgs.onshow = updateSelection;
        buttonArgs.onselect = function (e) {
          settings.spellchecker_language = e.control.settings.data;
        };
      }

      editor.addButton('spellchecker', buttonArgs);
      editor.addCommand('mceSpellCheck', spellcheck);

      editor.on('remove', function () {
        if (suggestionsMenu) {
          suggestionsMenu.remove();
          suggestionsMenu = null;
        }
      });

      editor.on('change', checkIfFinished);

      this.getTextMatcher = getTextMatcher;
      this.getWordCharPattern = getWordCharPattern;
      this.markErrors = markErrors;
      this.getLanguage = function () {
        return settings.spellchecker_language;
      };

      // Set default spellchecker language if it's not specified
      settings.spellchecker_language = settings.spellchecker_language || settings.language || 'en';
    });
  });

  expose(["tinymce/spellcheckerplugin/DomTextMatcher"]);
})(this);
