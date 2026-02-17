document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        let status = document.getElementById('CNDTN_STD:2:_TEXT').value; // OTP
        if (status !== '') {
            // Get Fech Token button
            /*console.log('on Fech Token button');*/
            document.getElementById('BUTTON_MDL_L:2:BAT').click();
        }
    }, 700)
});



// Receive OTP : id="BUTTON_BTM_L:2:BAT"
function onLoginGA() {
    const DOMAIN_TALON = document.getElementsByName('CNDTN_DOMAIN_TLN')[0].value; 
    const DOMAIN_GA = document.getElementsByName('CNDTN_DOMAIN_GA')[0].value; 
    const redirectToGA = `${DOMAIN_GA}/Authentication?re_url=${DOMAIN_TALON}/PRESSLogin.html`;

    // console.log("Redirecting to GA:", redirectToGA);
    setTimeout( () => {
        window.location.href = redirectToGA;
    }, 200);
    
}

// Authorize GA : id="BUTTON_BTM_L:0:BAT"
function authGetFechToken() {
    let btn = document.getElementById('BUTTON_MDL_L:1:BAT');
    if (btn) {
        btn.click();
    }
}


function onCheckboxClick(chk, blockNo, isLvl, pkey, skey, tkey) {
    SelectChk.click(chk, blockNo, isLvl, pkey, skey, tkey);
}

function resizeContents_end() {
    Array.from(document.getElementsByClassName("selectionTableRow"))
        .forEach(chk =>
            chk.addEventListener("change", onCheckboxClick)
        );

    if (document.getElementById('EVENT_STATUS').value === 'JAVASCRIPT_BTN') {
        SelectChk.clear();
    }


  // document.getElementById('BUTTON_MDL_L:1:BAT').style.display = 'none'; // Receive OTP
  // document.getElementById('BUTTON_MDL_L:2:BAT').style.display = 'none'; // Get Fech Token
  

  const status = document.getElementsByName('CNDTN_DISPLAY')[0]; 
  const authorizeGA = document.getElementById('BUTTON_MDL_L:0:BAT'); // Authorize GA
  const interfaceGA = document.getElementById('BUTTON_MDL_L:3:BAT'); // Interface to GA
  const cancel = document.getElementById('BUTTON_MDL_L:4:BAT');      // Cancel Interface

  const otp = document.getElementsByName('CNDTN_OTP')[0];
  console.log(otp.value);    

  function updateBTNDisplay() {
    if (!status) return;

    if (status.value == '1') {
        authorizeGA.style.display = 'block';
        interfaceGA.style.display = 'none';
        cancel.style.display = 'none';
    } else if (status.value == '0') {
        authorizeGA.style.display = 'none';
        interfaceGA.style.display = 'block';
        cancel.style.display = 'block';
    } else {
        authorizeGA.style.display = 'none';
        interfaceGA.style.display = 'none';
        cancel.style.display = 'none';
    }

  }

  // updateBTNDisplay();

}