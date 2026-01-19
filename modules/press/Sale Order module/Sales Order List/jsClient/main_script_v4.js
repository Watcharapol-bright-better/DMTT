function getSelectedSO() {
  var i = 0;
  var selectedNm = "2_CHK_";
  var SONo = "2_I_SONO_";
//   var poline = "2_PO_LINE_";

  var SOCol = "";
//   var poCol = "";
  var searchBtn = getButtonElement("BUTTON_MDL_R:1:POS_SEARCH_BTN");
  while (true) {
    var sel = getElementByName(selectedNm + i); //get element select checkbox
    var SOInput = getElementByName(SONo + i);
    // var polineInput = getElementByName(poline + i);

    if (!sel || !SOInput ) break; // End loop if element not found

    console.log(sel);
      if (sel.checked == true) {
        //check if checkbox is checked
        SOCol += SOInput.value;
        SOCol += ",";
        // poCol += polineInput.value;
        // poCol += ",";
      }
      i++;
  }

  if (SOCol.endsWith(",")) {
    SOCol = SOCol.slice(0, -1);
  }
//   if (poCol.endsWith(",")) {
//     poCol = poCol.slice(0, -1);
//   }

  var SOInputField = document.getElementsByName("CNDTN_SELECTED")[0];
  if (SOInputField) SOInputField.value = SOCol;
//   var polineInputField = document.getElementsByName("CNDTN_SELECTED_PO")[0];
//   if (polineInputField) polineInputField.value = poCol;

  //console.log("Button:", getButtonElement("BUTTON_MDL_R:1:POS_SEARCH_BTN"));
  searchBtn.click(); //call button
  return SOCol;
}

function resizeContents_end() {
  var chkList = document.getElementsByClassName("selectionTableRow");

  for (i = 0; i < chkList.length; i++) {
    chkList[i].addEventListener("change", getSelectedSO);
    // console.log("Test check sel" + i);
  }
  var eventStatus   = document.getElementById("EVENT_STATUS");
  if(eventStatus.value != "SEARCH"){
      //handleCommonError();
  }
  //
}