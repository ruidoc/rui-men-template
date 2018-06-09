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




  define("tinymce/orhoncovertcodeplugin/Plugin", [
    "tinymce/PluginManager",
    "tinymce/util/Tools",
    "tinymce/util/JSON"
  ], function (PluginManager, Tools, JSON) {
    tinymce.PluginManager.add('orhoncovertcode', function (editor, url) {
      // Add a button that opens a window
      var settings = editor.settings;
      editor.addButton('orhoncovertcode', {
        text: 'Unicode',
        icon: false,
        onclick: function () {
          var convert_sys_url = "http://api.orhontech.com/api/sco/v1/convertcode";
          var data = {
            "content": editor.getContent()
          }
          var postData = '';
          Tools.each(data, function (value, key) {
            if (postData) {
              postData += '&';
            }
            postData += key + '=' + encodeURIComponent(value);
          });
          tinymce.util.XHR.send({
            url: settings.orhon_convertcode_rpc_url != undefined ? settings.orhon_convertcode_rpc_url : convert_sys_url,
            type: "post",
            content_type: 'application/x-www-form-urlencoded',
            data: postData,
            success: function (result) {
              result = JSON.parse(result);
              if (result.code == 200) {
                editor.windowManager.alert(result.message);
                if (result.data && result.data.content) {
                  editor.setContent(result.data.content);
                }
              } else {
                editor.windowManager.alert(result.message);
              }
            },
            error: function (type, xhr) {
              errorCallback("request error: " + xhr.status);
            }
          });
        }
      });
    });
  });
})(this);
