var checkbox = %2_CHK%;

if (checkbox) {
    checkbox.addEventListener('focusout', function() {
        onCheckboxClick(this, 2);
    });
    
    const event = new FocusEvent("focusout", {
        bubbles: true,
        cancelable: true
    });
    checkbox.dispatchEvent(event);
}
