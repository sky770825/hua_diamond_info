(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("app-init.js 需在瀏覽器環境執行");
  }
  if (!window.App) throw new Error("App 未初始化，請確認 core 載入順序：config → constants → app-init");
  if (!window.App.Config || !window.App.Constants) {
    throw new Error("App.Config / App.Constants 未就緒，請檢查 core 載入順序");
  }

  window.App.Core = {
    ensure: function (path, message) {
      var parts = path.split(".");
      var o = window.App;
      for (var i = 0; i < parts.length; i++) {
        o = o && o[parts[i]];
      }
      if (o == null) throw new Error(message || "依賴缺失: " + path);
      return o;
    },
    now: function () { return Date.now(); }
  };
})();
