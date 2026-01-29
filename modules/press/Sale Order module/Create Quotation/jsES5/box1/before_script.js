var data = TALON.getTargetData();

var err_flg = true;
var _I_QT_MTH = data['I_QT_MTH'];       // Quotation Month
var _I_PO_MONTH = data['I_PO_MONTH'];   // Customer PO Month
var _I_EXG_MONTH = data['I_EXG_MONTH']; // Delivery Month

if (!_I_QT_MTH || !_I_PO_MONTH) {
  
  if (!_I_QT_MTH || !_I_PO_MONTH) {
    TALON.addErrorMsg('⚠️ Quotation Month and Customer PO Month are required fields.');
    TALON.setIsSuccess(false);
  } else if (!_I_QT_MTH) {
    TALON.addErrorMsg('⚠️ Quotation Month is required.');
    TALON.setIsSuccess(false);
  } else if (!_I_PO_MONTH) {
    TALON.addErrorMsg('⚠️ Customer PO Month is required.');
    TALON.setIsSuccess(false);
  }
  
} else {
    var qt_mth = DateFmt.formatDate(_I_QT_MTH.toString());
    var po_mth = DateFmt.formatDate(_I_PO_MONTH.toString());
    var dly_mth = DateFmt.formatDate(_I_EXG_MONTH.toString());
    
    var qt_date = new Date(qt_mth);
    var po_date = new Date(po_mth);
    var dly_date = new Date(dly_mth);
  
    
    //TALON.addMsg('Quotation Month: ' + qt_mth);
    //TALON.addMsg('Customer PO Month: ' + po_mth);
    
    if (po_date < qt_date) {
        err_flg = false;
        TALON.addErrorMsg('⚠️ PO Month must be >= Quotation Month');
    }
  
    if (dly_date < qt_date) {
        err_flg = false;
        TALON.addErrorMsg('⚠️ Delivery Month must be >= Quotation Month');
    }
    
    TALON.setIsSuccess(err_flg);
}