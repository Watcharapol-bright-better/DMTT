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
        let isCreated = liElement.textContent.includes('Click close button to Create Work Order Plan Screen');
        console.log(isCreated);

        if(isCreated){
      		const btn = document.getElementById("TLN_1_Create Plan");
          if (btn) { btn.click(); }
        }
    }
}


var woWatcherStarted = false;

function watchWO() {

  const wo = document.getElementById("TLN_1_I_WO_CONFIRM");
  const btn = document.getElementById("TLN_1_confirm wo");

  if (!wo || !btn) return;

  const current = wo.value.trim();
  if (current === "") return;

  const lastWO = sessionStorage.getItem("AUTO_WO_LAST");

  // ถ้า WO เปลี่ยน
  if (current !== lastWO) {

    console.log("WO detected:", current);

    //cond.value = current;
    sessionStorage.setItem("AUTO_WO_LAST", current);

    btn.click();
  }
}

function startWOWatcher() {

  if (woWatcherStarted) return;
  woWatcherStarted = true;

  setInterval(function () {
    watchWO();
  }, 300);

}


function formatDatePattern(value) {

  console.log("before date", value);
  if (!value) return "";

  value = value.split(" ")[0];

  if (!value.includes("/")) return value;

  const p = value.split("/");
  if (p.length !== 3) return value;

  const month = parseInt(p[0], 10);
  const day   = parseInt(p[1], 10);
  const year  = parseInt(p[2], 10);

  if (isNaN(month) || isNaN(day) || isNaN(year)) return value;

  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(d);
}


function setGanttDate(value) {

  if (!value) return;

  const p = value.split("/");
  if (p.length !== 3) return;

  // หา order ของ locale เช่น ["month","day","year"] หรือ ["day","month","year"]
  const parts = new Intl.DateTimeFormat(navigator.language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).formatToParts(new Date());

  const order = parts
    .filter(part => part.type !== "literal")
    .map(part => part.type);

  let day, month, year;

  for (let i = 0; i < order.length; i++) {

    const v = parseInt(p[i], 10);
    if (isNaN(v)) return;

    if (order[i] === "day") day = v;
    if (order[i] === "month") month = v;
    if (order[i] === "year") year = v;
  }

  const yEl = document.getElementById("TLN_2_GANTT_YEAR_SELECT");
  const mEl = document.getElementById("TLN_2_GANTT_MONTH_SELECT");
  const dEl = document.getElementById("TLN_2_GANTT_DAY_SELECT");

  if (yEl) yEl.value = year;
  if (mEl) mEl.value = month;
  if (dEl) dEl.value = day;
}

function setupDate() { 
  
  let selectedDateSearch = document.getElementById("CNDTN_STD:0:_TEXT");
  let partIdSearch = document.getElementById("CNDTN_STD:1:_TEXT");
  let targetQtySearch = document.getElementById("CNDTN_STD:2:_TEXT");  

  if (selectedDateSearch.value == '') { 
    let gant_data = sessionStorage.getItem('TLN_GANTT_PARAM');
    if (gant_data) {
      console.log(gant_data);
      const data = JSON.parse(gant_data);
      
      let partId = data.partId;
      let picked = data.pickedLabel;
      let date = data.pickedDate;
      let qty = data.targetQty;
      
      selectedDateSearch.value = date;
      partIdSearch.value = partId;
      targetQtySearch.value = qty;
      
    } 
  }
  
}


function serializData() {

  const el = document.getElementById("CNDTN_STD:0:_TEXT");
  const selectedData = document.getElementById("TLN_1_I_DATE");

  let result = formatDatePattern(el.value);
  el.value = result;
  //selectedData.value = result;

  setGanttDate(result);
}


function resizeContents_end() { 
  
  startWOWatcher();
  setupDate();
  serializData();
  
}