document.head.insertAdjacentHTML(
document.head.insertAdjacentHTML(
    "beforeend",
    '<style>' +
    'th[data-cell-seq="21"],' +
    'td[data-cell-seq="21"] {' +
    'display: none;' +
    '}' +
    '</style>'
)

// =======================================
// CLIENT SIDE for "Get FG Details"
// - ซ่อน detail ตอนโหลด
// - กรองแถวตาม TYPE (header ↔ column TYPE)
// - ซ่อนคอลัมน์ TYPE
// - เซ็ต I_SELECTED = 1 เฉพาะแถวที่มองเห็นหลังกรอง
// =======================================
(function () {
    var TYPE_CELL_SEQ = '20';     // data-cell-seq ของคอลัมน์ TYPE ใน detail
    var filterIntervalId = null;

    function $(sel) { return document.querySelector(sel); }

    // ซ่อนคอลัมน์ I_SELECTED ทั้งหัว + รายละเอียด
    document.head.insertAdjacentHTML(
        "beforeend",
        '<style>' +
        '[name^="2_I_SELECTED_"], th[data-col-id="I_SELECTED"] {' +
        '  display:none !important;' +
        '}' +
        '</style>'
    );

    // ซ่อน header + body ตอนโหลดหน้า
    window.addEventListener('load', function () {
        var header = $('#tbl_scrollable_head_L_1 > table > thead');
        if (header) header.style.display = 'none';

        var detailBody = $('#tbl_scrollable_body_L_1');
        if (detailBody) detailBody.style.display = 'none';
    });

    // หา column index ของ TYPE จาก th[data-cell-seq="20"]
    function getTypeColIndex() {
        var typeTh = document.querySelector(
            '#tbl_scrollable_head_L_1 th[data-cell-seq="' + TYPE_CELL_SEQ + '"]'
        );
        return typeTh ? typeTh.cellIndex : -1;
    }

    // ซ่อนคอลัมน์ TYPE ทั้งหัว + รายละเอียด
    function hideTypeColumnByIndex(colIndex) {
        if (colIndex < 0) return;

        var headRows = document.querySelectorAll('#tbl_scrollable_head_L_1 thead tr');
        headRows.forEach(function (row) {
            if (row.cells[colIndex]) row.cells[colIndex].style.display = 'none';
        });

        var bodyRows = document.querySelectorAll('#tbl_scrollable_body_L_1 tbody tr');
        bodyRows.forEach(function (row) {
            if (row.cells[colIndex]) row.cells[colIndex].style.display = 'none';
        });
    }

    // กรองแถวตามค่า TYPE บน header ↔ ค่า TYPE ใน column
    function filterRowsByType() {
        // I_TYPE ที่ header (pattern 3 Months / 4 Months)
        var typeEl = $('#TLN_1_I_TYPE') || document.querySelector('[name="1_I_TYPE"]');
        if (!typeEl) {
            console.warn('ไม่พบฟิลด์ I_TYPE (#TLN_1_I_TYPE หรือ name="1_I_TYPE")');
            return;
        }

        var typeValue = (typeEl.value || '').trim(); // เช่น "0" หรือ "1"
        if (typeValue === '') return;

        var bodyWrap = $('#tbl_scrollable_body_L_1');
        if (!bodyWrap) return;

        var table = bodyWrap.getElementsByTagName('table')[0];
        if (!table) return;

        var colIndex = getTypeColIndex();
        if (colIndex < 0) {
            console.warn('ไม่พบหัวคอลัมน์ TYPE ที่ data-cell-seq = ' + TYPE_CELL_SEQ);
            return;
        }

        var rows = table.getElementsByTagName('tr');
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];

            // เอาเฉพาะแถวใน tbody
            if (!row.parentNode || row.parentNode.tagName.toLowerCase() !== 'tbody') continue;

            var cell = row.cells[colIndex];
            if (!cell) continue;

            var div = cell.querySelector('div');
            var raw = div
                ? (div.getAttribute('data-save-value') || div.innerText || div.textContent || '')
                : (cell.innerText || cell.textContent || '');

            raw = (raw || '').trim();

            // แสดงเฉพาะแถวที่ TYPE (ใน cell) = I_TYPE (บน header)
            row.style.display = (raw === typeValue) ? '' : 'none';
        }

        hideTypeColumnByIndex(colIndex);
    }

    // เซ็ต I_SELECTED ตามแถวที่มองเห็น/ถูกซ่อน
    function markSelectedRows() {
        var rows = document.querySelectorAll('#tbl_scrollable_body_L_1 tbody tr');
        rows.forEach(function (tr) {
            var selEl = tr.querySelector('[name^="2_I_SELECTED_"]');
            if (!selEl) return;

            var visible = (tr.style.display !== 'none'); // ถ้าไม่ถูกซ่อน = เลือก
            var val = visible ? '1' : '0';

            selEl.value = val;
            selEl.setAttribute('data-save-value', val);
        });
    }

    // รวม: กรอง + mark I_SELECTED
    function applyFilter() {
        filterRowsByType();
        markSelectedRows();
    }

    // ฟังก์ชันที่ผูกกับปุ่ม Get FG Details
    window.getFGDetails = function () {
        var header = $('#tbl_scrollable_head_L_1 > table > thead');
        var detailBodyWrap = $('#tbl_scrollable_body_L_1');

        // แสดง detail
        if (header) header.style.display = '';
        if (detailBodyWrap) detailBodyWrap.style.display = '';

        // กรองครั้งแรก + mark I_SELECTED
        applyFilter();

        // กันกรณี Talon redraw รายการ → กรอง/mark ซ้ำทุก 0.5 วิ
        if (!filterIntervalId) {
            filterIntervalId = setInterval(function () {
                var bodyStillThere = document.body.contains($('#tbl_scrollable_body_L_1'));
                if (!bodyStillThere) {
                    clearInterval(filterIntervalId);
                    filterIntervalId = null;
                    return;
                }
                applyFilter();
            }, 500);
        }
    };

})();



