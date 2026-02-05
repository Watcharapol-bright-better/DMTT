const clickedGroups = new Set();

function onCheckboxClick(checkbox, blockNo) {
    if (!checkbox.name) return;

    const idx = checkbox.name.split('_').pop();
    const idField = document.querySelector(`#TLN_${blockNo}_I_SONO_${idx}`);
    const lvlField = document.getElementById(`TLN_${blockNo}_Lvl_$TLN_LEAF_DISP_${idx}`);
    const holdVal = document.getElementsByName('CNDTN_SELECTED')[0];

    if (!idField || !holdVal) return;

    // lvlField ไม่มีแสดงว่าเป็น header (Level 1)
    if (!lvlField) {
        // คลิก checkbox กลุ่มเดียวกันในรายการ details ด้วยทั้งหมด
        handleGroupClick(checkbox, blockNo, idx, idField);
        return;
    }

    // คลิก checkbox เฉพาะที่ต้องการใน details (Level 2)
    updateSelection(checkbox, idx, idField, blockNo, holdVal);
}

function handleGroupClick(checkbox, blockNo, idx, idField) {
    const title = idField.getAttribute('title');
    if (!title) return;

    const groupKey = `${blockNo}_${title}_${idx}`;
    const matchingId = document.querySelectorAll(`[id^="TLN_${blockNo}_I_SONO_"][title="${title}"]`);

    if (!checkbox.checked) {
        clickedGroups.delete(groupKey);
        uncheckGroup(matchingId, blockNo, checkbox);
        return;
    }

    if (clickedGroups.has(groupKey)) return;

    clickedGroups.add(groupKey);
    checkGroup(matchingId, blockNo, checkbox);
}

function checkGroup(fields, blockNo, excludeCheckbox) {
    toggleGroup(fields, blockNo, excludeCheckbox, false);
}

function uncheckGroup(fields, blockNo, excludeCheckbox) {
    toggleGroup(fields, blockNo, excludeCheckbox, true);
}

function toggleGroup(fields, blockNo, excludeCheckbox, shouldUncheck) {
    let isFirst = true;

    fields.forEach(field => {
        if (isFirst) {
            isFirst = false;
            return;
        }

        const fieldIdx = field.id.split('_').pop();
        const chk = document.querySelector(`input[type="checkbox"][id^="TLN_${blockNo}_CHK_${fieldIdx}"]`);

        if (chk && chk !== excludeCheckbox) {
            const shouldClick = shouldUncheck ? chk.checked : !chk.checked;
            if (shouldClick) chk.click();
        }
    });
}

function updateSelection(checkbox, idx, idField, blockNo, holdVal) {
    const id = idField.value;
    const lnField = document.querySelector(`#TLN_${blockNo}_I_LNNO_${idx}`);

    const selected = parseSelection(holdVal.value);

    if (checkbox.checked && id.trim()) {
        selected[idx] = `${id}|${lnField.value}`;
    } else {
        delete selected[idx];
    }

    holdVal.value = formatSelection(selected);
}

function parseSelection(value) {
    const result = {};
    value.split(',')
        .filter(v => v.trim())
        .forEach(entry => {
            const [idx, val] = entry.split(':');
            if (idx && val) result[idx] = val;
        });
    return result;
}

function formatSelection(selected) {
    const entries = Object.entries(selected).map(([idx, val]) => `${idx}:${val}`);
    return entries.length ? entries.join(',') + ',' : '';
}


function SplitRows() {
    const rows = document.querySelectorAll('tr[id^="tbl_L_1_row_"]');

    rows.forEach(tr => {
        const rowKey = Number(tr.getAttribute('data-row-key'));
        if (!rowKey) return;

        const sonoInput = document.getElementById(`TLN_2_I_SONO_${rowKey}`);
        if (!sonoInput) return;
        
        const qtyInput = document.getElementById(`TLN_2_I_QTY_${rowKey}`);
        if (!qtyInput) return;

        if (sonoInput.value.trim() === '') {
            // tr.style.backgroundColor = 'yellow';
            qtyInput.value = 0;
            const prevSono = document.getElementById(`TLN_2_I_SONO_${rowKey - 1}`);
            if (prevSono && prevSono.value.trim() !== '') {
                sonoInput.value = prevSono.value;
            }
        }
    });
}



function resizeContents_end() {
    const checkboxes = document.getElementsByClassName("selectionTableRow");
    Array.from(checkboxes).forEach(chk => {
        chk.addEventListener("change", onCheckboxClick);
    });
    //conidle.log(clickedGroups);
    
    SplitRows();

    //let stack = document.getElementsByName('CNDTN_SELECTED')[0].value;
    //conidle.log(`current stack : ${stack}`);

    let event = document.getElementById('EVENT_STATUS').value;
    if (event === 'JAVASCRIPT_BTN') {
      clickedGroups.clear();
        //conidle.log('Store cleared');
    }
}