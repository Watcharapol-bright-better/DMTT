document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        let obj = document.getElementById('JKN_AREA');
        if (obj) obj.style.display = 'none';


        // let QtNo = document.getElementsByName('CNDTN_I_QT_NO')[0];
        // if (QtNo) document.getElementById('TLN_1_I_QT_NO').value = QtNo.value;

        // let SoNo = document.getElementsByName('CNDTN_I_SONO')[0];
        // if (SoNo) document.getElementById('TLN_1_I_SONO').value = SoNo.value;

        let Name = document.getElementsByName('CNDTN_I_NAME')[0];
        if (Name) document.getElementById('TLN_1_I_NAME').value = Name.value;

    }, 200);
});

function resizeContents_end() {
    let obj = document.getElementById('JKN_AREA');
    if (obj) obj.style.display = 'none';

    // let QtNo = document.getElementsByName('CNDTN_I_QT_NO')[0];
    // if (QtNo) document.getElementById('TLN_1_I_QT_NO').value = QtNo.value;

    // let SoNo = document.getElementsByName('CNDTN_I_SONO')[0];
    // if (SoNo) document.getElementById('TLN_1_I_SONO').value = SoNo.value;

    let Name = document.getElementsByName('CNDTN_I_NAME')[0];
    if (Name) document.getElementById('TLN_1_I_NAME').value = Name.value;

    function updateBoxHeight() {
        function removeHeight(id) {
            const el = document.getElementById(id);
            if (el) el.style.removeProperty("height");
        }

        // Box Card 0 พิเศษ
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

    updateBoxHeight();

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

    setRowNumbers("TLN_2_I_LNNO_");
    
    
}

function addComma(elem){
    let val = (elem && elem.value !== undefined) ? elem.value : elem;

    val = String(val).replace(/[^\d\.]/g, '');

    let num = Number(val);
    if (isNaN(num)) num = 0;

    return num.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
