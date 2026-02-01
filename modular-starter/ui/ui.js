(function () {
  "use strict";
  if (!window.App || !window.App.Core) throw new Error("App.Core 未初始化，請檢查載入順序");
  if (!document.getElementById("app")) throw new Error("#app 容器不存在");

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function ensureRoot() {
    var app = document.getElementById("app");
    if (!app) return null;
    var root = app.querySelector(".demo-root");
    if (!root) {
      root = document.createElement("div");
      root.className = "demo-root";
      app.appendChild(root);
    }
    return root;
  }

  window.App.UI = {
    renderDemo: function (opts) {
      var root = ensureRoot();
      if (!root) return;
      var items = (opts && opts.items) || [];
      var listHtml = items.length === 0
        ? "<p class=\"demo-empty\">尚無項目</p>"
        : items.map(function (it) { return "<div class=\"demo-item\">" + escapeHtml(it.text || "") + "</div>"; }).join("");
      root.innerHTML = "<div class=\"demo-list\">" + listHtml + "</div>";
    },
    renderError: function (opts) {
      var root = ensureRoot();
      if (!root) return;
      var msg = (opts && opts.message) || "發生錯誤";
      root.innerHTML = "<div class=\"demo-error\">" + escapeHtml(msg) + "</div>";
    }
  };
})();
