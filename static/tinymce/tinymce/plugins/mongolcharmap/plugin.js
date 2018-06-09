(function () {
  var charmap = (function () {
    'use strict';

    var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var fireInsertCustomChar = function (editor, chr) {
      return editor.fire('insertCustomChar', { chr: chr });
    };
    var $_5vsf728yje5o2t50 = { fireInsertCustomChar: fireInsertCustomChar };

    var insertChar = function (editor, chr) {
      var evtChr = $_5vsf728yje5o2t50.fireInsertCustomChar(editor, chr).chr;
      editor.execCommand('mceInsertContent', false, evtChr);
    };
    var $_1daq4j8xje5o2t4z = { insertChar: insertChar };

    var Tools = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var getCharMap = function (editor) {
      return editor.settings.charmap;
    };
    var getCharMapAppend = function (editor) {
      return editor.settings.charmap_append;
    };
    var $_gmizv91je5o2t57 = {
      getCharMap: getCharMap,
      getCharMapAppend: getCharMapAppend
    };

    var isArray = Tools.isArray;
    var getDefaultCharMap = function () {
      return [
        [
          '6176',
          'ᠠ',
          'mn'
        ],
        [
          '6177',
          'ᠡ',
          'mn'
        ],
        [
          '6178',
          'ᠢ',
          'mn'
        ],
        [
          '6179',
          'ᠣ',
          'mn'
        ],
        [
          '6180',
          'ᠤ',
          'mn'
        ],
        [
          '6181',
          'ᠥ',
          'mn'
        ],
        [
          '6182',
          'ᠦ',
          'mn'
        ],
        [
          '1040',
          'А',
          'cm'
        ],
        [
          '1041',
          'Б',
          'cm'
        ],
        [
          '1042',
          'В',
          'cm'
        ],
        [
          '1043',
          'Г',
          'cm'
        ],
        [
          '1044',
          'Д',
          'cm'
        ],
        [
          '1045',
          'Е',
          'cm'
        ],
        [
          '1025',
          'Ё',
          'cm'
        ],
        [
          '1046',
          'Ж',
          'cm'
        ],
        [
          '1047',
          'З',
          'cm'
        ],
        [
          '1048',
          'И',
          'cm'
        ],
        [
          '1049',
          'Й',
          'cm'
        ],
        [
          '1050',
          'К',
          'cm'
        ],
        [
          '1051',
          'Л',
          'cm'
        ],
        [
          '1052',
          'М',
          'cm'
        ],
        [
          '1053',
          'Н',
          'cm'
        ],
        [
          '1054',
          'О',
          'cm'
        ],
        [
          '1256',
          'Ө',
          'cm'
        ],
        [
          '1055',
          'П',
          'cm'
        ],
        [
          '1056',
          'Р',
          'cm'
        ],
        [
          '1057',
          'С',
          'cm'
        ],
        [
          '1058',
          'Т',
          'cm'
        ],
        [
          '1059',
          'У',
          'cm'
        ],
        [
          '1198',
          'Ү',
          'cm'
        ],
        [
          '1060',
          'Ф',
          'cm'
        ],
        [
          '1061',
          'Х',
          'cm'
        ],
        [
          '1062',
          'Ц',
          'cm'
        ],
        [
          '1063',
          'Ч',
          'cm'
        ],
        [
          '1064',
          'Ш',
          'cm'
        ],
        [
          '1065',
          'Щ',
          'cm'
        ],
        [
          '1067',
          'Ы',
          'cm'
        ],
        [
          '1068',
          'Ь',
          'cm'
        ],
        [
          '1069',
          'Э',
          'cm'
        ],
        [
          '1070',
          'Ю',
          'cm'
        ],
        [
          '1071',
          'Я',
          'cm'
        ]
      ];
    };
    var charmapFilter = function (charmap) {
      return Tools.grep(charmap, function (item) {
        return isArray(item) && item.length === 2;
      });
    };
    var getCharsFromSetting = function (settingValue) {
      if (isArray(settingValue)) {
        return [].concat(charmapFilter(settingValue));
      }
      if (typeof settingValue === 'function') {
        return settingValue();
      }
      return [];
    };
    var extendCharMap = function (editor, charmap) {
      var userCharMap = $_gmizv91je5o2t57.getCharMap(editor);
      if (userCharMap) {
        charmap = getCharsFromSetting(userCharMap);
      }
      var userCharMapAppend = $_gmizv91je5o2t57.getCharMapAppend(editor);
      if (userCharMapAppend) {
        return [].concat(charmap).concat(getCharsFromSetting(userCharMapAppend));
      }
      return charmap;
    };
    var getCharMap$1 = function (editor) {
      return extendCharMap(editor, getDefaultCharMap());
    };
    var $_6grdik8zje5o2t52 = { getCharMap: getCharMap$1 };

    var get = function (editor) {
      var getCharMap = function () {
        return $_6grdik8zje5o2t52.getCharMap(editor);
      };
      var insertChar = function (chr) {
        $_1daq4j8xje5o2t4z.insertChar(editor, chr);
      };
      return {
        getCharMap: getCharMap,
        insertChar: insertChar
      };
    };
    var $_1jcejz8wje5o2t4y = { get: get };

    var getHtml = function (charmap) {
      var gridHtml, x, y;
      var width = Math.min(charmap.length, 25);
      var height = Math.ceil(charmap.length / width);
      gridHtml = '<table role="presentation" cellspacing="0" class="mce-charmap"><tbody>';
      for (y = 0; y < height; y++) {
        gridHtml += '<tr>';
        for (x = 0; x < width; x++) {
          var index = y * width + x;
          if (index < charmap.length) {
            var chr = charmap[index];
            var charCode = parseInt(chr[0], 10);
            var chrText = chr ? String.fromCharCode(charCode) : '&nbsp;';
            var chr_class = (chr[2]!="undefined") ? chr[2] : '';
            gridHtml += '<td title="' + chr[1] + '">' + '<div tabindex="-1" title="' + chr[1] + '" class="'+ chr_class +'" role="button" data-chr="' + charCode + '">' + chrText + '</div>' + '</td>';
          } else {
            gridHtml += '<td />';
          }
        }
        gridHtml += '</tr>';
      }
      gridHtml += '</tbody></table>';
      gridHtml += '<style> .mce-charmap td div.mn{writing-mode: vertical-lr;-webkit-writing-mode: vertical-lr;font-family: OrhonChaganTig;} </style>';
      return gridHtml;
    };
    var $_97bhrs94je5o2t5c = { getHtml: getHtml };

    var getParentTd = function (elm) {
      while (elm) {
        if (elm.nodeName === 'TD') {
          return elm;
        }
        elm = elm.parentNode;
      }
    };
    var open = function (editor) {
      var win;
      var charMapPanel = {
        type: 'container',
        html: $_97bhrs94je5o2t5c.getHtml($_6grdik8zje5o2t52.getCharMap(editor)),
        onclick: function (e) {
          var target = e.target;
          if (/^(TD|DIV)$/.test(target.nodeName)) {
            var charDiv = getParentTd(target).firstChild;
            if (charDiv && charDiv.hasAttribute('data-chr')) {
              var charCodeString = charDiv.getAttribute('data-chr');
              var charCode = parseInt(charCodeString, 10);
              if (!isNaN(charCode)) {
                $_1daq4j8xje5o2t4z.insertChar(editor, String.fromCharCode(charCode));
              }
              if (!e.ctrlKey) {
                win.close();
              }
            }
          }
        },
        onmouseover: function (e) {
          var td = getParentTd(e.target);
          if (td && td.firstChild) {
            win.find('#preview').text(td.firstChild.firstChild.data);
            win.find('#previewTitle').text(td.title);
          } else {
            win.find('#preview').text(' ');
            win.find('#previewTitle').text(' ');
          }
        }
      };
      win = editor.windowManager.open({
        title: 'Special character',
        spacing: 10,
        padding: 10,
        items: [
          charMapPanel,
          {
            type: 'container',
            layout: 'flex',
            direction: 'column',
            align: 'center',
            spacing: 5,
            minWidth: 160,
            minHeight: 160,
            items: [
              {
                type: 'label',
                name: 'preview',
                text: ' ',
                style: 'font-size: 40px; text-align: center',
                border: 1,
                minWidth: 140,
                minHeight: 80
              },
              {
                type: 'spacer',
                minHeight: 20
              },
              {
                type: 'label',
                name: 'previewTitle',
                text: ' ',
                style: 'white-space: pre-wrap;',
                border: 1,
                minWidth: 140
              }
            ]
          }
        ],
        buttons: [{
            text: 'Close',
            onclick: function () {
              win.close();
            }
          }]
      });
    };
    var $_cghz8793je5o2t59 = { open: open };

    var register = function (editor) {
      editor.addCommand('mceShowCharmap', function () {
        $_cghz8793je5o2t59.open(editor);
      });
    };
    var $_7ahwyf92je5o2t58 = { register: register };

    var register$1 = function (editor) {
      editor.addButton('mongolcharmap', {
        text: 'MN',
        icon: false,
        tooltip: 'Special character',
        cmd: 'mceShowCharmap'
      });
      editor.addMenuItem('mongolcharmap', {
        icon: 'mongolcharmap',
        text: 'Special character',
        cmd: 'mceShowCharmap',
        context: 'insert'
      });
    };
    var $_6499hr95je5o2t5d = { register: register$1 };

    PluginManager.add('mongolcharmap', function (editor) {
      $_7ahwyf92je5o2t58.register(editor);
      $_6499hr95je5o2t5d.register(editor);
      return $_1jcejz8wje5o2t4y.get(editor);
    });
    function Plugin () {
    }

    return Plugin;

  }());
  })();
