

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        
       let obj = document.getElementById('JKN_AREA');
        if (obj) obj.style.display = 'none';



        let QT_NO = document.getElementsByName('CNDTN_I_QT_NO')[0].value
        if (QT_NO !== '') {
            document.getElementById('TLN_1_I_QT_NO').value = QT_NO
            document.getElementById('TLN_1_I_QT_NO').setAttribute("data-save-value", QT_NO); 
        }

    }, 200);
});

function resizeContents_end() {

    let obj = document.getElementById('JKN_AREA');
    if (obj) obj.style.display = 'none';

}


function addComma(elem){
    let val = (elem && elem.value !== undefined) ? elem.value : elem;

    val = String(val).replace(/[^\d\.]/g, '');

    let num = Number(val);
    if (isNaN(num)) num = 0;

    return num.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}




(function () {

  // -----------------------------
  // Mapping condition → header
  // -----------------------------
  const FIELD_MAP = {
    "CNDTN_STD:0:_TEXT": "TLN_1_I_QT_NO", // Quotation No.
    "CNDTN_STD:1:_TEXT": "TLN_1_I_NAME"   // Customer Name
  };

  // -----------------------------
  // ฟังก์ชัน sync จากต้นทาง → ปลายทาง
  // -----------------------------
  function syncField(fromId, toId) {
    const from = document.getElementById(fromId);
    const to   = document.getElementById(toId);

    if (!from || !to) return;

    to.value = from.value;                         // อัปเดตค่าบนจอ
    to.setAttribute("data-save-value", from.value); // กัน Talon reset
  }

  // -----------------------------
  // keyup = อัปเดตแบบ realtime ขณะพิมพ์
  // -----------------------------
  document.addEventListener("keyup", function(e) {
    const fromId = e.target.id;
    if (FIELD_MAP[fromId]) {
      syncField(fromId, FIELD_MAP[fromId]);
    }
  });

  // -----------------------------
  // blur = อัปเดตหลัง PrimeFaces.ab ทำงานเสร็จ
  // -----------------------------
  document.addEventListener("blur", function(e) {
    const fromId = e.target.id;
    if (FIELD_MAP[fromId]) {
      const toId = FIELD_MAP[fromId];
      setTimeout(function () {
        syncField(fromId, toId);
      }, 80);
    }
  }, true);

  // -----------------------------
  // ตอนหน้าโหลดเสร็จ → sync อีกรอบ
  // -----------------------------
  window.addEventListener("load", function() {
    for (const fromId in FIELD_MAP) {
      const toId = FIELD_MAP[fromId];
      syncField(fromId, toId);
    }
  });

})();
