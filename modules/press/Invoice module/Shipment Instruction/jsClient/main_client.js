
 function updateBoxHeight() {
    function removeHeight(id) {
       const el = document.getElementById(id);
       if (el) {
          el.style.removeProperty("height");
       }
    }

    // Box Card 0
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



function applyButtonStyle() {
   // document.getElementsByName('BUTTON_MDL_R:1:POS_SEARCH_BTN')[0].style.display = 'none'
    const btn = document.getElementById("TLN_1_b_CALL_JAVASCRIPT");
    if (!btn) return;

    btn.style.backgroundColor = "#335BA6";
    btn.style.color = "#ffffff";
    btn.style.borderRadius = "4px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.transition = "all 0.15s ease";

    // Hover
    btn.onmouseenter = function () {
        btn.style.backgroundColor = "#5e8bd1";
        btn.style.transform = "scale(1)";
    };

    btn.onmouseleave = function () {
        btn.style.backgroundColor = "#335BA6";
        btn.style.transform = "scale(1)";
    };

    btn.onmousedown = function () {
        btn.style.transform = "scale(0.95)";
    };

    btn.onmouseup = function () {
        btn.style.transform = "scale(1)";
    };

    btn.onmouseout = function () {
        btn.style.transform = "scale(1)";
    };

    document.getElementsByName('BUTTON_MDL_R:1:POS_SEARCH_BTN')[0];
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(applyButtonStyle, 200);
});





function resizeContents_end() {
    applyButtonStyle();
    updateBoxHeight();

    function setRowNumbers(selectorPrefix) {
        const rowNoBoxes = document.querySelectorAll(`input[id^="${selectorPrefix}"]`);
        if (rowNoBoxes.length > 0) {
            let rowIndex = 1;
            rowNoBoxes.forEach((input) => {
                // เช็คว่าถ้ายังไม่มีค่า ค่อยกำหนด
                if (!input.value.trim()) {
                    input.value = rowIndex.toString();
                }
                rowIndex++;
            });
        }
    }
    
    setRowNumbers("TLN_2_I_SHIP_LNNO_");
}