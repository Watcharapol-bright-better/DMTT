
function onCloseMassageDialog() {
    var btn = getElementByName("BUTTON_TOP_R:0:_NEXT_BTN")
    var errorStatus = document.getElementById("PROC_STATUS_ERROR");
    var _event  = document.getElementById("EVENT_STATUS");
    console.log(_event.value)
    console.log(errorStatus.value)

   // CLOSED_MESSAGE_DIALOG
    if (errorStatus.value == '0' && _event.value == 'CLOSED_MESSAGE_DIALOG') {

        //var btn = getButtonElement('List')

        var liElement = document.querySelector("#error_list > ul > li:nth-child(1)");

        var computedStyle = window.getComputedStyle(liElement);
        var textColor = computedStyle.color;

        //console.log(textColor); 
        //console.log(liElement);
        let isCreated = liElement.textContent.includes('Created WO Successfully');
        console.log(isCreated);

        if(isCreated){
     			var nextBtn = getButtonElement('BUTTON_TOP_R:0:_NEXT_BTN');
     			 nextBtn.click();
        }
    }
}

// --- Functions ---
function toNum(v) {
  if (!v) return 0;
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

function safeUpdate(id, val, useComma) {
  var el = document.getElementById(id);
  if (!el) return;
  
  var formattedVal = useComma ? toComma(val) : String(val);
  var currentVal = (el.tagName === "SPAN" || el.tagName === "DIV") ? el.textContent : el.value;
  
  if (String(currentVal).replace(/,/g, "") !== String(formattedVal).replace(/,/g, "")) {
    if (el.tagName === "SPAN" || el.tagName === "DIV") {
      el.textContent = formattedVal;
    } else {
      el.value = formattedVal;
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// --- Main Calculation Logic ---
function runCalculation() {
  try {
    var rmWgtGram = toNum(document.getElementById("TLN_2_I_RM_WGT_0").value);
    var spm = toNum(document.getElementById("TLN_2_I_SPM_0").value);
    var yieldFac = toNum(document.getElementById("TLN_2_I_YIELD_0").value);
    var prodFac = toNum(document.getElementById("TLN_2_I_PROD_RATE_0").value);
    var targetQtyIn = document.getElementById("TLN_2_I_WO_QTY_0");
    var targetQty = toNum(targetQtyIn.value);
    
    let store = sessionStorage.getItem("TLN_GANTT_PARAM");

    var pickCount = 0;
    var sumWeightKg = 0;
    
    var cbs = document.querySelectorAll('input[type="checkbox"][id^="TLN_3_I_PICK_FLG_"]:checked');
    pickCount = cbs.length;

    for (var i = 0; i < cbs.length; i++) {
      var idMatch = cbs[i].id.match(/I_PICK_FLG_(\d+)/);
      if (idMatch) {
        var rowIndex = idMatch[1];
        var wEl = document.getElementById("TLN_3_I_CUR_WGT_" + rowIndex);
        if (wEl) sumWeightKg += toNum(wEl.value || wEl.textContent);
      }
    }

    // 1. อัปเดต Qty
    safeUpdate("TLN_2_I_REQ_COIL_0", pickCount, false);
    var actualQty = (pickCount > 0 && rmWgtGram > 0) ? Math.floor((sumWeightKg * 1000) / rmWgtGram) : 0;
    safeUpdate("TLN_2_I_ACTUAL_QTY_0", actualQty, true);

    // 2. เวลา, Shift และ แปะค่าลง Block 4
    var sEl = document.getElementById("TLN_1_I_PLAN_START");
    if (sEl && sEl.value) {
      var sObj = parseDMY(sEl.value);
      if (sObj) {
        // --- Auto Judge Shift (นำกลับมาใส่ตรงนี้) ---
        var mTime = sEl.value.match(/(\d{1,2}):(\d{2})/);
        if (mTime) {
          var minDay = parseInt(mTime[1]) * 60 + parseInt(mTime[2]);
          var dR = document.getElementById("TLN_1_SHIFT__0"); 
          var nR = document.getElementById("TLN_1_SHIFT__1");
          // Day Shift: 08:30 (510) - 16:50 (1010)
          if (minDay >= 510 && minDay <= 1010) { 
            if (dR && !dR.checked) dR.click(); 
          }
          // Night Shift: 20:30 (1230) - 04:50 (290)
          else if (minDay >= 1230 || minDay <= 290) { 
            if (nR && !nR.checked) nR.click(); 
          }
        }

        var divisor = spm * prodFac * yieldFac * rmWgtGram;
        if (divisor > 0) {
          var loadGram = (pickCount > 0) ? (sumWeightKg * 1000) : (targetQty * rmWgtGram);
          var mins = Math.ceil(loadGram / divisor);
          var nEnd = formatDMYHMS(new Date(sObj.getTime() + mins * 60000));
          
          safeUpdate("TLN_1_PLAN_MINUTES", mins, true);
          safeUpdate("TLN_1_I_PLAN_FINISHED", nEnd, false);
          safeUpdate("TLN_4_I_PLN_STR_DATE_0", sEl.value, false);
          safeUpdate("TLN_4_I_PLN_END_DATE_0", nEnd, false);
        }
      }
    }
  } catch (e) { console.log("Calc Error:", e); }
}

// --- Session Handler ---
function handleSession() {
  var sessionData = sessionStorage.getItem("TLN_GANTT_PARAM");
  if (!sessionData) return;
  var d = JSON.parse(sessionData);
  var targetQtyIn = document.getElementById("TLN_2_I_WO_QTY_0");
  if (d.targetQty && targetQtyIn) {
    safeUpdate("TLN_2_I_WO_QTY_0", Math.ceil(d.targetQty), true);
    if (toNum(targetQtyIn.value) > 0) {
      sessionStorage.setItem("TLN_GANTT_PARAM", JSON.stringify({targetQty: null}));
      runCalculation();
    }
  }
}

// --- Event Listeners ---
document.addEventListener('change', function(e) {
  if (e.target && e.target.id) {
    if (e.target.id.indexOf("TLN_3_I_PICK_FLG_") !== -1 || 
        e.target.id === "TLN_1_I_PLAN_START" || 
        e.target.id === "TLN_2_I_WO_QTY_0") {
      runCalculation();
    }
  }
});

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
  handleSession();
  runCalculation();
  updateBoxHeight();
}


