function loadQRCodeLib(callback) {
    if (window.QRCode) {
        callback();
        return;
    }

    const script = document.createElement('script');
    script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = callback;

    document.head.appendChild(script);
}

 function updateBoxHeight() {
    function removeHeight(id) {
       const el = document.getElementById(id);
       if (el) {
          el.style.removeProperty("height");
       }
    }

    // Box Card 0
    removeHeight("BASE:0:block");

    const baseCard = document.getElementById("BASE:0:CARD");
    if (baseCard) {
       baseCard.setAttribute("style", "overflow: auto;");
    }

    for (let i = 1; i <= 2; i++) {
       removeHeight(`box${i}`);
       removeHeight(`BASE:${i}:block`);
       removeHeight(`tbl_scrollable_body_L_${i}`);
    }
 }
 
function applyButtonStyle() {
    const btn = document.getElementById('TLN_1_b_CALL_JAVASCRIPT');
    if (!btn) return;

    btn.style.backgroundColor = '#335BA6';
    btn.style.color = '#ffffff';
    btn.style.borderRadius = '4px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'all 0.15s ease';

    btn.onmouseenter = () => {
        btn.style.backgroundColor = '#5e8bd1';
    };

    btn.onmouseleave = () => {
        btn.style.backgroundColor = '#335BA6';
    };

    btn.onmousedown = () => {
        btn.style.transform = 'scale(0.95)';
    };

    btn.onmouseup = () => {
        btn.style.transform = 'scale(1)';
    };

    btn.onmouseout = () => {
        btn.style.transform = 'scale(1)';
    };
}

function boxQRcode() {
    if (!window.QRCode) return;

    const container = document.getElementById('search_condition');
    if (!container) return;

    const inputEl =
        document.getElementsByName('CNDTN_I_SHIP_INST')[0];
    if (!inputEl || !inputEl.value) return;

    let qrBox = document.getElementById('QR_BOX');
    if (qrBox) {
        qrBox.remove();
    }

    qrBox = document.createElement('div');
    qrBox.id = 'QR_BOX';

    qrBox.style.width = '90px';
    qrBox.style.height = '90px';
    qrBox.style.position = 'absolute';
    qrBox.style.right = '50px';
    qrBox.style.top = '10px';
    qrBox.style.backgroundColor = '#ffffff';
    qrBox.style.border = '1px solid #ccc';
    qrBox.style.borderRadius = '4px';
    qrBox.style.display = 'flex';
    qrBox.style.alignItems = 'center';
    qrBox.style.justifyContent = 'center';

    container.style.position = 'relative';
    container.appendChild(qrBox);

    new QRCode(qrBox, {
        text: inputEl.value,
        width: 80,
        height: 80,
        correctLevel: QRCode.CorrectLevel.H
    });

    container.style.minHeight =
        container.offsetHeight + 40 + 'px';
}

function resizeContents_end() {
    applyButtonStyle();
    updateBoxHeight();
    loadQRCodeLib(boxQRcode);
}
