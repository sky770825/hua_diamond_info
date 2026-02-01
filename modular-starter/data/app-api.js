(function () {
  "use strict";
  if (!window.App || !window.App.Core) throw new Error("App.Core 未初始化");
  if (!window.App.Cache) throw new Error("App.Cache 未就緒");
  if (!window.App.Utils) throw new Error("App.Utils 未就緒");
  if (!window.App.ApiClient) throw new Error("App.ApiClient 未就緒");

  var Cache = window.App.Cache;
  var Utils = window.App.Utils;
  var ApiClient = window.App.ApiClient;
  var KEY = "demo_items";

  function ensureItems() {
    var v = Cache.get(KEY);
    if (!Array.isArray(v)) { Cache.set(KEY, []); return []; }
    return v;
  }

  window.App.Api = {
    demoList: function () {
      var ms = 200 + Math.floor(Math.random() * 201);
      return Utils.sleep(ms).then(function () {
        var items = ensureItems();
        return { ok: true, data: items };
      });
    },
    demoCreate: function (text) {
      var ms = 200 + Math.floor(Math.random() * 201);
      return Utils.sleep(ms).then(function () {
        var items = ensureItems();
        var item = { id: Utils.uuid(), text: text, createdAt: Date.now() };
        items.push(item);
        Cache.set(KEY, items);
        return { ok: true, data: item };
      });
    }
  };
})();
