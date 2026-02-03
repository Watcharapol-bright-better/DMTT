var data = TALON.getBlockData_List(2);
var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo["USER_ID"];
var ProgramNM = UserInfo["FUNC_ID"];
var now = new java.util.Date();


var isErr = false; 

// [{I_SHIP_INST=, I_PLTNO=, I_PALLET_NO=}]
data.forEach(function(item) {
    
  var _I_SHIP_INST = item["I_SHIP_INST"]; // shipment instance No.
  var _I_PLTNO = item["I_PLTNO"];         // pallet tag
  var _I_PALLET_NO = item["I_PALLET_NO"]; // shipment mask
  var _SAMPLE_LABEL_TAG = item['SAMPLE_LABEL_TAG'];
  
  TALON.addMsg(
    "shipment instance: " + _I_SHIP_INST
    + "\nPallet Tag: " + _I_PLTNO
    + "\nShipment Mask: " + _I_PALLET_NO
    + "\nSample Label Tag: " + _SAMPLE_LABEL_TAG
  );
  
  var sql = ""
      + "SELECT "
      + "    [SI].[I_SHIP_INST] "
      + "   ,[SK].[I_PLTNO] "
      + "   ,[SI].[I_PALLET_NO] "
      + "FROM [T_PR_SHIP_INST_D] [SI] "
      + "INNER JOIN [T_PR_STOCK] [SK] "
      + "       ON [SK].[I_ITEMCODE] = [SI].[I_ITEMCODE] "
      + "WHERE [SI].[I_SHIP_INST] = '"+_I_SHIP_INST+"' ";
  var shipInfo = TalonDbUtil.select(TALON.getDbConfig(), sql);
  
  if (shipInfo.length > 0) {
    
    shipInfo.forEach(function (shipItem) {
      
      var isPalletNoMatched = (shipItem["I_PLTNO"] === _I_PLTNO);
      var isPalletTagMatched = (shipItem["I_PALLET_NO"] === _I_PALLET_NO);
      
      // Unmatched - ถ้า Shipping Mask หรือ Pallet Tag ไม่ตรงกัน
      if (!isPalletNoMatched || !isPalletTagMatched) {
        isErr = true;
      } else {
        isErr = false;
        
        var sqlUpdate = ""
            + "UPDATE [T_PR_SHIP_INST_D] "
            + "SET [I_QA_STATUS] = '1', "
            + "    [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, "
            + "    [UPDATED_DATE]  = GETDATE(), " 
            + "    [CREATED_PRG_NM]= '" + ProgramNM + "', " 
            + "    [CREATED_BY]    = '" + UserId + "' " 
            + "WHERE [I_SHIP_INST] = '"+_I_SHIP_INST+"' "
            // + "AND [I_PLTNO] = '"+_I_PLTNO+"' "
            + "AND [I_PALLET_NO] = '"+_I_PALLET_NO+"' ";
        // TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);
      }
      
    });

  } else {
    isErr = true;
  }
});

if (isErr) {
  TALON.addMsg("⚠️ Shipment Instruction, Shipping Mask, and Pallet Tag not matched");
} else {
  TALON.addMsg("✅ Confirmed QA successfully");
}