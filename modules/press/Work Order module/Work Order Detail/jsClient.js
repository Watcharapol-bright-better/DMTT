 // ============================================================
 // WO Plan Client-side Calc (UI only)
 // - Calculate END / PLAN_MINUTES / SHIFT / REQ_COIL on screen
 // - Keep Part ID from disappearing without triggering ajax
 // - Hook SAVE button (id: BUTTON_BTM_R:0:BAT) to run calc before engine
 // ============================================================

 // =========================
 // CONFIG
 // =========================
 var PLAN_START_ID = "TLN_1_I_PLAN_START";
 var END_ID = "TLN_1_I_PLAN_FINISHED";
 var PLAN_MIN_ID = "TLN_1_PLAN_MINUTES";

 var LIST_DATE_ID = "TLN_4_I_PLN_STR_DATE_0";

 var SHIFT_DAY_ID = "TLN_1_SHIFT__0";
 var SHIFT_NGT_ID = "TLN_1_SHIFT__1";

 // Search condition Part ID (กันหาย แต่ไม่ยิง ajax)
 var PART_ID_INPUT_ID = "CNDTN_STD:1:_TEXT";
 var PART_SS_KEY = "WO_PLAN_XFER";

 // FG row0 hidden inputs (ยังคำนวณได้)
 var FG_QTY0_ID = "TLN_2_I_WO_QTY_0";
 var FG_RMWGT0_ID = "TLN_2_I_RM_WGT_0";
 var FG_SPM0_ID = "TLN_2_I_SPM_0";
 var FG_EFF0_ID = "TLN_2_I_PROD_RATE_0";
 var FG_YIELD0_ID = "TLN_2_I_YIELD_0";

 // FG: Req coil count
 var REQ_COIL_ID = "TLN_2_I_REQ_COIL_0";

 // RM block (3)
 var RM_PICK_PREFIX = "TLN_3_I_PICK_FLG_";
 var RM_PICK_SUFFIX = "__0";
 var RM_WGT_PREFIX = "TLN_3_I_CUR_WGT_";

 // SAVE button
 var SAVE_BTN_ID = "BUTTON_BTM_R:0:BAT";

 // =========================
 // Helpers (SAFE)
 // =========================
 function trim(s) {
   return String(s == null ? "" : s).replace(/^\s+|\s+$/g, "");
 }

 // ✅ safe delay (client side normally has setTimeout; fallback to immediate)
 function later(fn, ms) {
   try {
     if (typeof setTimeout === "function") return setTimeout(fn, ms || 0);
   } catch (e) {}
   try {
     fn();
   } catch (e2) {}
   return null;
 }

 // ✅ fire แบบปลอดภัย: ไม่ blur ไม่เรียก onblur (กัน PrimeFaces.ab)
 function fireSoft(el) {
   if (!el) return;
   try {
     el.dispatchEvent(new Event("input", {
       bubbles: true
     }));
   } catch (e) {}
   try {
     el.dispatchEvent(new Event("change", {
       bubbles: true
     }));
   } catch (e) {}
 }

 // ✅ สำหรับ input ที่มี onblur ของ PrimeFaces: ห้ามยิง event
 function setValueNoEvent(el, val) {
   if (!el) return false;
   el.value = val;
   el.setAttribute("data-save-value", val);
   if (el.dataset) el.dataset.saveValue = val;
   return true;
 }

 function setTalonValue(id, val) {
   var el = document.getElementById(id);
   if (!el) return false;
   el.value = val;
   el.setAttribute("data-save-value", val);
   if (el.dataset) el.dataset.saveValue = val;
   fireSoft(el);
   return true;
 }

 function getVal(id) {
   var el = document.getElementById(id);
   return el ? el.value : "";
 }

 function toNum(v) {
   if (v == null) return 0;
   var s = String(v).replace(/,/g, "").trim();
   if (s === "") return 0;
   var n = parseFloat(s);
   return isNaN(n) ? 0 : n;
 }

 function pad2(n) {
   return (n < 10 ? "0" + n : "" + n);
 }

 function parseDMY(s) {
   if (!s) return null;
   s = String(s).trim();
   var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
   if (!m) return null;
   return new Date(
     parseInt(m[3], 10),
     parseInt(m[2], 10) - 1,
     parseInt(m[1], 10),
     parseInt(m[4] || "0", 10),
     parseInt(m[5] || "0", 10),
     parseInt(m[6] || "0", 10)
   );
 }

 function formatDMYHMS(d) {
   return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear() +
     " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
 }

 // =========================
 // B) Shift auto (no ajax)
 // =========================
 function hourFrom(v) {
   var m = v && String(v).match(/\b(\d{1,2}):\d{2}\b/);
   if (!m) return null;
   var h = parseInt(m[1], 10);
   return isNaN(h) ? null : h;
 }

 function setShift(isNight) {
   var day = document.getElementById(SHIFT_DAY_ID);
   var ngt = document.getElementById(SHIFT_NGT_ID);
   var t = isNight ? ngt : day;
   if (!t) return false;
   try {
     t.click();
   } catch (e) {
     t.checked = true;
   }
   fireSoft(t);
   return true;
 }

 function refreshShift() {
   var el = document.getElementById(PLAN_START_ID);
   if (!el) return false;
   var h = hourFrom(el.value);
   if (h == null) return false;
   setShift(h >= 12);
   return true;
 }

 // =========================
 // C) Sync PLAN_START date-only -> Process Line date0 (safe)
 // =========================
 function extractDateOnly(v) {
   v = trim(v);
   if (!v) return "";
   var m = v.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
   if (m) return m[1];
   var m2 = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
   if (m2) return ("0" + m2[3]).slice(-2) + "/" + ("0" + m2[2]).slice(-2) + "/" + m2[1];
   return "";
 }

 function syncPlanStartDateToList() {
   var src = document.getElementById(PLAN_START_ID);
   var dst = document.getElementById(LIST_DATE_ID);
   if (!src || !dst) return false;

   var raw = trim(src.value) || trim(src.getAttribute("data-save-value"));
   var d = extractDateOnly(raw);
   if (!d) return false;

   if (trim(dst.value) !== d) {
     dst.value = d;
     dst.setAttribute("data-save-value", d);
     if (dst.dataset) dst.dataset.saveValue = d;
     fireSoft(dst);
   }
   return true;
 }

 // =========================
 // D) Part ID: กันหายแบบ “ไม่ยิง ajax”
 // =========================
 function getPartIdFromSession() {
   try {
     var o = JSON.parse(sessionStorage.getItem(PART_SS_KEY) || "null");
     if (o && o.partId) return trim(o.partId);
   } catch (e) {}
   return "";
 }

 function ensurePartIdNoAjax() {
   var inp = document.getElementById(PART_ID_INPUT_ID);
   if (!inp) return false;

   var cur = trim(inp.value);
   var saved = trim(inp.getAttribute("data-save-value"));

   if (cur && !saved) {
     return setValueNoEvent(inp, cur);
   }

   if (!cur && !saved) {
     var v = getPartIdFromSession();
     if (!v) return false;
     var ok = setValueNoEvent(inp, v);
     if (ok) {
       try {
         sessionStorage.removeItem(PART_SS_KEY);
       } catch (e) {}
     }
     return ok;
   }

   return true;
 }

 // =========================
 // E) RM pick count + weight sum
 // =========================
 function isRmPickedRow(r) {
   var cb = document.getElementById(RM_PICK_PREFIX + r + RM_PICK_SUFFIX);
   if (!cb) return false;
   if (cb.type === "checkbox") return !!cb.checked;
   var v = (cb.value != null ? String(cb.value) : "").trim().toUpperCase();
   return (v === "1" || v === "Y" || v === "TRUE" || v === "T" || v === "ON");
 }

 function countRmPicked() {
   var cnt = 0;
   for (var r = 0; r < 500; r++) {
     var cb = document.getElementById(RM_PICK_PREFIX + r + RM_PICK_SUFFIX);
     if (!cb) {
       if (r === 0) break;
       break;
     }
     if (isRmPickedRow(r)) cnt++;
   }
   return cnt;
 }

 function hasAnyRmPicked() {
   return countRmPicked() > 0;
 }

 function sumRmActualWeightPicked() {
   var sum = 0;
   for (var r = 0; r < 500; r++) {
     var cb = document.getElementById(RM_PICK_PREFIX + r + RM_PICK_SUFFIX);
     if (!cb) {
       if (r === 0) break;
       break;
     }
     if (!isRmPickedRow(r)) continue;
     var wEl = document.getElementById(RM_WGT_PREFIX + r);
     sum += wEl ? toNum(wEl.value) : 0;
   }
   return sum;
 }

 function setReqCoilCount() {
   var cnt = countRmPicked();
   setTalonValue(REQ_COIL_ID, String(cnt));
   return true;
 }

 // =========================
 // F) Calc END + PLAN_MIN (Yield-based)
 // =========================
 function calcMinutes(numerator, spm, eff, yieldPct) {
   numerator = toNum(numerator);
   spm = toNum(spm);
   eff = toNum(eff);
   yieldPct = toNum(yieldPct);

   if (numerator <= 0 || spm <= 0 || eff <= 0 || yieldPct <= 0) return 0;
   var denom = (spm * eff) / yieldPct;
   if (denom <= 0) return 0;
   return numerator / denom;
 }

 function recalcEndAndPlanMinutes() {
   var src = document.getElementById(PLAN_START_ID);
   if (!src) return false;

   var raw = trim(src.value) || trim(src.getAttribute("data-save-value"));
   var start = parseDMY(raw);
   if (!start) return false;

   var qty = toNum(getVal(FG_QTY0_ID));
   var rmWgtPcs = toNum(getVal(FG_RMWGT0_ID));
   var spm = toNum(getVal(FG_SPM0_ID));
   var eff = toNum(getVal(FG_EFF0_ID));
   var yieldPct = toNum(getVal(FG_YIELD0_ID));

   var minutes = 0;
   if (hasAnyRmPicked()) {
     minutes = calcMinutes(sumRmActualWeightPicked(), spm, eff, yieldPct);
   } else {
     minutes = calcMinutes(qty * rmWgtPcs, spm, eff, yieldPct);
   }

   if (minutes <= 0) return false;

   var minInt = Math.ceil(minutes);
   setTalonValue(PLAN_MIN_ID, String(minInt));

   var end = new Date(start.getTime() + minutes * 60000);
   setTalonValue(END_ID, formatDMYHMS(end));

   return true;
 }

 // =========================
 // A single "run all" entry (used by SAVE hook too)
 // =========================
 function runAllCalc() {
   try {
     ensurePartIdNoAjax();
   } catch (e) {}
   try {
     refreshShift();
   } catch (e) {}
   try {
     syncPlanStartDateToList();
   } catch (e) {}
   try {
     setReqCoilCount();
   } catch (e) {}
   try {
     recalcEndAndPlanMinutes();
   } catch (e) {}
 }

 // =========================
 // Bind events (SAFE)
 // =========================
 function bindOnce(id, fn) {
   var el = document.getElementById(id);
   if (!el || el.__BIND__) return false;
   el.__BIND__ = true;
   ["input", "change", "keyup"].forEach(function(ev) {
     el.addEventListener(ev, function() {
       later(fn, 20);
     });
   });
   return true;
 }

 function bindRmRow(r) {
   var cbId = RM_PICK_PREFIX + r + RM_PICK_SUFFIX;
   var cb = document.getElementById(cbId);
   if (cb && !cb.__BIND__) {
     cb.__BIND__ = true;
     ["click", "change"].forEach(function(ev) {
       cb.addEventListener(ev, function() {
         later(function() {
           setReqCoilCount();
           recalcEndAndPlanMinutes();
         }, 20);
       });
     });
   }

   var w = document.getElementById(RM_WGT_PREFIX + r);
   if (w && !w.__BIND__) {
     w.__BIND__ = true;
     ["input", "change"].forEach(function(ev) {
       w.addEventListener(ev, function() {
         later(function() {
           setReqCoilCount();
           recalcEndAndPlanMinutes();
         }, 20);
       });
     });
   }
 }

 // =========================
 // Hook SAVE button (prepend to onclick)
 // =========================
 function bindSaveHook() {
   var btn = document.getElementById(SAVE_BTN_ID);
   if (!btn || btn.__HOOK_SAVE__) return false;
   btn.__HOOK_SAVE__ = true;

   // keep original onclick
   var old = btn.getAttribute("onclick") || "";

   // prepend calc, then call original
   btn.setAttribute("onclick",
     "try{" +
     "var api=window.WOPlanCalc;" +
     "if(api&&typeof api.runAllCalc==='function'){ api.runAllCalc(); }" +
     "}catch(e){};" +
     old
   );

   return true;
 }

 // =========================
 // Expose API for onclick hook (global)
 // =========================
 window.WOPlanCalc = window.WOPlanCalc || {};
 window.WOPlanCalc.runAllCalc = runAllCalc;
 window.WOPlanCalc.ensurePartIdNoAjax = ensurePartIdNoAjax;
 window.WOPlanCalc.refreshShift = refreshShift;
 window.WOPlanCalc.syncPlanStartDateToList = syncPlanStartDateToList;
 window.WOPlanCalc.setReqCoilCount = setReqCoilCount;
 window.WOPlanCalc.recalcEndAndPlanMinutes = recalcEndAndPlanMinutes;

 // =========================
 // Main loop: wait render then bind
 // =========================
 var tick = 0;
 var timer = setInterval(function() {
   tick++;

   // always try keep part id
   ensurePartIdNoAjax();

   // bind main inputs
   bindOnce(PLAN_START_ID, function() {
     refreshShift();
     syncPlanStartDateToList();
     setReqCoilCount();
     recalcEndAndPlanMinutes();
   });

   // bind FG hidden fields (row0)
   [FG_QTY0_ID, FG_RMWGT0_ID, FG_SPM0_ID, FG_EFF0_ID, FG_YIELD0_ID].forEach(function(id) {
     bindOnce(id, function() {
       setReqCoilCount();
       recalcEndAndPlanMinutes();
     });
   });

   // bind RM rows that exist
   for (var r = 0; r < 200; r++) {
     var cb = document.getElementById(RM_PICK_PREFIX + r + RM_PICK_SUFFIX);
     var w = document.getElementById(RM_WGT_PREFIX + r);
     if (!cb && !w) {
       if (r === 0) break;
       break;
     }
     bindRmRow(r);
   }

   // hook save
   bindSaveHook();

   // initial run
   runAllCalc();

   // stop after ~15s
   if (tick >= 75) clearInterval(timer);
 }, 200);

 // Optional: if user clicks Search/Create Plan (or any button), run calc softly
 document.addEventListener("click", function(ev) {
   var btn = ev.target;
   if (!btn) return;
   var txt = String(btn.value || btn.textContent || "").toLowerCase();
   if (txt.indexOf("search") > -1 || txt.indexOf("create plan") > -1) {
     runAllCalc();
   }
 }, true);






function updateBoxHeight() {
  function removeHeight(id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.removeProperty("height");
    }
  }

  // Box Card 0
  removeHeight("BASE:0:block");

  const baseCard = document.getElementById("BASE:0:CARD");
  if (baseCard) {
    baseCard.setAttribute("style", "overflow: auto;");
  }

  for (let i = 1; i <= 5; i++) {
    removeHeight(`box${i}`);
    removeHeight(`BASE:${i}:block`);
    removeHeight(`tbl_scrollable_body_L_${i}`);
  }
}

function resizeContents_end() { 
  updateBoxHeight();
  
}