(function () {
  "use strict";
  var Core = window.App && window.App.Core;
  var Validators = window.App && window.App.Validators;
  var Constants = window.App && window.App.Constants;
  var Api = window.App && window.App.Api;
  if (!Core) throw new Error("App.Core 未初始化，請檢查載入順序");
  if (!Validators || !Constants || !Api) throw new Error("App.Validators / Constants / Api 未就緒");

  var limit = Constants.DEFAULT_LIMIT || 50;

  function toError(e) {
    if (e && typeof e === "object" && "code" in e && "message" in e) return e;
    return { code: "UNKNOWN", message: String(e && e.message || e), detail: e };
  }

  window.App.Features = window.App.Features || {};
  window.App.Features.Demo = window.App.Features.Demo || {};
  window.App.Features.Demo.Funcs = {
    loadList: function () {
      return Api.demoList().then(function (res) {
        if (!res.ok) throw { code: res.error.code, message: res.error.message, detail: res.error.detail };
        return res.data;
      }).catch(function (e) { throw toError(e); });
    },
    createItem: function (text) {
      var v = Validators.isNonEmptyString(text);
      if (!v.ok) throw { code: v.code, message: v.message, detail: text };
      v = Validators.maxLen(text, limit);
      if (!v.ok) throw { code: v.code, message: v.message, detail: text };
      return Api.demoCreate(text).then(function (res) {
        if (!res.ok) throw { code: (res.error && res.error.code) || "API_ERROR", message: (res.error && res.error.message) || "新增失敗", detail: res.error };
        return res.data;
      }).catch(function (e) { throw toError(e); });
    }
  };
})();
