(function () {
  "use strict";
  var Core = window.App && window.App.Core;
  var Constants = window.App && window.App.Constants;
  var Funcs = window.App && window.App.Features && window.App.Features.Demo && window.App.Features.Demo.Funcs;
  var Notifications = window.App && window.App.Notifications;
  if (!Core) throw new Error("App.Core 未初始化，請檢查載入順序");
  if (!Constants || !Funcs) throw new Error("App.Constants / App.Features.Demo.Funcs 未就緒");

  var DEMO_LIST_UPDATED = Constants.DEMO_LIST_UPDATED;
  var DEMO_ERROR = Constants.DEMO_ERROR;

  function dispatch(name, payload) {
    if (typeof document === "undefined") return;
    document.dispatchEvent(new CustomEvent(name, { detail: payload || {} }));
  }

  window.App.Features.Demo.Main = {
    init: function () {
      return Funcs.loadList().then(function (items) {
        dispatch(DEMO_LIST_UPDATED, { items: items || [] });
      }).catch(function (e) {
        var err = { code: e.code, message: e.message, detail: e.detail };
        dispatch(DEMO_ERROR, err);
      });
    },
    handleCreate: function (text) {
      return Funcs.createItem(text).then(function () {
        return Funcs.loadList();
      }).then(function (items) {
        dispatch(DEMO_LIST_UPDATED, { items: items || [] });
        if (Notifications && Notifications.show) Notifications.show({ type: "success", message: "新增成功" });
      }).catch(function (e) {
        var err = { code: e.code, message: e.message, detail: e.detail };
        dispatch(DEMO_ERROR, err);
      });
    },
    handleReload: function () {
      return Funcs.loadList().then(function (items) {
        dispatch(DEMO_LIST_UPDATED, { items: items || [] });
      }).catch(function (e) {
        var err = { code: e.code, message: e.message, detail: e.detail };
        dispatch(DEMO_ERROR, err);
      });
    }
  };
})();
