

/// Client site script
function onCheckboxClick(chk, blockNo, isLvl, pkey, skey) {
    SelectChk.click(chk, blockNo, isLvl, pkey, skey);
}

function resizeContents_end() {
    Array.from(document.getElementsByClassName("selectionTableRow"))
        .forEach(chk => chk.addEventListener("change", onCheckboxClick));

    document.getElementById('BUTTON_TOP_R:0:_NEXT_BTN').style.display = 'none';    
    if (document.getElementById('EVENT_STATUS').value === 'JAVASCRIPT_BTN') {
        SelectChk.clear();
    }
}
