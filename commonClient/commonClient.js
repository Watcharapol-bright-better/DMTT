

/**
 * Checkbox selection logic.
 *
 * @param {HTMLElementObject} chk
 *        The checkbox element that was triggered.
 *
 * @param {number} blockNo
 *        TALON block number.
 *        Used to build element id pattern:
 *        TLN_{blockNo}_{field}_{index}
 *
 * @param {boolean} isLvl
 *        true  = enable group/header logic.
 *        false = treat as normal detail row.
 *
 * @param {string} pkey
 *        Primary field name (example: 'I_SONO').
 *        Used to get main value:
 *        TLN_{blockNo}_{pkey}_{index}
 *
 * @param {string} [skey]
 *        Optional secondary field name
 *        (example: 'INTERNAL_NO').
 *        If provided, value format will be:
 *        primary|secondary
 *
 *
 * ----------------------------------
 * : Usage Example
 *
 * // Client Site Scope
 * function onCheckboxClick(chk, blockNo, isLvl, pkey, skey) {
 *     SelectChk.click(chk, blockNo, isLvl, pkey, skey);
 * }
 *
 * function resizeContents_end() {
 *     Array.from(document.getElementsByClassName("selectionTableRow"))
 *         .forEach(chk =>
 *             chk.addEventListener("change", onCheckboxClick)
 *         );
 *
 *     if (document.getElementById('EVENT_STATUS').value === 'JAVASCRIPT_BTN') {
 *         SelectChk.clear();
 *     }
 * }
 *
 *
 * // Focusout Scope (Group Level Example)
 * let checkbox = %2_CHK%;
 * if (checkbox) {
 *     checkbox.addEventListener('focusout', function () {
 *         onCheckboxClick(this, 2, true, 'I_SONO', 'INTERNAL_NO');
 *     });
 *
 *     checkbox.dispatchEvent(new FocusEvent('focusout', {
 *         bubbles: true
 *     }));
 * }
 *
 *
 * // Focusout Scope (Detail Row Example)
 * let checkbox2 = %2_SEL_CHK%;
 * if (checkbox2) {
 *     checkbox2.addEventListener('focusout', function () {
 *         onCheckboxClick(this, 2, false, 'I_SHIP_INST');
 *     });
 *
 *     checkbox2.dispatchEvent(new FocusEvent('focusout', {
 *         bubbles: true
 *     }));
 * }
 */
const SelectChk = (() => {
    const groups = new Set();

    function click(chk, block, isLvl, pkey, skey) {
        if (!chk.name) return;

        const i = chk.name.split('_').pop();
        const pk = document.querySelector(`#TLN_${block}_${pkey}_${i}`);
        const lvl = document.getElementById(`TLN_${block}_Lvl_$TLN_LEAF_DISP_${i}`);
        const hold = document.getElementsByName('CNDTN_SELECTED')[0];
        if (!pk || !hold) return;

      if (isLvl) {
        if (!lvl) return group(chk, block, i, pk);
        lineDetail(chk, i, pk, block, hold, skey);
      } else { 
        lineDetail(chk, i, pk, block, hold, skey);
      }
      
    }

    function group(chk, block, i, pk) {
        // console.log('on click group...');
        const t = pk.getAttribute('title');
        if (!t) return;

        const key = `${block}_${t}_${i}`;
        const list = document.querySelectorAll(
            `[id^="TLN_${block}_"][id*="${pk.id.split('_')[2]}_"][title="${t}"]`
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
        const parts = skip.name.split('_');
        const baseName = parts[parts.length - 2];

        // console.log(baseName);
        let first = true;
        list.forEach(f => {
            if (first) {
                first = false;
                return;
            }
            const index = f.id.split('_').pop();
            const chk = document.querySelector(`input[type="checkbox"][id^="TLN_${block}_${baseName}_${index}"]`);
            if (chk && chk !== skip) {
                if (off ? chk.checked : !chk.checked) chk.click();
            }
        });
    }

    function lineDetail(chk, i, pk, block, hold, skey) {
        const sel = parse(hold.value);

        if (chk.checked && pk.value.trim()) {
            if (skey) {
                const ln = document.querySelector(`#TLN_${block}_${skey}_${i}`);
                sel[i] = ln ? `${pk.value}|${ln.value}` : pk.value;
            } else {
                sel[i] = pk.value;
            }
        } else {
            delete sel[i];
        }
        // console.log(format(sel));
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
