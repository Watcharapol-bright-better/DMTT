// ========== IndexedDB Helper ==========
const DB_NAME = 'CheckboxGroups';
const STORE_NAME = 'clickedGroups';
const DB_VERSION = 1;

let db = null;


async function initDB() {
    if (db) return db; 
    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

// เพิ่ม key ใน Set
async function addToSet(key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put({ key, timestamp: Date.now() });
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// ลบ key ออกจาก Set
async function deleteFromSet(key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

// เช็คว่า key มีอยู่หรือไม่
async function hasInSet(key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => reject(request.error);
    });
}

async function clearStore() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

// ดึงทั้งหมดออกมาเป็น Array
async function getAllFromSet() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAllKeys();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ========== Main Functions ==========
async function onCheckboxClick(checkbox, blockNo, targetField) {
    if (!checkbox.name) return;

    const idx = checkbox.name.split('_').pop();
    const soField = document.querySelector(`#TLN_${blockNo}_${targetField}_${idx}`);
    const lvlField = document.getElementById(`TLN_${blockNo}_Lvl_$TLN_LEAF_DISP_${idx}`);
    const holdVal = document.getElementsByName('CNDTN_SELECTED')[0];

    if (!soField || !holdVal) return;

    if (!lvlField) {
        await handleGroupClick(checkbox, blockNo, idx, soField);
        return;
    }

    updateSelection(checkbox, idx, soField, blockNo, holdVal);
}

async function handleGroupClick(checkbox, blockNo, idx, soField) {
    const title = soField.getAttribute('title');
    if (!title) return;

    const groupKey = `${blockNo}_${title}_${idx}`;
    const matchingSo = document.querySelectorAll(`[id^="TLN_${blockNo}_I_SONO_"][title="${title}"]`);

    if (!checkbox.checked) {
        await deleteFromSet(groupKey);
        uncheckGroup(matchingSo, blockNo, checkbox);
        return;
    }

    const exists = await hasInSet(groupKey);
    if (exists) return;

    await addToSet(groupKey);
    checkGroup(matchingSo, blockNo, checkbox);
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

function updateSelection(checkbox, idx, soField, blockNo, holdVal) {
    const so = soField.value;
    const lnField = document.querySelector(`#TLN_${blockNo}_I_LNNO_${idx}`);
    
    const selected = parseSelection(holdVal.value);

    if (checkbox.checked && so.trim()) {
        selected[idx] = `${so}|${lnField.value}`;
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

async function resizeContents_end() {
    const checkboxes = document.getElementsByClassName("selectionTableRow");
    Array.from(checkboxes).forEach(chk => {
        chk.addEventListener("change", () => onCheckboxClick(chk));
    });
    
    const allGroups = await getAllFromSet();
    console.log('Clicked groups:', allGroups);
    
    let stack = document.getElementsByName('CNDTN_SELECTED')[0]?.value;
    console.log(`current stack : ${stack}`);
    
    let event = document.getElementById('EVENT_STATUS').value;
    if (event === 'JAVASCRIPT_BTN') {
        await clearStore();
        console.log('IndexedDB store cleared');
    }
    
}


// ==============================
// Example usage:
(async function() {
    await initDB(); 
    
    var checkbox = %2_CHK%;

    if (checkbox) {
        checkbox.addEventListener('focusout', async function() {
            await onCheckboxClick(this, 2, 'I_SONO');
        });
        
        const event = new FocusEvent("focusout", {
            bubbles: true,
            cancelable: true
        });
        checkbox.dispatchEvent(event);
    }
})();
