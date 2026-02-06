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

function search() {
  document.getElementById("TLN_1_Search_CALL_JAVASCRIPT").click();
}


function isActive() {
  const el = document.getElementById("TLN_1_Active");
  if (!el) return false;
  return String(el.value).trim() === "1";
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

  let prev = el.value.trim();

  const handler = () => {
    const cur = el.value.trim();
    if (prev === "" && cur !== "") {
      search();
      callback();
    }
    prev = cur;
  };

  el.addEventListener("input", handler);
  el.addEventListener("change", handler);
}


function watchActiveField() {
  const el = document.getElementById("TLN_1_Active");
  if (!el) return;

  const fire = () => scanningBox();

  el.addEventListener("input", fire);
  el.addEventListener("change", fire);
}


function bindScanEvents() {
  const ship_id    = document.getElementById("TLN_1_I_SHIP_INST");
  const ship_mask  = document.getElementById("TLN_1_I_PALLET_NO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");

  if (!ship_id || !ship_mask || !sample_tag || !pallet_tag) return;

  //setTimeout(focusFirstEmpty, 0);
  setTimeout(() => focusFirstEmpty(), 0);

  watchInputFilled(ship_id, () => {
    focusNext(ship_mask);
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

  watchInputFilled(pallet_tag, scanningBox);
}


function scanningBox() {
  if (isProcessing) return;
  //if (!isActive()) return;

  const ship_id = document.getElementById("TLN_1_I_SHIP_INST");
  const ship_mask = document.getElementById("TLN_1_I_PALLET_NO");
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");

  if (!ship_id || !ship_mask || !pallet_tag || !sample_tag) return;
  if (!pallet_tag.value.trim()) return;
  if (!ship_id.value.trim() || !ship_mask.value.trim()) return;

  isProcessing = true;

  setTimeout(() => {
    const rows = document.querySelectorAll("input[id^='TLN_2_I_PALLET_NO_']");
    if (!rows.length) {
      isProcessing = false;
      return;
    }

    const last_index = rows.length - 1;
    console.log(`row : ${last_index}`);

    document.getElementById("TLN_2_I_SHIP_INST_" + last_index).value       = ship_id.value;
    document.getElementById("TLN_2_I_PALLET_NO_" + last_index).value       = ship_mask.value;
    document.getElementById("TLN_2_I_PLTNO_" + last_index).value           = pallet_tag.value;
    document.getElementById("TLN_2_SAMPLE_LABEL_TAG_" + last_index).value  = sample_tag.value;

    addRow();

    ship_id.value = "";
    ship_mask.value = "";
    sample_tag.value = "";
    pallet_tag.value = "";

    setTimeout(() => {
      isProcessing = false;
      focusFirstEmpty();
    }, 300);
  }, 300);
}


function hiddenField() {
  document
    .querySelectorAll(".button.CALL_JAVASCRIPT_BTN,.Search.CALL_JAVASCRIPT_BTN")
    .forEach(el => el.style.display = "none");

  document.querySelectorAll("td.tbody.card").forEach(td => {
    if (td.querySelector(".CALL_JAVASCRIPT_BTN")) td.style.display = "none";
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
  document.querySelectorAll(".blockSubHeader").forEach(el => el.style.display = "none");
  hiddenField();
  updateBoxHeight();
  bindScanEvents();
  watchActiveField();
}
