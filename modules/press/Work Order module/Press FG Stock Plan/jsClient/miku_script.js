(function () {
  // =========================
  // 1. CONFIGURATION
  // =========================
  var BTN_ID        = "BUTTON_TOP_R:0:_NEXT_BTN";
  var SS_KEY        = "TLN_GANTT_PARAM";
  var DATE_INPUT_ID = "CNDTN_STD:1:_TEXT"; 

  function trim(s){ return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }
  function pad2(n){ n=String(n); return (n.length<2)?("0"+n):n; }

  // =========================
  // 2. FINDING ELEMENTS
  // =========================
  function findTD(el){
    var td = el;
    for (var i=0; i<12 && td; i++){
      if (td.tagName && td.tagName.toUpperCase()==="TD") return td;
      td = td.parentElement;
    }
    return null;
  }

  function findTR(el){
    var tr = el;
    for (var i=0; i<12 && tr; i++){
      if (tr.tagName && tr.tagName.toUpperCase()==="TR") return tr;
      tr = tr.parentElement;
    }
    return null;
  }

  // เช็คว่าเป็นแถว Difference หรือไม่ (ดูจาก Title ของป้ายชื่อแถว)
  function isDiffRow(tr) {
    if (!tr) return false;
    var diffTitle = "Difference (FG Stock - Safety Stock)";
    var diffEl = tr.querySelector('[title*="' + diffTitle + '"]');
    if (diffEl) return true;

    // กรณีตาราง Freeze Left: หาโดยใช้ตำแหน่ง Y เทียบกับป้ายชื่อในตารางซ้าย
    var rect = tr.getBoundingClientRect();
    var y = rect.top + rect.height / 2;
    var allLabels = document.querySelectorAll('[title*="' + diffTitle + '"]');
    for (var i = 0; i < allLabels.length; i++) {
      var r = allLabels[i].getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) return true;
    }
    return false;
  }

  // ✅ หา Part ID โดยเจาะจงที่ ID Pattern: TLN_1_I_ITEMCODE_
  function findPartIdSmart(td) {
    var tr = findTR(td);
    if (!tr) return "";

    // ลำดับการหา: 1. หาในแถวเดียวกันก่อน
    var itemEl = tr.querySelector('[id^="TLN_1_I_ITEMCODE_"]');
    
    // 2. ถ้าไม่เจอในแถวตัวเอง (ตารางแยก) ให้หาด้วยตำแหน่ง Y (แนวราบเดียวกัน)
    if (!itemEl) {
      var rect = td.getBoundingClientRect();
      var y = rect.top + rect.height / 2;
      var allItemCodes = document.querySelectorAll('[id^="TLN_1_I_ITEMCODE_"]');
      for (var i = 0; i < allItemCodes.length; i++) {
        var r = allItemCodes[i].getBoundingClientRect();
        if (y >= r.top && y <= r.bottom) {
          itemEl = allItemCodes[i];
          break;
        }
      }
    }

    if (itemEl) {
      return trim(itemEl.getAttribute("data-save-value") || itemEl.getAttribute("title") || itemEl.innerText);
    }
    return "";
  }

  // =========================
  // 3. DATE LOGIC (Year 2026)
  // =========================
  function getBasisDate(){
    var inp = document.getElementById(DATE_INPUT_ID);
    if (!inp) return new Date(); 
    return new Date(inp.value);
  }

  function parseHeaderDDMMM_toDate(headerText, basisDate){
    var m = String(headerText||"").match(/^(\d{1,2})\s*-\s*([A-Za-z]{3})$/);
    if (!m) return null;
    var dd = parseInt(m[1],10);
    var mi = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11}[m[2].toLowerCase()];
    
    var yy = basisDate.getFullYear();
    // จัดการการข้ามปี (Rollover)
    if (basisDate.getMonth() >= 10 && mi <= 1) yy++; 
    if (basisDate.getMonth() <= 1 && mi >= 10) yy--; 
    
    return new Date(yy, mi, dd);
  }

  /*function formatDDMMYYYY(d){
    return pad2(d.getDate())+"/"+pad2(d.getMonth()+1)+"/"+d.getFullYear();
    }*/
  
  var formatDate = (date) => {
        return new Intl.DateTimeFormat(navigator.language, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
  };
  
  // ✅ ดึงหัวคอลัมน์ (Date) จากแกน X
  function getHeaderTextByX(td){
    var r = td.getBoundingClientRect();
    var x = r.left + (r.width / 2);
    var headers = document.querySelectorAll('div.listTitleDiv.listHeaderSingle[title]');
    for (var i=0; i<headers.length; i++){
      var hr = headers[i].getBoundingClientRect();
      if (x >= hr.left && x <= hr.right) return trim(headers[i].getAttribute("title") || "");
    }
    return "";
  }

  // ล้างตัวเลข (เอาเครื่องหมายลบและคอมมาออก)
  function cleanQty(s){
    return trim(s).replace(/,/g, "").replace(/^-/, "").replace(/^\(|\)$/g, "");
  }

  // =========================
  // 4. MAIN EVENT
  // =========================
  document.addEventListener("click", function (ev) {
    var td = findTD(ev.target);
    var tr = findTR(ev.target);
    if (!td || !tr) return;

    // 1. ตรวจสอบเงื่อนไขแถว Difference
    if (!isDiffRow(tr)) return;

    // 2. ตรวจสอบว่ามีตัวเลขหรือไม่ (ข้ามช่องว่าง/เลข 0)
    var rawText = trim(td.textContent || td.innerText || "");
    if (rawText === "" || rawText === "0" || rawText === "0.00") return;

    // หยุดการทำงานของปุ่มเดิมเพื่อทำ Logic เราก่อน
    ev.preventDefault();
    ev.stopPropagation();

    var basis = getBasisDate();
    var headerText = getHeaderTextByX(td); 
    if (!headerText) return;

    var pickedObj = parseHeaderDDMMM_toDate(headerText, basis);
    if (!pickedObj) return;

    var pickedDate = formatDate(pickedObj);
    var partId  = findPartIdSmart(td);
    var qtyText = cleanQty(rawText);

    // เก็บค่าลง SessionStorage เพื่อให้หน้าถัดไปดึงไปใช้
    sessionStorage.setItem(SS_KEY, JSON.stringify({
      partId: partId,
      targetQty: qtyText,
      pickedDate: pickedDate,
      pickedLabel: headerText
    }));

    // คลิกปุ่ม NEXT
    var btn = document.getElementById(BTN_ID);
    if (btn) {
        btn.click();
    } else {
        console.warn("NEXT button not found:", BTN_ID);
    }

  }, true);
})();