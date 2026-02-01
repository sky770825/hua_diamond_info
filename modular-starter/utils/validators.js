(function () {
  "use strict";
  if (!window.App || !window.App.Core) {
    throw new Error("App.Core 未初始化，請確認 core 已載入且載入順序正確");
  }

  window.App.Validators = {
    isNonEmptyString: function (v) {
      if (typeof v !== "string" || !v.trim()) {
        return { ok: false, code: "VALIDATION_EMPTY", message: "不可為空" };
      }
      return { ok: true };
    },
    maxLen: function (str, n) {
      if (typeof str !== "string") return { ok: false, code: "VALIDATION_TYPE", message: "須為字串" };
      if (str.length > n) {
        return { ok: false, code: "VALIDATION_MAX_LEN", message: "超過長度上限 " + n };
      }
      return { ok: true };
    }
  };
})();
