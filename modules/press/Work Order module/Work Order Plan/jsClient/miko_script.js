(function () {
    const SS_KEY = "TLN_GANTT_PARAM";
    const RESULT_MSG_KEY = "Redirect to Create Work Order Plan Screen , please wait ....";
    const BTN_CREATE_PLAN = "TLN_1_Create Plan"; 
    const BTN_CONFIRM_SRC = "TLN_2_Confirm";      // ปุ่มต้นทาง (Confirm ใน Dialog)
    const BTN_CONFIRM_DEST = "TLN_1_confirm wo"; // ปุ่มปลายทางที่ต้องกดต่อ
    
    let lastSyncedDate = ""; 

    // --- [NEW LOGIC: Confirm -> Confirm WO] ---
    // ใช้ Event Delegation ที่ document เพื่อให้ลอจิกห้ามพังแม้ปุ่มจะวาดใหม่
    document.addEventListener("click", function(e) {
        // เช็คว่าสิ่งที่คลิกคือปุ่ม TLN_2_Confirm หรือไม่
        if (e.target && (e.target.id === BTN_CONFIRM_SRC || e.target.closest("#" + BTN_CONFIRM_SRC))) {
            console.log("🎯 " + BTN_CONFIRM_SRC + " clicked! Triggering " +  + "...");
            
            // หน่วงเวลาเล็กน้อย 300ms ให้ระบบ Talon เคลียร์ Dialog ก่อนแล้วกดปุ่มถัดไป
            setTimeout(function() {
                const nextBtn = document.getElementById(BTN_CONFIRM_DEST);
                if (nextBtn) {
                    nextBtn.click();
                    console.log("✅ Successfully triggered " + BTN_CONFIRM_DEST);
                } else {
                    console.warn("⚠️ ไม่พบปุ่มปลายทาง: " + BTN_CONFIRM_DEST);
                }
            }, 300);
        }
    }, true);

    // --- [LOGIC เดิม: IDs & Config] ---
    const ID_DATE = "CNDTN_STD:0:_TEXT", ID_PART = "CNDTN_STD:1:_TEXT", ID_QTY = "CNDTN_STD:2:_TEXT";
    const BLOCK_DATE = "TLN_1_I_DATE", BLOCK_PART = "TLN_1_I_ITEMCODE", BLOCK_QTY = "TLN_1_TARGET_QTY";
    const GANTT_IDS = { y: "tln_gantt_1_block_target_year", m: "tln_gantt_1_block_target_month", d: "tln_gantt_1_block_target_day" };

    function clickCreatePlan() {
        const btn = document.getElementById(BTN_CREATE_PLAN);
        if (btn) { btn.click(); }
    }

    function initAutoRedirectObserver() {
        if (!window.MutationObserver) return;
        const observer = new MutationObserver(function () {
            const msgs = document.querySelectorAll("li.message-info, .message-area");
            for (let j = 0; j < msgs.length; j++) {
                if (msgs[j].textContent.indexOf(RESULT_MSG_KEY) !== -1 && !window._is_waiting) {
                    window._is_waiting = true;
                    setTimeout(function () {
                        clickCreatePlan();
                        window._is_waiting = false;
                    }, 500); 
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function safeUpdateInput(id, val) {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.value != String(val)) {
            el.value = val || "";
            if (window.TALON && TALON.putBindValue) TALON.putBindValue('FREE', id, el.value);
            el.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }

    function triggerDropdownValue(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        const targetVal = String(value);
        let isMatched = false;
        for (let i = 0; i < el.options.length; i++) {
            if (el.options[i].value === targetVal) { el.selectedIndex = i; isMatched = true; break; }
        }
        if (isMatched) {
            if (window.TALON && TALON.putBindValue) TALON.putBindValue('FREE', id, el.value);
            el.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }

    function processDateSync(dateStr) {
        if (!dateStr || !dateStr.includes('/')) return;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            triggerDropdownValue(GANTT_IDS.y, parts[2]);
            triggerDropdownValue(GANTT_IDS.m, parseInt(parts[1], 10));
            triggerDropdownValue(GANTT_IDS.d, parseInt(parts[0], 10));
            safeUpdateInput(BLOCK_DATE, dateStr);
        }
    }

    function runMainLogic() {
        if (typeof isValid !== 'undefined' && isValid) {
            const dateEl = document.getElementById(ID_DATE);
            const partEl = document.getElementById(ID_PART);
            const qtyEl  = document.getElementById(ID_QTY);
            if (dateEl && dateEl.value && dateEl.value !== lastSyncedDate) {
                lastSyncedDate = dateEl.value;
                processDateSync(lastSyncedDate);
                if (partEl) safeUpdateInput(BLOCK_PART, partEl.value);
                if (qtyEl)  safeUpdateInput(BLOCK_QTY,  qtyEl.value);
            }
        }
    }

    // --- [EXECUTION] ---
    initAutoRedirectObserver();
    setTimeout(function() {
        const saved = sessionStorage.getItem(SS_KEY);
        if (saved) {
            const d = JSON.parse(saved);
            if (d.pickedDate) { document.getElementById(ID_DATE).value = d.pickedDate; processDateSync(d.pickedDate); }
            if (d.partId) { document.getElementById(ID_PART).value = d.partId; safeUpdateInput(BLOCK_PART, d.partId); }
            if (d.targetQty) { document.getElementById(ID_QTY).value = d.targetQty; safeUpdateInput(BLOCK_QTY, d.targetQty); }
        }
    }, 1000);

    setInterval(runMainLogic, 1200);
    console.log("✅ Code Merged: Confirm Linked & Sync Active.");
})();