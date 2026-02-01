(function () {
  "use strict";
  if (!window.App || !window.App.Core) throw new Error("App.Core 未初始化");
  var Core = window.App.Core;
  var Constants = window.App.Constants;
  var UI = window.App.UI;
  var Notifications = window.App.Notifications;
  var DemoMain = window.App.Features && window.App.Features.Demo && window.App.Features.Demo.Main;

  Core.ensure("Constants", "App.Constants 未就緒");
  Core.ensure("UI", "App.UI 未就緒");
  Core.ensure("Features.Demo.Main", "App.Features.Demo.Main 未就緒");

  var DEMO_LIST_UPDATED = Constants.DEMO_LIST_UPDATED;
  var DEMO_ERROR = Constants.DEMO_ERROR;

  function onListUpdated(ev) {
    var items = (ev.detail && ev.detail.items) || [];
    UI.renderDemo({ items: items });
  }

  function onError(ev) {
    var err = ev.detail || {};
    var msg = err.message || "發生錯誤";
    UI.renderError({ message: msg });
    if (Notifications && Notifications.show) Notifications.show({ type: "error", message: msg });
  }

  function bind() {
    var addBtn = document.getElementById("demo-add");
    var reloadBtn = document.getElementById("demo-reload");
    var input = document.getElementById("demo-input");

    if (addBtn && input) {
      addBtn.addEventListener("click", function () {
        var text = (input.value || "").trim();
        DemoMain.handleCreate(text);
        input.value = "";
      });
    }
    if (reloadBtn) {
      reloadBtn.addEventListener("click", function () { DemoMain.handleReload(); });
    }

    document.addEventListener(DEMO_LIST_UPDATED, onListUpdated);
    document.addEventListener(DEMO_ERROR, onError);
  }

  function boot() {
    bind();
    DemoMain.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
