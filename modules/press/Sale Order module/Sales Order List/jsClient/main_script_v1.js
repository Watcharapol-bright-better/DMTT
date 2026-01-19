
/**
 * เมื่อกด checkbox:
 * - ถ้ากดติ๊ก : เพิ่มค่าจาก targetField ไปไว้ใน holdVal (แต่ถ้าไม่มีข้อมูลใน targetField ให้ข้าม)
 * - ถ้ากดยกเลิก : ลบค่านั้นออกจาก holdVal
 */
function onCheckboxClick(checkbox, blockNo) {
    const keySono = "I_SONO";
    const keyLnno = "Lvl_$TLN_LEAF_DISP";

    if (!checkbox || !checkbox.name) return;

    const index = checkbox.name.split('_').pop();

    // #TLN_2_I_SONO_1
    let craftSO = `#TLN_${blockNo}_${keySono}_${index}`;
    const sonoField = document.querySelector(craftSO);

    // TLN_2_Lvl_$TLN_LEAF_DISP_1
    let craftId = `TLN_${blockNo}_${keyLnno}_${index}`;
    const lnnoField = document.getElementById(craftId);
    const holdVal = document.getElementsByName('CNDTN_SELECTED')[0];

    if (!sonoField || !lnnoField || !holdVal) return;

    if(!lnnoField) {
       document.querySelector(`input[type="checkbox"][id^="TLN_2_CHK_${index}"]`).click();
    }

    const sono = sonoField.value;
    const lnno = lnnoField.value;

    const selectedMap = {};
    const entries = holdVal.value.split(',').filter(v => v.trim() !== '');

    entries.forEach(entry => {
        const [idx, val] = entry.split(':');
        if (idx && val) {
            selectedMap[idx] = val;
        }
    });

    if (checkbox.checked && sono.trim() !== '') {
        // ประกอบเป็น I_SONO|I_LNNO
        selectedMap[index] = `${sono}|${lnno}`;
    } else {
        delete selectedMap[index];
    }

    const newSelected = Object.entries(selectedMap)
        .map(([idx, val]) => `${idx}:${val}`)
        .join(',') + (Object.keys(selectedMap).length ? ',' : '');

    holdVal.value = newSelected;
}



function resizeContents_end() {
  var chkList = document.getElementsByClassName("selectionTableRow");
  for (i = 0; i < chkList.length; i++) {
    chkList[i].addEventListener("change", onCheckboxClick);
  }
}


