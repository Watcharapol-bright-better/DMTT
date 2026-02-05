let qtyObj = %2_I_QTY%;
let priceObj = %2_I_UNTPRI%;
let totalObj = %2_I_AMOUNT%;

if (qtyObj) {

    qtyObj.addEventListener('keyup', function() {
        
        let nQty= qtyObj.value.replace(/[^\d\.]/g,'');
        let nUnit = priceObj.value.replace(/[^\d\.]/g,'');
        if (nQty != 0) {
            let sum = (nQty * nUnit);
            totalObj.value = sum;
        }

    });

    const event = new Event('keyup', { bubbles: true });
    qtyObj.dispatchEvent(event);

}
