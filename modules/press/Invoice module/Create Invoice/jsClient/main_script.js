

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        
       let obj = document.getElementById('JKN_AREA');
        if (obj) obj.style.display = 'none';

    }, 200);
});


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


function resizeContents_end() {

    let obj = document.getElementById('JKN_AREA');
    if (obj) obj.style.display = 'none';

    updateBoxHeight();
}
