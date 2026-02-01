(function () {
  "use strict";
  if (!window.App || !window.App.Core) throw new Error("App.Core 未初始化");
  if (!window.App.Config) throw new Error("App.Config 未就緒");

  var Config = window.App.Config;
  var base = (Config.API_BASE || "").replace(/\/$/, "");

  function buildUrl(path) {
    var p = path.charAt(0) === "/" ? path : "/" + path;
    return base ? base + p : p;
  }

  window.App.ApiClient = {
    request: function (opts) {
      var method = (opts.method || "GET").toUpperCase();
      var path = opts.path || "/";
      var body = opts.body;
      var url = buildUrl(path);
      var headers = { "Accept": "application/json" };
      if (body != null && typeof body === "object" && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      var init = { method: method, headers: headers };
      if (body != null && method !== "GET") {
        init.body = typeof body === "string" ? body : (body instanceof FormData ? body : JSON.stringify(body));
      }

      return fetch(url, init).then(function (res) {
        var contentType = res.headers.get("content-type") || "";
        var isJson = contentType.indexOf("application/json") !== -1;
        var payload = isJson ? res.json() : res.text();
        return payload.then(function (data) {
          if (res.ok) return { ok: true, data: data };
          var err = { code: "API_ERROR", message: res.statusText, detail: data };
          if (data && typeof data === "object" && (data.code || data.message)) {
            err.code = data.code || err.code;
            err.message = data.message || err.message;
            err.detail = data.detail !== undefined ? data.detail : data;
          }
          return { ok: false, error: err };
        });
      }).catch(function (e) {
        return { ok: false, error: { code: "NETWORK", message: e.message, detail: e } };
      });
    }
  };
})();
