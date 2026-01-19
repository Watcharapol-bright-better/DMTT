

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

function calculateMonth() {
    let qtMonth = document.getElementById('TLN_1_I_QT_MTH').value; // 01/2026
    let matPriceMonth = document.getElementById('TLN_1_I_METAL_PRICE');
    let pattern = document.getElementById('TLN_1_I_TYPE').value;
    
    // จำนวนเดือนที่ต้องย้อนหลัง
    let monthsBack = {
        '0': 3,  // 3 Months
        '1': 4   // 4 Months
    };
    
    // คำนวณวันที่ย้อนหลัง
    let [month, year] = qtMonth.split('/');
    let date = new Date(year, month - 1 - monthsBack[pattern], 1);
    
    // แปลงกลับเป็น MM/YYYY
    let result = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    
    matPriceMonth.value = result;
    //console.log('Result:', result);
}

function setHeadId() {
    let valFrom = document.getElementById('TLN_2_I_QT_NO_0');
    if (valFrom) document.getElementsByName('1_I_QT_NO')[0].value = valFrom.value;
}

function resizeContents_end() {

    let obj = document.getElementById('JKN_AREA');
    if (obj) obj.style.display = 'none';
    updateBoxHeight();
    setRowNumbers("TLN_2_I_QT_LN_");

    document.getElementById('TLN_1_I_QT_STATUS').value = '0';

    calculateMonth();

    // set id to box header
    setHeadId();

}
