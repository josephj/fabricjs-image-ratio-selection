// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/parrot.jpg":[function(require,module,exports) {
module.exports = "/parrot.22263403.jpg";
},{}],"src/index.js":[function(require,module,exports) {
"use strict";

var _parrot = _interopRequireDefault(require("./parrot.jpg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var canvas = new fabric.Canvas("canvas", {
  backgroundColor: "#ccc",
  selection: true,
  selectionClor: "blue",
  selectionLineWidth: 2,
  width: 320,
  height: 320
});
fabric.Image.fromURL(_parrot.default, function (imgEl) {
  imgEl.set({
    left: 0,
    top: (320 - 256) / 2,
    width: 320,
    height: 256,
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    lockUniScaling: true,
    hasControls: false,
    hasBorders: false
  });
  canvas.add(imgEl);
});
var CropZone = fabric.util.createClass(fabric.Rect, {
  _render: function _render(ctx) {
    this.callSuper("_render", ctx);
    var canvas = ctx.canvas;
    var dashWidth = 7; // Set original scale

    var flipX = this.flipX ? -1 : 1;
    var flipY = this.flipY ? -1 : 1;
    var scaleX = flipX / this.scaleX;
    var scaleY = flipY / this.scaleY;
    ctx.scale(scaleX, scaleY); // Overlay rendering

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

    this._renderOverlay(ctx); // Set dashed borders


    if (ctx.setLineDash !== undefined) ctx.setLineDash([dashWidth, dashWidth]);else if (ctx.mozDash !== undefined) ctx.mozDash = [dashWidth, dashWidth]; // First lines rendering with black

    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";

    this._renderBorders(ctx);

    this._renderGrid(ctx); // Re render lines in white


    ctx.lineDashOffset = dashWidth;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";

    this._renderBorders(ctx);

    this._renderGrid(ctx); // Reset scale


    ctx.scale(1 / scaleX, 1 / scaleY);
  },
  _renderOverlay: function _renderOverlay(ctx) {
    //var canvas = ctx.canvas;
    //
    //    x0    x1        x2      x3
    // y0 +------------------------+
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    // y1 +------+---------+-------+
    //    |\\\\\\|         |\\\\\\\|
    //    |\\\\\\|    0    |\\\\\\\|
    //    |\\\\\\|         |\\\\\\\|
    // y2 +------+---------+-------+
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    //    |\\\\\\\\\\\\\\\\\\\\\\\\|
    // y3 +------------------------+
    //
    var x0 = Math.ceil(-this.getScaledWidth() / 2 - this.left);
    var x1 = Math.ceil(-this.getScaledWidth() / 2);
    var x2 = Math.ceil(this.getScaledWidth() / 2);
    var x3 = Math.ceil(this.getScaledWidth() / 2 + (canvas.width - this.getScaledWidth() - this.left));
    var y0 = Math.ceil(-this.getScaledHeight() / 2 - this.top);
    var y1 = Math.ceil(-this.getScaledHeight() / 2);
    var y2 = Math.ceil(this.getScaledHeight() / 2);
    var y3 = Math.ceil(this.getScaledHeight() / 2 + (canvas.height - this.getScaledHeight() - this.top));
    ctx.beginPath(); // Draw outer rectangle.
    // Numbers are +/-1 so that overlay edges don't get blurry.

    ctx.moveTo(x0 - 1, y0 - 1);
    ctx.lineTo(x3 + 1, y0 - 1);
    ctx.lineTo(x3 + 1, y3 + 1);
    ctx.lineTo(x0 - 1, y3 - 1);
    ctx.lineTo(x0 - 1, y0 - 1);
    ctx.closePath(); // Draw inner rectangle.

    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.fill();
  },
  _renderBorders: function _renderBorders(ctx) {
    ctx.beginPath();
    ctx.moveTo(-this.getScaledWidth() / 2, -this.getScaledHeight() / 2); // upper left

    ctx.lineTo(this.getScaledWidth() / 2, -this.getScaledHeight() / 2); // upper right

    ctx.lineTo(this.getScaledWidth() / 2, this.getScaledHeight() / 2); // down right

    ctx.lineTo(-this.getScaledWidth() / 2, this.getScaledHeight() / 2); // down left

    ctx.lineTo(-this.getScaledWidth() / 2, -this.getScaledHeight() / 2); // upper left

    ctx.stroke();
  },
  _renderGrid: function _renderGrid(ctx) {
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(-this.getScaledWidth() / 2 + 1 / 3 * this.getScaledWidth(), -this.getScaledHeight() / 2);
    ctx.lineTo(-this.getScaledWidth() / 2 + 1 / 3 * this.getScaledWidth(), this.getScaledHeight() / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-this.getScaledWidth() / 2 + 2 / 3 * this.getScaledWidth(), -this.getScaledHeight() / 2);
    ctx.lineTo(-this.getScaledWidth() / 2 + 2 / 3 * this.getScaledWidth(), this.getScaledHeight() / 2);
    ctx.stroke(); // Horizontal lines

    ctx.beginPath();
    ctx.moveTo(-this.getScaledWidth() / 2, -this.getScaledHeight() / 2 + 1 / 3 * this.getScaledHeight());
    ctx.lineTo(this.getScaledWidth() / 2, -this.getScaledHeight() / 2 + 1 / 3 * this.getScaledHeight());
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-this.getScaledWidth() / 2, -this.getScaledHeight() / 2 + 2 / 3 * this.getScaledHeight());
    ctx.lineTo(this.getScaledWidth() / 2, -this.getScaledHeight() / 2 + 2 / 3 * this.getScaledHeight());
    ctx.stroke();
  }
});
var cropZone = new CropZone({
  fill: "transparent",
  hasBorders: false,
  originX: "left",
  originY: "top",
  cornerColor: "#444",
  cornerSize: 8,
  transparentCorners: false,
  lockRotation: true,
  hasRotatingPoint: false,
  lockMovementX: true,
  width: 320,
  height: 200,
  left: 0,
  top: 30
});
canvas.add(cropZone);
},{"./parrot.jpg":"src/parrot.jpg"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "65306" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map