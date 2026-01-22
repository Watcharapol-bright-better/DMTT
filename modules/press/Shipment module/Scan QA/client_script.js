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


/*function createScanButton() {
  var margin = 40;
  var screenHeight = window.innerHeight - margin * 2;
  var screenWidth = window.innerWidth - margin * 2;

  var minHeight = 200;
  var minWidth = 300;
  var maxHeight;
  var maxWidth;

  if (screenWidth <= 768) {
    // Mobile/tablet 
    maxHeight = screenHeight * 0.9;
    maxWidth = screenWidth * 0.9;
  } else {
    // Desktop 
    maxHeight = 500;
    maxWidth = 800;
  }

  var finalHeight = Math.max(Math.min(screenHeight, maxHeight), minHeight);
  var finalWidth = Math.max(Math.min(screenWidth, maxWidth), minWidth);

  setScanButton("SCAN", "CNDTN_I_SHIP_INST", 'QR',finalHeight, finalWidth);
}
*/

function createScanButton() {
  setScanButton("Scan","CNDTN_I_SHIP_INST","QR",640,480);
  setScanButton("Scan", "CNDTN_I_PALLET_NO", "QR", 1600, 1200);
  setScanButton("Scan","CNDTN_I_PLTNO","QR",640,480);
}

function addLine() { document.getElementById('TLN_2_ADDLINE_BTN').click() }


function resizeContents_end() {
  
  let addLine = document.getElementById('EVENT_STATUS').value
  if (addLine === 'JAVASCRIPT_BTN') { 
    addLine();
  } 

  document.querySelectorAll('.blockSubHeader').forEach(el => el.style.display = 'none');
  updateBoxHeight();

}
