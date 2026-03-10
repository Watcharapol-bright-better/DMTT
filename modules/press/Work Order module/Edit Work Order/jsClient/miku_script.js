(function () {
  // ฟังก์ชันช่วยจัดการตัวเลขและลูกน้ำ
  function toNum(v) { 
    if (!v) return 0;
    // ลบลูกน้ำออกก่อนแปลงเป็นตัวเลข
    return parseFloat(String(v).replace(/,/g, "")) || 0; 
  }

  function toComma(v) {
    var n = toNum(v);
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  
  function pad2(n) { return n < 10 ? "0" + n : n; }
  function formatDMYHMS(d) { 
    return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear() + " " + 
           pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds()); 
  }
  
  function parseDMY(s) {
    var m = String(s || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    return m ? new Date(m[3], m[2] - 1, m[1], m[4] || 0, m[5] || 0, m[6] || 0) : null;
  }

  function uiUpdate(id, val, useComma) {
    var el = document.getElementById(id);
    if (!el) return;
    
    // จัดรูปแบบค่าที่จะใส่
    var formattedVal = useComma ? toComma(val) : String(val);
    var currentVal = (el.tagName === "SPAN" || el.tagName === "DIV") ? el.textContent : el.value;
    
    // ตรวจสอบค่าปัจจุบัน (แบบไม่มีลูกน้ำ) ถ้าเท่าเดิมไม่ต้อง Update เพื่อกันเลขดิ้น
    if (String(currentVal).replace(/,/g, "") === String(formattedVal).replace(/,/g, "")) return;

    if (el.tagName === "SPAN" || el.tagName === "DIV") {
        el.textContent = formattedVal;
    } else {
        el.value = formattedVal;
    }
    
    el.setAttribute("data-save-value", formattedVal);
    console.log("✅ [Update] ID:", id, "->", formattedVal);

    ["change", "blur"].forEach(function(ev) {
        el.dispatchEvent(new Event(ev, { bubbles: true }));
    });
  }

  function masterLoop(triggerSource) {
    try {
      // 1. ดึงค่า Master
      var targetQtyIn = document.getElementById("TLN_2_I_WO_QTY_0");
      var targetQty    = toNum(targetQtyIn ? targetQtyIn.value : 0);
      var rmWgtGram    = toNum(document.getElementById("TLN_2_I_RM_WGT_0").value);
      var spm          = toNum(document.getElementById("TLN_2_I_SPM_0").value);
      var yieldFac     = toNum(document.getElementById("TLN_2_I_YIELD_0").value);
      var prodFac      = toNum(document.getElementById("TLN_2_I_PROD_RATE_0").value);

      // 2. คำนวณจาก Checkbox (Sum Weight ทุกแถวที่ Checked)
      var pickCount = 0;
      var sumWeightKg = 0;
      var allCheckboxes = document.querySelectorAll('input[id^="TLN_3_I_PICK_FLG_"]');
      
      allCheckboxes.forEach(function(cb) {
        if (cb.checked) {
          pickCount++;
          // ดึง Index จากท้าย ID (รองรับทั้งแบบ _1 และ _1__0)
          var idParts = cb.id.split('_');
          var rowIndex = idParts[idParts.length - 1];
          // ถ้าเป็นรูปแบบ __0 ให้เอาตัวก่อนหน้า
          if (rowIndex === "0" && idParts[idParts.length - 2] === "") {
             rowIndex = idParts[idParts.length - 3];
          }
          
          var wEl = document.getElementById("TLN_3_I_CUR_WGT_" + rowIndex);
          if (wEl) {
            sumWeightKg += toNum(wEl.value || wEl.textContent);
          }
        }
      });

      // 3. อัปเดต Qty และ Actual Pcs
      uiUpdate("TLN_2_I_REQ_COIL_0", String(pickCount), false);
      
      // สูตร: (น้ำหนักรวม kg * 1000) / น้ำหนักต่อชิ้น g
      var actualQty = (pickCount > 0 && rmWgtGram > 0) ? Math.floor((sumWeightKg * 1000) / rmWgtGram) : 0;
      uiUpdate("TLN_2_I_ACTUAL_QTY_0", actualQty, true);

      // 4. คำนวณเวลา และ Shift
      var sEl = document.getElementById("TLN_1_I_PLAN_START");
      if (sEl && sEl.value) {
        var sObj = parseDMY(sEl.value);
        if (sObj) {
          // --- Auto Judge Shift ---
          var mTime = sEl.value.match(/(\d{1,2}):(\d{2})/);
          if (mTime) {
            var minDay = parseInt(mTime[1]) * 60 + parseInt(mTime[2]);
            var dR = document.getElementById("TLN_1_SHIFT__0"); 
            var nR = document.getElementById("TLN_1_SHIFT__1");
            if (minDay >= 510 && minDay <= 1010) { 
              if (dR && !dR.checked) dR.click(); 
            } else if (minDay >= 1230 || minDay <= 290) { 
              if (nR && !nR.checked) nR.click(); 
            }
          }

          var divisor = spm * prodFac * yieldFac * rmWgtGram;
          if (divisor > 0) {
            var loadGram = (pickCount > 0) ? (sumWeightKg * 1000) : (targetQty * rmWgtGram);
            var mins = Math.ceil(loadGram / divisor);

            uiUpdate("TLN_1_PLAN_MINUTES", mins, true);
            var nEnd = formatDMYHMS(new Date(sObj.getTime() + mins * 60000));
            uiUpdate("TLN_1_I_PLAN_FINISHED", nEnd, false);
            
            // Sync ข้อมูลไป Block 4
            uiUpdate("TLN_4_I_PLN_STR_DATE_0", sEl.value, false);
            uiUpdate("TLN_4_I_PLN_END_DATE_0", nEnd, false);
          }
        }
      }
    } catch (e) {
      console.error("❗ masterLoop Error:", e);
    }
  }

  // ดักจับเหตุการณ์
  document.addEventListener('change', function(e) {
    var id = e.target.id || "";
    if (id.indexOf('TLN_3_I_PICK_FLG_') > -1 || id === "TLN_1_I_PLAN_START" || id === "TLN_2_I_WO_QTY_0") {
      masterLoop("Manual Change: " + id);
    }
  });

  // รัน Interval เพื่อตรวจสอบความถูกต้อง (ปรับความถี่เป็น 2 วินาที)
  setInterval(masterLoop, 2000);
  masterLoop("Initial Run");

})();