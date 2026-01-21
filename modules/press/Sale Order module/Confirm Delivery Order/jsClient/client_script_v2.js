const nullLnnoClickedGroups = new Set();

function onCheckboxClick(checkbox, blockNo) {
  const keySono = "I_SONO";
  const keyLvl = "Lvl_$TLN_LEAF_DISP";
  const rowNo = "I_LNNO";

  if (!checkbox || !checkbox.name) return;

  const index = checkbox.name.split("_").pop();

  // #TLN_2_I_SONO_1
  let craftSO = `#TLN_${blockNo}_${keySono}_${index}`;
  const sonoField = document.querySelector(craftSO);

  // TLN_2_Lvl_$TLN_LEAF_DISP_1
  let craftId = `TLN_${blockNo}_${keyLvl}_${index}`;
  const Lvlline = document.getElementById(craftId);
  const holdVal = document.getElementsByName("CNDTN_SELECTED")[0];

  if (!sonoField || !holdVal) return;

  // ถ้า Lvlline ไม่มี ให้คลิก checkbox ที่มี title เดียวกัน (ยกเว้นอันแรก)
  if (!Lvlline) {
    const currentSonoTitle = sonoField.getAttribute("title");

    if (!currentSonoTitle) return;

    const groupKey = `${blockNo}_${currentSonoTitle}_${index}`;

    // ถ้ากดยกเลิก
    if (!checkbox.checked) {
      nullLnnoClickedGroups.delete(groupKey);

      const allMatchingSono = document.querySelectorAll(
        `[id^="TLN_${blockNo}_${keySono}_"][title="${currentSonoTitle}"]`,
      );
      let isFirst = true;

      allMatchingSono.forEach((field) => {
        // ข้ามแถวอันแรก
        if (isFirst) {
          isFirst = false;
          return;
        }

        const fieldIndex = field.id.split("_").pop();
        const relatedCheckbox = document.querySelector(
          `input[type="checkbox"][id^="TLN_${blockNo}_CHK_${fieldIndex}"]`,
        );

        if (
          relatedCheckbox &&
          relatedCheckbox !== checkbox &&
          relatedCheckbox.checked
        ) {
          relatedCheckbox.click();
        }
      });

      return;
    }

    if (nullLnnoClickedGroups.has(groupKey)) {
      return;
    }

    nullLnnoClickedGroups.add(groupKey);

    const allMatchingSono = document.querySelectorAll(
      `[id^="TLN_${blockNo}_${keySono}_"][title="${currentSonoTitle}"]`,
    );
    let isFirst = true;

    allMatchingSono.forEach((field) => {
      if (isFirst) {
        isFirst = false;
        return;
      }

      const fieldIndex = field.id.split("_").pop();
      const relatedCheckbox = document.querySelector(
        `input[type="checkbox"][id^="TLN_${blockNo}_CHK_${fieldIndex}"]`,
      );

      if (
        relatedCheckbox &&
        relatedCheckbox !== checkbox &&
        !relatedCheckbox.checked
      ) {
        relatedCheckbox.click();
      }
    });

    return;
  }

  const sono = sonoField.value;
  const rowno = document.querySelector(`#TLN_${blockNo}_${rowNo}_${index}`);

  const selectedMap = {};
  const entries = holdVal.value.split(",").filter((v) => v.trim() !== "");

  entries.forEach((entry) => {
    const [idx, val] = entry.split(":");
    if (idx && val) {
      selectedMap[idx] = val;
    }
  });

  if (checkbox.checked && sono.trim() !== "") {
    // ประกอบเป็น I_SONO|I_LNNO
    selectedMap[index] = `${sono}|${rowno.value}`;
    // selectedMap[index] = sono;
  } else {
    delete selectedMap[index];
  }

  const newSelected =
    Object.entries(selectedMap)
      .map(([idx, val]) => `${idx}:${val}`)
      .join(",") + (Object.keys(selectedMap).length ? "," : "");

  holdVal.value = newSelected;
}

function resizeContents_end() {
  var chkList = document.getElementsByClassName("selectionTableRow");
  for (i = 0; i < chkList.length; i++) {
    chkList[i].addEventListener("change", onCheckboxClick);
  }
}
