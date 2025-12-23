


function resizeContents_end() {

    function setDataAllRow(selectorPrefix) {
        const rowNoBoxes = document.querySelectorAll(`input[name^="${selectorPrefix}"]`);
        if (rowNoBoxes.length > 0) {
            let rowIndex = document.getElementsByName('CNDTN_I_ASSIGNTO')[0].value;
            rowNoBoxes.forEach((input) => {
                if (!input.value.trim()) {
                    input.value = rowIndex.toString();
                }
            });
        }
    }
    
    setDataAllRow("1_I_ASSIGNTO_");  

}


document.querySelectorAll(`input[id^="TLN_1_I_ASSIGNTO_"]`)

