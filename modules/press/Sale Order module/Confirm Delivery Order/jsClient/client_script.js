/**
 * เมื่อกด checkbox:
 * - ถ้ากดติ๊ก : เพิ่มค่าจาก targetField ไปไว้ใน selectedField (แต่ถ้าไม่มีข้อมูลใน targetField ให้ข้าม)
 * - ถ้ากดยกเลิก : ลบค่านั้นออกจาก selectedField
 */
function onCheckboxClick(checkbox, blockNo) {
    const keySono = "I_SONO";
    const keyLnno = "I_LNNO";

    if (!checkbox || !checkbox.name) return;

    const index = checkbox.name.split('_').pop();

    const sonoField = document.querySelector(`#TLN_${blockNo}_${keySono}_${index}`);
    const lnnoField = document.querySelector(`#TLN_${blockNo}_${keyLnno}_${index}`);
    const selectedField = document.getElementsByName('CNDTN_SELECTED')[0];

    if (!sonoField || !lnnoField || !selectedField) return;

    const sono = sonoField.value;
    const lnno = lnnoField.value;

    const selectedMap = {};
    const entries = selectedField.value.split(',').filter(v => v.trim() !== '');

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

    selectedField.value = newSelected;
}



function resizeContents_end() {
  var chkList = document.getElementsByClassName("selectionTableRow");
  for (i = 0; i < chkList.length; i++) {
    chkList[i].addEventListener("change", onCheckboxClick);
  }
}


