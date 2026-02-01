(function () {
  "use strict";
  if (typeof window === "undefined") throw new Error("constants.js 需在瀏覽器環境執行");
  if (!window.App) throw new Error("App 未初始化，請確認 core/config.js 已載入");
  window.App.Constants = {
    DEMO_LIST_UPDATED: "demo:list-updated",
    DEMO_ERROR: "demo:error",
    DEFAULT_LIMIT: 50
  };
})();
