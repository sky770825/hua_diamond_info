(function () {
  "use strict";
  if (!window.App || !window.App.Core) {
    throw new Error("App.Core 未初始化，請確認 core 已載入且載入順序正確");
  }

  function showToast(opts) {
    var type = (opts && opts.type) || "info";
    var message = (opts && opts.message) || "";
    var container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = "position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
      document.body.appendChild(container);
    }
    var el = document.createElement("div");
    el.style.cssText = "padding:10px 14px;border-radius:6px;font-size:14px;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,.15);";
    if (type === "success") { el.style.background = "#22c55e"; el.style.color = "#fff"; }
    else if (type === "error") { el.style.background = "#ef4444"; el.style.color = "#fff"; }
    else { el.style.background = "#3b82f6"; el.style.color = "#fff"; }
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }

  window.App.Notifications = {
    show: function (opts) {
      if (typeof document === "undefined" || !document.body) {
        console.warn("[Notifications] DOM 未就緒，fallback console");
        console.log("[Toast " + (opts && opts.type) + "]", opts && opts.message);
        return;
      }
      showToast(opts);
    }
  };
})();
