let isProcessing = false;

const searchLock = {
  ship_id: false,
  ship_mask: false,
  sample_tag: false,
  pallet_tag: false
};


function createScanButton() {
  setScanButton("Scan", "1_I_SHIP_INST", "QR", 640, 480);
  setScanButton("Scan", "1_I_PALLET_NO", "QR", 640, 480);
  setScanButton("Scan", "1_SAMPLE_LABEL_TAG", "QR", 640, 480);
  setScanButton("Scan", "1_I_PLTNO", "QR", 640, 480);
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
  if (el.type === "checkbox") return el.checked === true;
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


function watchInputFilled(el, key, nextEl) {
  if (!el) return;

  let prev = el.value.trim();

  const handler = () => {
    const cur = el.value.trim();

    /* เข้าจริงครั้งแรกเท่านั้น */
    if (prev === "" && cur !== "") {

      if (!searchLock[key]) {
        searchLock[key] = true;
        search();
      }

      if (nextEl) focusNext(nextEl);
      scanningBox();
    }

    prev = cur;
  };

  el.addEventListener("input", handler);
  el.addEventListener("change", handler);
}


function bindScanEvents() {
  const ship_id    = document.getElementById("TLN_1_I_SHIP_INST");
  const ship_mask  = document.getElementById("TLN_1_I_PALLET_NO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");

  if (!ship_id || !ship_mask || !sample_tag || !pallet_tag) return;

  setTimeout(focusFirstEmpty, 0);

  watchInputFilled(ship_id, "ship_id", ship_mask);
  watchInputFilled(ship_mask, "ship_mask", sample_tag);
  watchInputFilled(sample_tag, "sample_tag", pallet_tag);
  watchInputFilled(pallet_tag, "pallet_tag", null);
}

function scanningBox() {
  if (isProcessing) return;
  if (!isActive()) return;

  const ship_id    = document.getElementById("TLN_1_I_SHIP_INST");
  const ship_mask  = document.getElementById("TLN_1_I_PALLET_NO");
  const sample_tag = document.getElementById("TLN_1_SAMPLE_LABEL_TAG");
  const pallet_tag = document.getElementById("TLN_1_I_PLTNO");

  if (!ship_id || !ship_mask || !sample_tag || !pallet_tag) return;
  if (!pallet_tag.value.trim()) return;
  if (!ship_id.value.trim() || !ship_mask.value.trim()) return;

  isProcessing = true;

  setTimeout(() => {
    const rows = document.querySelectorAll("input[id^='TLN_2_I_PALLET_NO_']");
    if (!rows.length) {
      isProcessing = false;
      return;
    }

    const i = rows.length - 1;

    document.getElementById("TLN_2_I_SHIP_INST_" + i).value = ship_id.value;
    document.getElementById("TLN_2_I_PALLET_NO_" + i).value = ship_mask.value;
    document.getElementById("TLN_2_SAMPLE_LABEL_TAG_" + i).value = sample_tag.value;
    document.getElementById("TLN_2_I_PLTNO_" + i).value = pallet_tag.value;

    addRow();

    ship_id.value = "";
    ship_mask.value = "";
    sample_tag.value = "";
    pallet_tag.value = "";

    Object.keys(searchLock).forEach(k => searchLock[k] = false);

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
}
