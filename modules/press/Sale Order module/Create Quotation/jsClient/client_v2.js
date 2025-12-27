

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        
       let obj = document.getElementById('JKN_AREA');
        if (obj) obj.style.display = 'none';

    }, 200);
});

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


 function setRowNumbers(selectorPrefix) {
    const rowNoBoxes = document.querySelectorAll(`input[id^="${selectorPrefix}"]`);
    if (rowNoBoxes.length > 0) {
        let rowIndex = 1;
        rowNoBoxes.forEach((input) => {
            if (!input.value.trim()) {
                    input.value = rowIndex.toString();
            }
            rowIndex++;
        });
    }
}



function resizeContents_end() {

    let obj = document.getElementById('JKN_AREA');
    if (obj) obj.style.display = 'none';
    updateBoxHeight();
    setRowNumbers("TLN_2_I_QT_LN_");

    // set id to box header
    let valFrom = document.getElementById('TLN_2_I_QT_NO_0').value;
    document.getElementsByName('1_I_QT_NO')[0].value = valFrom;

}
