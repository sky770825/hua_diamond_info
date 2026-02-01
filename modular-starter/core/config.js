(function () {
  "use strict";
  if (typeof window === "undefined") throw new Error("config.js 需在瀏覽器環境執行");
  window.App = window.App || {};
  window.App.Config = {
    APP_NAME: "ModularStarter",
    APP_VERSION: "1.0.0",
    API_BASE: "",
    DEBUG: true
  };
})();
