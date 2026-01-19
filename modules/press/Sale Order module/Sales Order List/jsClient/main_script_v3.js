function getLvl1RowIds() {
  const lvl1Ids = Array.from(document.querySelectorAll('tr[id^="tbl0_row_"]'))
    .filter((tr) => {
      const level = tr.querySelector('input[name$="LEVEL"]'); // ตรวจสอบว่าลงท้าย LEVEL ไหม ถ้าไม่ก็เปลี่ยนเป็มตามที่แสดง
      return level && level.value === "0";
    })
    .map((tr) => tr.id);

  return lvl1Ids;
}

// Show detail rows
// 
function showDetailRows() {
  
  const lvl1Ids = getLvl1RowIds(); // lvl1Ids can be replaced

  lvl1Ids.forEach((id) => { // remove
    const headerRow = document.getElementById(id); // replace Id with lvl 1 element ID
    let row = headerRow.nextElementSibling;

    while (row) {
      const levelInput = row.querySelector('input[name$="LEVEL"]'); // ตรวจสอบว่าลงท้าย LEVEL ไหม ถ้าไม่ก็เปลี่ยนเป็มตามที่แสดง
      if (!levelInput) break;

      console.log(levelInput);
      if (levelInput.value === "1") break;

      if (levelInput.value === "2") {
        // เพิ่ม Logic ในนี้
        row document.getElementById('TLN_2_CHK_2__0'); // เปลี่ยนเป็น Select logic
        
      }

      row = row.nextElementSibling;
    }
  });

  // // Replace arrow Icon when row is expanded
  // document
  //   .querySelectorAll("span.switchDrlClose")
  //   .forEach((el) => el.classList.replace("switchDrlClose", "switchDrlOpen"));

  // // when hide switch value will be 1
  // document.getElementById("BASE:0:dataTbl_L:0:SWITCH").value = "1";
}

function resizeContents_end() {
  // Find all divs with class "listHeaderSingle" and align="right"
  document
    .querySelectorAll('div.listHeaderSingle[align="right"]')
    .forEach(function (div) {
      div.setAttribute("align", "center");
    });

  const _event = document.getElementById("EVENT_STATUS");
  const typeSearch = document.querySelector('select[name="CNDTN_TYPE_SEARCH"]');

  // Default value when search 2 = Summary, 1 = Detail
  if (_event.value == "TAISHOFUNCID") {
    typeSearch.value = "2";
  }

  if (typeSearch) {
    if (_event.value == "SEARCH") {
      if (typeSearch.value === "2") {
        // Option "Summary" selected
        hideDetailRows();
        console.log("Changed to Summary (value = 2)");
        // your logic here
      } else {
        // Option "Detail" selected
        showDetailRows();
        console.log("Changed to Detail (value = 1)");
        // your logic here
      }
    }
  }
}