// ============================
// 2) คำนวณเดือน METAL PRICE (MM/YYYY) จาก I_QT_MTH + I_TYPE
// ============================
window.addEventListener('load', function () {
    // helper
    function parseMMYYYY(text) {
        const m = text && text.match(/^(\d{1,2})\/(\d{4})$/);
        return m ? new Date(+m[2], +m[1] - 1, 1) : null;
    }
    function subMonths(d, n) {
        return new Date(d.getFullYear(), d.getMonth() - n, 1);
    }
    function fmtMMYYYY(d) {
        return String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    }
    function getFieldValue(el) {
        if (!el) return '';
        return (el.value || el.getAttribute('data-save-value') || el.title || '').trim();
    }
    function setFieldValue(el, v) {
        if (!el) return;
        el.value = v;
        el.setAttribute('data-save-value', v);
        el.title = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const patternEl = document.getElementById('TLN_1_I_TYPE');        // 0=3M,1=4M
    const qtEl      = document.getElementById('TLN_1_I_QT_MTH');      // 11/2025
    const metalEl   = document.getElementById('TLN_1_I_METAL_PRICE'); // target

    if (!patternEl || !qtEl || !metalEl) {
        console.warn('ไม่เจอบาง field TLN_1_I_TYPE / TLN_1_I_QT_MTH / TLN_1_I_METAL_PRICE');
        return;
    }

    function recalc() {
        const qtText = getFieldValue(qtEl);
        const base   = parseMMYYYY(qtText);
        if (!base) {
            setFieldValue(metalEl, '');
            return;
        }

        const patt = String(patternEl.value || '').trim();  // "0" หรือ "1"
        let months = 0;
        if (patt === '0') months = 3;
        else if (patt === '1') months = 4;

        if (!months) {
            setFieldValue(metalEl, '');
            return;
        }

        const resultDate = subMonths(base, months);
        const out = fmtMMYYYY(resultDate);
        setFieldValue(metalEl, out);
    }

    patternEl.addEventListener('change', recalc);
    patternEl.addEventListener('input', recalc);
    qtEl.addEventListener('change', recalc);
    qtEl.addEventListener('input', recalc);

    recalc();
});

// ============================
// 3) โชว์ combined บนช่อง Item Code บน header (ถ้ามีตัวแปร combined)
// ============================
var input = document.getElementById("TLN_1_I_ITEMCODE");
if (input && typeof combined !== "undefined") {
    input.value = combined;
}
