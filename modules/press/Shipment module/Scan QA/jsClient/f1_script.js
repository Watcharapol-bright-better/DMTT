// function onChangeSI() {
//     const cardSI = document.getElementById('TLN_1_SISCAN');
//     const searchSI = getElementByName('CNDTN_SISCAN');
    
//     cardSI.addEventListener("change", function(event) {
//       // Code to execute when the value changes
//       searchSI.value = cardSI.value;
//     });
// }

function focusFirstEmpty() {
  const order = [
    document.getElementById("TLN_1_SISCAN"),
    document.getElementById("TLN_1_PKSCAN")
  ];

  for (const el of order) {
    if (el && el.value.trim() === "") {
      focusNext(el);
      break;
    }
  }
}

function onchangePKNo () {
    const shipInput = document.getElementById("TLN_1_SISCAN");
    const pkInput = document.getElementById("TLN_1_PKSCAN");
    
    if (!shipInput || !pkInput) return;
    
    setTimeout(() => focusFirstEmpty(), 0);
    
    shipInput.addEventListener("keyup", function (event) {
        // if(event.key = "Enter") {
        console.log("Key pressed:", event.key);
        console.log("shipInput.value up: " + shipInput.value);
        onClickSearch();
        focusNext(pkInput);    
        // }
    });
    
    
    let pkValue = "";
    let pkNo = getElementByName('CNDTN_PKSCAN');

    pkInput.addEventListener("keyup", function (event) {
        console.log("Key pressed:", event.key);
        // console.log("shipInput.value up: " + shipInput.value);
        // console.log("pkInput.value up: " + pkInput.value)
        // pkValue += pkInput.value + ",";
        // pkNo.value += pkValue;
        // pkNo.value.slice(0, -1);
        // onClickSearch();
        
        
        let scannedValue = pkInput.value.trim();
        if (!scannedValue) return;
    
        // Get existing values as array (remove empty values)
        let existingValues = pkNo.value
            ? pkNo.value.split(',').filter(v => v.trim() !== '')
            : [];
        
        // Check duplicate
        if (existingValues.includes(scannedValue)) {
            alert("PK already scanned!");
            pkInput.value = '';
            focusNext(pkInput);
            // return;
        }
    
        // Add new value
        existingValues.push(scannedValue);
        pkNo.value = existingValues.join(',');
    
        pkInput.value = '';
        onClickSearch();
    });
    
    pkInput.addEventListener("keydown", function (event) {
        console.log("Key pressed:", event.key);
        // console.log("shipInput.value up: " + shipInput.value);
        // console.log("pkInput.value down: " + pkInput.value)
         pkInput.value = '';
        // focusNext(pkInput); 
    });
    
}

function onClickSearch() {
  console.log("Search button clicked");
  document.getElementById("BUTTON_MDL_R:1:POS_SEARCH_BTN").click();
//   focusNext(pkInput);
}

function focusNext(el) {
  if (!el) return;
  el.setAttribute("readonly", "readonly");
  el.focus({ preventScroll: true });
  setTimeout(() => el.removeAttribute("readonly"), 50);
}

function resizeContents_end() {
    var _event = document.getElementById("EVENT_STATUS");
    const shipInput = document.getElementById("TLN_1_SISCAN");
    
    if(_event.value == 'NEXT_FUNC') {
        focusNext(shipInput);
    }

    // const _event = document.getElementById('EVENT_STATUS');
    
    console.log(_event.value)

    if(_event.value == 'SEARCH' || _event.value == 'UPDATE') {
        document.getElementById('TLN_1_SISCAN').value = getElementByName('CNDTN_SISCAN').value
    }
    
    onchangePKNo();
    // onChangeSI();
}