var checkbox = %2_CHK%;
var header = %2_I_COMPCLS%;

console.log(header.value);

if (checkbox) {
    checkbox.addEventListener('focusout', function() {
        if (header.value == '') {
            /*console.log('Click Header');*/
            initAutoSelectByItem('2','CHK','I_SONO','SELECTED');
        } else if (header.value != '') {
            /*console.log('Click Detail');*/
            onCheckboxClick(this, 2);
        }
    });


    const event = new FocusEvent("focusout", {
        bubbles: true,
        cancelable: true
    });
    checkbox.dispatchEvent(event);
}
