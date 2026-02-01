(function () {
  "use strict";
  if (!window.App || !window.App.Core) {
    throw new Error("App.Core 未初始化，請確認 core 已載入且載入順序正確");
  }

  var store = {};
  var meta = {}; // key -> { expires }

  window.App.Cache = {
    get: function (key) {
      var m = meta[key];
      if (m && m.expires != null && Date.now() > m.expires) {
        delete store[key];
        delete meta[key];
        return undefined;
      }
      return store[key];
    },
    set: function (key, value, ttlMs) {
      store[key] = value;
      meta[key] = ttlMs != null ? { expires: Date.now() + ttlMs } : {};
    },
    del: function (key) {
      delete store[key];
      delete meta[key];
    }
  };
})();
