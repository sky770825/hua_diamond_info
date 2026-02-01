(function () {
  "use strict";
  if (!window.App || !window.App.Core) {
    throw new Error("App.Core 未初始化，請確認 core 已載入且載入順序正確");
  }

  window.App.Utils = {
    uuid: function () {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    safeJsonParse: function (str, fallback) {
      if (str == null || str === "") return fallback;
      try {
        return JSON.parse(str);
      } catch (e) {
        return fallback;
      }
    },
    sleep: function (ms) {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }
  };
})();
