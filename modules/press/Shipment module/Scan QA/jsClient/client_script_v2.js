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
  console.log("Adding row");    
  document.getElementById("TLN_1_Button_CALL_JAVASCRIPT").click();
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
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");

  if (!ship_id || !ship_mask || !pallet_tag || !sample_tag) {
    return;
  }

  watchInputFilled(ship_id, (v) => {
    //console.log("✅ ship_id:", v);
    scanningBox();
  });

  watchInputFilled(ship_mask, (v) => {
    //console.log("✅ ship_mask:", v);
    scanningBox();
  });

  watchInputFilled(pallet_tag, (v) => {
    //console.log("✅ pallet_tag:", v);
    scanningBox();
  });

  watchInputFilled(sample_tag, (v) => {
    //console.log("✅ sample_tag:", v);
    scanningBox();
  });
}

function scanningBox() {
  // ป้องกันการรันซ้ำ
  if (isProcessing) {
    //console.log("⚠️ Already processing, skipping...");
    return;
  }

  const ship_id = document.getElementById("TLN_1_I_SHIP_INST");
  const ship_mask = document.getElementById("TLN_1_I_PALLET_NO");
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");

  if (!ship_id || !ship_mask || !pallet_tag || !sample_tag) return;

  const has_ship_id = ship_id.value.trim() !== "";
  const has_ship_mask = ship_mask.value.trim() !== "";
  const has_pallet_tag = pallet_tag.value.trim() !== "";
  const has_sample_tag = sample_tag.value.trim() !== "";

  if (!has_pallet_tag) {
    return;
  }

  if (!has_ship_id || !has_ship_mask) {
    return;
  }

  // flag ว่ากำลังทำงาน
  isProcessing = true;
  // console.log("🔒 Processing started");

  setTimeout(() => {
    const pallet_row = document.querySelectorAll("input[id^='TLN_2_I_PALLET_NO_']");
    if (!pallet_row.length) {
      isProcessing = false; // ปลดล็อค
      return;
    }

    const last_index = pallet_row.length - 1;

    const target_mask = document.getElementById("TLN_2_I_PALLET_NO_" + last_index);
    const target_plt = document.getElementById("TLN_2_I_PLTNO_" + last_index);
    const target_ship = document.getElementById("TLN_2_I_SHIP_INST_" + last_index);
    const target_sample = document.getElementById("TLN_2_SAMPLE_LABEL_TAG_" + last_index);

    if (!target_mask || !target_plt) {
      isProcessing = false; // ปลดล็อค
      return;
    }

    target_ship.value = ship_id.value;
    target_mask.value = ship_mask.value;
    target_plt.value = pallet_tag.value;
    target_sample.value = sample_tag.value;

    addRow();

    ship_id.value = "";
    ship_mask.value = "";
    pallet_tag.value = "";
    sample_tag.value = "";

    setTimeout(() => {
      isProcessing = false;
      //console.log("🔓 Processing completed");
    }, 1000); 

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
    if (btn) {
      td.style.display = "none";
    }
  });
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

function resizeContents_end() {
  document
    .querySelectorAll(".blockSubHeader")
    .forEach((el) => (el.style.display = "none"));
  hiddenField();
  updateBoxHeight();
  bindScanEvents();
}