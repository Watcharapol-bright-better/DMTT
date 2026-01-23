function createScanButton() {
  setScanButton("Scan", "1_I_SHIP_INST", "QR", 640, 480);
  setScanButton("Scan", "1_I_PALLET_NO", "QR", 640, 480);
  setScanButton("Scan", "1_I_PLTNO", "QR", 640, 480);
  setScanButton("Scan", "1_SAMPLE_LABEL_TAG", "QR", 640, 480);
}

function addLine() {
  document.getElementById("TLN_2_ADDLINE_BTN").click();
}

function button() {
  document.getElementById("TLN_1_Button_CALL_JAVASCRIPT").click();
}

function updateBoxHeight() {
  function removeHeight(id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.removeProperty("height");
    }
  }

  removeHeight("BASE:0:block");

  const baseCard = document.getElementById("BASE:0:CARD");
  if (baseCard) {
    baseCard.setAttribute("style", "overflow: auto;");
  }

  for (let i = 1; i <= 2; i++) {
    removeHeight(`box${i}`);
    removeHeight(`BASE:${i}:block`);
    removeHeight(`tbl_scrollable_body_L_${i}`);
  }
}

function scanningBox() {
  let has_ship_id = false;
  let has_ship_mask = false;
  let has_pallet_tag = false;
  let has_sample_tag = false;
  
  let ship_id = document.getElementById("TLN_1_I_SHIP_INST");
  let ship_mask = document.getElementById("TLN_1_I_PALLET_NO");
  let pallet_tag = document.getElementById("TLN_1_I_PLTNO");
  let sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");
  
  
  if (!ship_id || !ship_mask || !pallet_tag || !sample_tag) {
    console.log("Scanning Box: not ready");
    return;
  }
  
  let pallet_row = document.querySelectorAll("input[id^='TLN_2_I_PALLET_NO_']");

  if (!pallet_row || pallet_row.length === 0) {
    return;
  }

  if (ship_id.value.trim() !== "") {
    console.log("Shipment ID:", ship_id.value);
    has_ship_id = true;
  }

  if (ship_mask.value.trim() !== "") {
    console.log("Ship Mask:", ship_mask.value);
    has_ship_mask = true;
  }

  if (pallet_tag.value.trim() !== "") {
    console.log("Pallet Tag:", pallet_tag.value);
    has_pallet_tag = true;
  }

  if (sample_tag.value.trim() !== "") {
    console.log("Sample Tag:", sample_tag.value);
    has_sample_tag = true;
  }

  let last_index = pallet_row.length - 1;

  let target_pallet_input = document.getElementById("TLN_2_I_PALLET_NO_" + last_index);
  let target_plt_input = document.getElementById("TLN_2_I_PLTNO_" + last_index);

  if (target_pallet_input && has_ship_id) {
    target_pallet_input.value = ship_id.value;
    target_plt_input.value = ship_mask.value;
  }

  if (has_pallet_tag === true) {
    console.log("has pallet tag: " + has_pallet_tag);
    button();
  }

  // reset ค่า
  ship_id.value = "";
  ship_mask.value = "";
  pallet_tag.value = "";
  sample_tag.value = "";
}


function resizeContents_end() {
  document
    .querySelectorAll(".blockSubHeader")
    .forEach((el) => (el.style.display = "none"));
  updateBoxHeight();

  scanningBox();
}
