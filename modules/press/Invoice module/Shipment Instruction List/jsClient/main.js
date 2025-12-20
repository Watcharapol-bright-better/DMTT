
/**
 * เมื่อกด checkbox:
 * - ถ้ากดติ๊ก : เพิ่มค่าจาก targetField ไปไว้ใน selectedField (แต่ถ้าไม่มีข้อมูลใน targetField ให้ข้าม)
 * - ถ้ากดยกเลิก : ลบค่านั้นออกจาก selectedField
 */
function onCheckboxClick(checkbox, blockNo) {
    const keyCode = "I_SHIP_INST";

    if (!checkbox || !checkbox.name) return;

    const index = checkbox.name.split('_').pop();
    const targetField = document.querySelector(`#TLN_${blockNo}_${keyCode}_${index}`);
    const selectedField = document.getElementsByName('CNDTN_SELECTED')[0];

    if (!targetField || !selectedField) return;

    const value = targetField.value;

    const selectedMap = {};
    const entries = selectedField.value.split(',').filter(v => v.trim() !== '');
    entries.forEach(entry => {
        const [idx, val] = entry.split(':');
        if (idx && val) {
            selectedMap[idx] = val;
        }
    });

    if (checkbox.checked && value.trim() !== '') {
        selectedMap[index] = value; // ติ๊ก: เพิ่มค่าเก็บใน Stack
    } else {
        delete selectedMap[index]; // ยกเลิก: ลบข้อมูลใน Stack อิงจาก index
    }

    // ประกอบข้อมูล selectedField ใหม่ให้อยู่ในรูปแบบ "index:value," (แต่ละคู่คั่นด้วย comma)
    // ตัวอย่างผลลัพธ์ที่ได้: 10:IV250000017,11:IV250000017,12:IV250000019,
    // - index คือลำดับของข้อมูลที่เลือก
    // - value คือค่าที่เลือกแต่ละรายการ
    // - หากไม่มีข้อมูลจะเป็นช่องว่าง
    // - มี comma ต่อท้ายถ้ามีข้อมูล
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

