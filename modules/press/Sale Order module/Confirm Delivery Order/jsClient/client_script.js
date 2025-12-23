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

  initAutoSelectByItem('2','CHK','I_SONO','SELECTED');
}




const dataIndex = new Map();

//chkBoxElementName = Element's Name for checkbox ( BlockNo_COLUMNNAME_)
//mainItem = item to use for further process such as PR No., PO No., Invoice No., Etc.
//searchConditionName = name of search conditions box such as "CNDTN_SELECTED" or "CNDTN_[COLUMNNAME]"
// singleSelect : TRUE  = select only 1 item (no auto select)
//                FALSE = auto select by same item

function initAutoSelectByItem(blockNo, chkBoxElementName, mainItem, searchConditionName) {
  var i = 0;
  var chkBox = `${blockNo}_${chkBoxElementName}_`; 
  var itemName = `${blockNo}_${mainItem}_`;        // Column to check for duplicate
  var dataSet = new Set();

  dataIndex.clear(); // rebuild cache every refresh

  while (true) {
    var sel = getElementByName(chkBox + i);
    var itemNameInput = getElementByName(itemName + i);
    if (!sel || !itemNameInput) break;

    const item = itemNameInput.title;
    if (!dataIndex.has(item)) {
      dataIndex.set(item, []);
    }
    dataIndex.get(item).push(sel);


    // Only attach listener once
    if (!sel.dataset.listenerAttached) {
      sel.addEventListener("change", (function(item) {
        return function(e) {
          if (e?.isProgrammatic) return;
          if (this.checked) {
            autoSelectSameItem(item);
          } else {
            autoUnselectSameItem(item, searchConditionName);
          }
        };
      })(item));
      sel.dataset.listenerAttached = "true";
    }

    if (sel.checked) dataSet.add(item);
    i++;
  }

  var col = Array.from(dataSet).join(",");
  var searchCondtions = document.getElementsByName(`CNDTN_${searchConditionName}`)[0]; // Change search condition name
  //if (searchCondtions) searchCondtions.value = col;

  return col;
}

function autoSelectSameItem(item) {
  const group = dataIndex.get(item);
  if (!group) return;

  for (const sel of group) {
    if (!sel.checked) {
      const ev = new Event("change");
      ev.isProgrammatic = true;
      sel.checked = true;
      sel.dispatchEvent(ev);
    }
  }
}

function autoUnselectSameItem(item, searchConditionName) {
  const group = dataIndex.get(item);
  if (!group) return;

  for (const sel of group) {
    if (sel.checked) {
      const ev = new Event("change");
      ev.isProgrammatic = true;
      sel.checked = false;
      sel.dispatchEvent(ev);
    }
  }

  const searchCondtions = document.getElementsByName(`CNDTN_${searchConditionName}`)[0]; 
  if (searchCondtions) searchCondtions.value = "";
}