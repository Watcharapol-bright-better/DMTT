
let isProcessing = false; 

function createScanButton() {
  setScanButton("Scan", "1_I_SHIP_INST", "QR", 640, 480);
  setScanButton("Scan", "1_I_PALLET_NO", "QR", 640, 480);
  setScanButton("Scan", "1_I_PLTNO", "QR", 640, 480);
  setScanButton("Scan", "1_SAMPLE_LABEL_TAG", "QR", 640, 480);
}

function addLine() {
  document.getElementById("TLN_2_ADDLINE_BTN").click();
}

function addRow() {
  document.getElementById("TLN_1_Button_CALL_JAVASCRIPT").click();
}

function onClickSearch() {
  setTimeout(() => {
    console.log("Search button clicked...");
   document.getElementById("BUTTON_MDL_R:1:POS_SEARCH_BTN").click();
  }, 100);
}


function focusNext(el) {
  if (!el) return;
  el.setAttribute("readonly", "readonly");
  el.focus({ preventScroll: true });
  setTimeout(() => el.removeAttribute("readonly"), 50);
}

function focusFirstEmpty() {
  const order = [
    document.getElementById("TLN_1_I_SHIP_INST"),
    document.getElementById("TLN_1_I_PALLET_NO"),
    document.getElementById("TLN_1_SAMPLE_LABEL_TAG"),
    document.getElementById("TLN_1_I_PLTNO")
  ];

  for (const el of order) {
    if (el && el.value.trim() === "") {
      focusNext(el);
      break;
    }
  }
}

function watchInputFilled(el, callback) {
  if (!el) return;
  let prevValue = "";

  const handler = () => {
    const current = el.value.trim();
    if (prevValue === "" && current !== "") {
      callback(current);
    }
    prevValue = current;
  };
  el.addEventListener("input", handler);
  el.addEventListener("change", handler);
}

function bindScanEvents() {
  const ship_id = document.getElementById("TLN_1_I_SHIP_INST");
  const ship_mask = document.getElementById("TLN_1_I_PALLET_NO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");

  if (!ship_id || !ship_mask || !sample_tag || !pallet_tag) return;

  setTimeout(() => focusFirstEmpty(), 0);

  watchInputFilled(ship_id, () => {
    focusNext(ship_mask);
    onClickSearch();
    scanningBox();
  });

  watchInputFilled(ship_mask, () => {
    focusNext(sample_tag);
    scanningBox();
  });

  watchInputFilled(sample_tag, () => {
    focusNext(pallet_tag);
    scanningBox();
  });

  watchInputFilled(pallet_tag, () => {
    scanningBox();
  });
  
}

function scanningBox() {
  if (isProcessing) return;

  const ship_id = document.getElementById("TLN_1_I_SHIP_INST");
  const ship_mask = document.getElementById("TLN_1_I_PALLET_NO");
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");

  if (!ship_id || !ship_mask || !pallet_tag || !sample_tag) return;

  const has_ship_id = ship_id.value.trim() !== "";
  const has_ship_mask = ship_mask.value.trim() !== "";
  const has_pallet_tag = pallet_tag.value.trim() !== "";
  const has_sample_tag = sample_tag.value.trim() !== "";

  if (!has_pallet_tag) return;
  if (!has_ship_id || !has_ship_mask) return;

  
  
  isProcessing = true;

  setTimeout(() => {
    const pallet_row = document.querySelectorAll("input[id^='TLN_2_I_PALLET_NO_']");
    if (!pallet_row.length) {
      isProcessing = false;
      return;
    }

    const last_index = pallet_row.length - 1;

    const target_mask = document.getElementById("TLN_2_I_PALLET_NO_" + last_index);
    const target_plt = document.getElementById("TLN_2_I_PLTNO_" + last_index);
    const target_ship = document.getElementById("TLN_2_I_SHIP_INST_" + last_index);
    const target_sample = document.getElementById("TLN_2_SAMPLE_LABEL_TAG_" + last_index);

    if (!target_mask || !target_plt) {
      isProcessing = false;
      return;
    }

    target_ship.value = ship_id.value;
    target_mask.value = ship_mask.value;
    target_plt.value = pallet_tag.value;
    target_sample.value = sample_tag.value;

    addRow();

    //ship_id.value = "";
    ship_mask.value = "";
    sample_tag.value = "";
    pallet_tag.value = "";

    setTimeout(() => {
      isProcessing = false;
      focusFirstEmpty();
    }, 500);
  }, 500);
}

function hiddenField() { 
  document.querySelectorAll(".button.CALL_JAVASCRIPT_BTN").forEach((el) => {
    el.style.visibility = "hidden";
    el.style.border = "none";
    el.style.outline = "none";
    el.style.boxShadow = "none";
    el.style.background = "transparent";
  });

  document.querySelectorAll("td.tbody.card").forEach((td) => {
    const btn = td.querySelector(".button.CALL_JAVASCRIPT_BTN");
    if (btn) td.style.display = "none";
  });
}

function updateBoxHeight() {
  function removeHeight(id) {
    const el = document.getElementById(id);
    if (el) el.style.removeProperty("height");
  }

  removeHeight("BASE:0:block");

  const baseCard = document.getElementById("BASE:0:CARD");
  if (baseCard) baseCard.setAttribute("style", "overflow: auto;");

  for (let i = 1; i <= 2; i++) {
    removeHeight(`box${i}`);
    removeHeight(`BASE:${i}:block`);
    removeHeight(`tbl_scrollable_body_L_${i}`);
  }
}



function resizeContents_end() {
  document.querySelectorAll(".blockSubHeader").forEach((el) => {
    el.style.display = "none";
  });
  
  let _event = document.getElementById("EVENT_STATUS");
  let shipInput = document.getElementById("TLN_1_I_SHIP_INST");
  if(_event.value == 'NEXT_FUNC') {
    focusNext(shipInput);
  }

  console.log(`current event : ${_event.value}`);

  if(_event.value == 'SEARCH' || _event.value == 'UPDATE') {
    document.getElementById('TLN_1_I_SHIP_INST').value = getElementByName('CNDTN_I_SHIP_INST').value
  }


  hiddenField();
  updateBoxHeight();
  bindScanEvents();
}



