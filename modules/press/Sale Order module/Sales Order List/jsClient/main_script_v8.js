
const SelectChk = (() => {
    const groups = new Set();

    function click(chk, block) {
        if (!chk.name) return;

        const i = chk.name.split('_').pop();
        const pk = document.querySelector(`#TLN_${block}_I_SONO_${i}`);
        const lvl  = document.getElementById(`TLN_${block}_Lvl_$TLN_LEAF_DISP_${i}`);
        const hold = document.getElementsByName('CNDTN_SELECTED')[0];
        if (!pk || !hold) return;

        if (!lvl) return group(chk, block, i, pk);
        detail(chk, i, pk, block, hold);
    }

    function group(chk, block, i, pk) {
        const t = pk.getAttribute('title');
        if (!t) return;

        const key = `${block}_${t}_${i}`;
        const list = document.querySelectorAll(
            `[id^="TLN_${block}_I_SONO_"][title="${t}"]`
        );

        if (!chk.checked) {
            groups.delete(key);
            toggle(list, block, chk, true);
            return;
        }

        if (groups.has(key)) return;
        groups.add(key);
        toggle(list, block, chk, false);
    }

    function toggle(list, block, skip, off) {
        let first = true;
        list.forEach(f => {
            if (first) { first = false; return; }
            const i = f.id.split('_').pop();
            const chk = document.querySelector(
                `input[type="checkbox"][id^="TLN_${block}_CHK_${i}"]`
            );
            if (chk && chk !== skip) {
                if (off ? chk.checked : !chk.checked) chk.click();
            }
        });
    }

    function detail(chk, i, pk, block, hold) {
        const ln = document.querySelector(`#TLN_${block}_INTERNAL_NO_${i}`);
        const sel = parse(hold.value);

        if (chk.checked && pk.value.trim()) {
            sel[i] = `${pk.value}|${ln.value}`;
        } else {
            delete sel[i];
        }
        hold.value = format(sel);
    }

    function parse(v) {
        const o = {};
        v.split(',').filter(Boolean).forEach(e => {
            const [k, val] = e.split(':');
            if (k && val) o[k] = val;
        });
        return o;
    }

    function format(o) {
        const a = Object.entries(o).map(([k, v]) => `${k}:${v}`);
        return a.length ? a.join(',') + ',' : '';
    }

    function clear() {
        groups.clear();
    }

    return {
        click,
        clear
    };
})();



/// Client site script
function onCheckboxClick(chk, blockNo) {
    SelectChk.click(chk, blockNo);
}

function clearStore() {
    SelectChk.clear();
}


function resizeContents_end() {
    Array.from(document.getElementsByClassName("selectionTableRow"))
        .forEach(chk => chk.addEventListener("change", onCheckboxClick));

    if (document.getElementById('EVENT_STATUS')?.value === 'JAVASCRIPT_BTN') {
        clearStore();
    }
}



// Focusout Script
var checkbox = %2_CHK%;
if (checkbox) {
    checkbox.addEventListener('focusout', function () {
        onCheckboxClick(this, 2);
    });
    checkbox.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
}
