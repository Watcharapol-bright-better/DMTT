let qtyObj = %2_I_QTY%;
let priceObj = %2_I_SELLING_PRICE%;
let totalObj = %2_I_AMOUNT%;

if (qtyObj) {

    qtyObj.addEventListener('keyup', function() {
        
        let nQty= qtyObj.value.replace(/[^\d\.]/g,'');
        let nUnit = priceObj.value.replace(/[^\d\.]/g,'');
        if (nQty != 0) {
            let sum = (nQty * nUnit);
            let result = addComma(sum);
            console.log(result);
            totalObj.value = result
        }

    });

    const event = new Event('keyup', { bubbles: true });
    qtyObj.dispatchEvent(event);

}

