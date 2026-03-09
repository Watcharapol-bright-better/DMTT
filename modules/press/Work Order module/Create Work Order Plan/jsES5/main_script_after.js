var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var now = new java.util.Date();

var searchData = TALON.getConditionData();
var HeaderData = TALON.getBlockData_Card(1);
var FGDetailData = TALON.getBlockData_List(2);
var RMData = TALON.getBlockData_List(3);
var PrcsData = TALON.getBlockData_List(4);

var selectedItem = [];
RMData.forEach(function(item) {
  if (item['I_PICK_FLG'] === "1") {
    selectedItem.push(item);
  }
});

var hasError = false;

if (selectedItem.length > 1) {
  var priorityMap = {};

  for (var i = 0; i < selectedItem.length; i++) {
    var priority = parseInt(selectedItem[i]['I_PRIORITY'], 10);

    if (!priority || priority <= 0) {
      TALON.addErrorMsg("⚠️ Priority must be greater than 0");
      hasError = true;
    }

    if (priorityMap[priority]) {
      TALON.addErrorMsg("⚠️ Duplicate priority is not allowed");
      hasError = true;
    }

    priorityMap[priority] = true;
  }
}

var planStart = new Date(DateFmt.formatDateTime(HeaderData['I_PLAN_START'].toString()));

var planFinished = new Date(HeaderData['I_PLAN_FINISHED']);

//var planFinished = new Date(DateFmt.formatDateTime(HeaderData['I_PLAN_FINISHED']));

TALON.addMsg("planStart = " + planStart);
TALON.addMsg("planFinished = " + planFinished);


// เช็คว่า I_PLAN_START ต้องมาก่อน I_PLAN_FINISHED
if (planStart >= planFinished) {
    TALON.addErrorMsg("⚠️ Plan Start Date must be before Plan Finished Date");
    hasError = true;
}

// TALON.addMsg(FGDetailData[0]['I_DLY_DATE']);
var dlyDate = FGDetailData[0]['I_DLY_DATE'];
if (dlyDate != null) {
  var deliveryDate = new Date(DateFmt.formatDateTime(dlyDate.toString()));
  
  // I_DLY_DATE ต้องอยู่หลัง I_PLAN_FINISHED
  if (deliveryDate <= planFinished) {
    TALON.addErrorMsg("⚠️ Delivery Date must be after Plan Finished Date");
    hasError = true;
  }
}

if (hasError) {
  TALON.setIsSuccess(false);
}


var _I_WO = HeaderData['I_WO'];
if (_I_WO == '' && !hasError) {

  var woNo = RunningNo.genId("DMTT_N_WO", "WOyyMM-xx", false);
  var HeaderCol = [
    'I_WO',
    'I_PLAN_START',
    'I_PLAN_FINISHED',
    'I_PR_MACHINE',
    'I_WODATE',
    'I_CUSTOMER',
    'I_WO_TYPE',
    'I_ITEMCODE',
    'I_WO_QTY',
    'I_DLY_DATE',
    'I_REQ_COIL',
    'I_COMPLETE_FLG',
    
    'CREATED_DATE',
    'CREATED_BY',
    'CREATED_PRG_NM',
    'UPDATED_DATE',
    'UPDATED_BY',
    'UPDATED_PRG_NM',
    'MODIFY_COUNT'
  ];
  
  HeaderData['I_WO'] = woNo;
  HeaderData['I_COMPLETE_FLG'] = '0';
  
  HeaderData['I_PLAN_START'] = DateFmt.formatDateTime(HeaderData['I_PLAN_START'].toString());
  HeaderData['I_PLAN_FINISHED'] = DateFmt.formatDateTime(HeaderData['I_PLAN_FINISHED'].toString());
  HeaderData['I_WODATE'] = DateFmt.formatDateTime(HeaderData['I_WODATE'].toString());
  HeaderData['I_CUSTOMER'] = HeaderData['I_CSCODE'];
  HeaderData['I_ITEMCODE'] = FGDetailData[0]['I_ITEMCODE'];
  HeaderData['I_WO_QTY'] = Number(FGDetailData[0]['I_WO_QTY']);
  HeaderData['I_DLY_DATE'] = FGDetailData[0]['I_DLY_DATE'] ? DateFmt.formatDateTime(FGDetailData[0]['I_DLY_DATE'].toString()) : null;
  HeaderData['I_REQ_COIL'] = FGDetailData[0]['I_REQ_COIL'];
  
  HeaderData['CREATED_DATE'] = DateFmt.formatDateTime(now.toString());
  HeaderData['CREATED_BY'] = UserId;
  HeaderData['CREATED_PRG_NM'] = ProgramNM;
  HeaderData['UPDATED_DATE'] = DateFmt.formatDateTime(now.toString());
  HeaderData['UPDATED_BY'] = UserId;
  HeaderData['UPDATED_PRG_NM'] = ProgramNM;
  HeaderData['MODIFY_COUNT'] = 0;
  
  TalonDbUtil.insertByMap(
    TALON.getDbConfig(),
    'T_PR_WOH',
    HeaderData,
    HeaderCol
  );


  // =======================================
  var DetailCol1 = [
    'I_WO',
    'I_LNNO',
    'I_PICK_FLG',
    'I_COILNO',
    'I_CUTNO',
    'I_HOOPNO',
    'I_WO_COILNO',
    'I_WO_CUTNO',
    'I_WO_HOOPNO',
    'I_COIL_BK',
    'I_PRIORITY',
    'I_WEIGHT',
    'I_LOCATION',
  
    'CREATED_DATE',
    'CREATED_BY',
    'CREATED_PRG_NM',
    'UPDATED_DATE',
    'UPDATED_BY',
    'UPDATED_PRG_NM',
    'MODIFY_COUNT'
  ];

  var DetailCol2 = [
    'I_WO',
    'I_COIL_SEQ',
    'I_ITEMCODE',
    'I_COILNO',
    'I_CUT_NO',
    'I_HOOPNO',
    'I_COIL_BK',
    
    'CREATED_DATE',
    'CREATED_BY',
    'CREATED_PRG_NM',
    'UPDATED_DATE',
    'UPDATED_BY',
    'UPDATED_PRG_NM',
    'MODIFY_COUNT'
  ];


  // RM SELECTED (Material Picked)
  var rmLn = 1;
  var partNo = FGDetailData[0]['I_ITEMCODE'];
  selectedItem.forEach(function(rm) {
    
    // ---------- T_PR_WOUSEMAT ----------
    var rowM = {};
  
    rowM['I_WO'] = woNo;
    rowM['I_LNNO'] = rmLn;
    rowM['I_PICK_FLG'] = '1';
    rowM['I_COILNO'] = rm['I_COILNO'];
    rowM['I_CUTNO'] = rm['I_CUTNO'];
    rowM['I_HOOPNO'] = rm['I_HOOPNO'];
  
    rowM['I_WO_COILNO'] = rm['RM_WO'];
    rowM['I_WO_CUTNO'] = rm['RM_WO'];
    rowM['I_WO_HOOPNO'] = rm['RM_WO'];
  
    rowM['I_COIL_BK'] = '1';
    rowM['I_PRIORITY'] = rm['I_PRIORITY'];
    rowM['I_WEIGHT'] = rm['I_CUR_WGT'];
  
    rowM['I_LOCATION'] = rm['I_LOCCD'];
  
    rowM['CREATED_DATE'] = DateFmt.formatDateTime(now.toString());
    rowM['CREATED_BY'] = UserId;
    rowM['CREATED_PRG_NM'] = ProgramNM;
    rowM['UPDATED_DATE'] = DateFmt.formatDateTime(now.toString());
    rowM['UPDATED_BY'] = UserId;
    rowM['UPDATED_PRG_NM'] = ProgramNM;
    rowM['MODIFY_COUNT'] = 0;
  
    TalonDbUtil.insertByMap(
      TALON.getDbConfig(),
      'T_PR_WOUSEMAT',
      rowM,
      DetailCol1
    );
  
  
    // ---------- T_PR_WR_DTL ----------
    var rowD = {};
  
    rowD['I_WO'] = woNo;
    rowD['I_COIL_SEQ'] = rmLn;
    rowD['I_ITEMCODE'] = partNo;
  
    rowD['I_COILNO'] = rm['I_COILNO'];
    rowD['I_CUT_NO'] = rm['I_CUTNO'];
    rowD['I_HOOPNO'] = rm['I_HOOPNO'];
    rowD['I_COIL_BK'] = '1';
  
    rowD['CREATED_DATE'] = DateFmt.formatDateTime(now.toString());
    rowD['CREATED_BY'] = UserId;
    rowD['CREATED_PRG_NM'] = ProgramNM;
    rowD['UPDATED_DATE'] = DateFmt.formatDateTime(now.toString());
    rowD['UPDATED_BY'] = UserId;
    rowD['UPDATED_PRG_NM'] = ProgramNM;
    rowD['MODIFY_COUNT'] = 0;
  
    TalonDbUtil.insertByMap(
      TALON.getDbConfig(),
      'T_PR_WR_DTL',
      rowD,
      DetailCol2
    );
  
    rmLn++;
  
  });
  

  if (PrcsData && PrcsData.length > 0) {
  
    var prcsCol = [
      'I_WO',
      'I_SEQ',
      'I_PRCSCD',
      'I_PLN_STR_DATE',
      'I_PLN_END_DATE',
  
      'CREATED_DATE',
      'CREATED_BY',
      'CREATED_PRG_NM',
      'UPDATED_DATE',
      'UPDATED_BY',
      'UPDATED_PRG_NM',
      'MODIFY_COUNT'
    ];
  
    PrcsData.forEach(function(pr) {
  
      var prRow = {};
      prRow['I_WO'] = woNo;
      prRow['I_SEQ'] = 1;
      prRow['I_PRCSCD'] = pr['I_PRCSCD'];
  
      prRow['I_PLN_STR_DATE'] = DateFmt.formatDateTime(pr['I_PLN_STR_DATE'].toString());
      prRow['I_PLN_END_DATE'] = DateFmt.formatDateTime(pr['I_PLN_END_DATE'].toString());
  
      prRow['CREATED_DATE'] = DateFmt.formatDateTime(now.toString());
      prRow['CREATED_BY'] = UserId;
      prRow['CREATED_PRG_NM'] = ProgramNM;
      prRow['UPDATED_DATE'] = DateFmt.formatDateTime(now.toString());
      prRow['UPDATED_BY'] = UserId;
      prRow['UPDATED_PRG_NM'] = ProgramNM;
      prRow['MODIFY_COUNT'] = 0;
  
      TalonDbUtil.insertByMap(
        TALON.getDbConfig(),
        'T_PR_WOPRCS',
        prRow,
        prcsCol
      );
  
    });
  
  }  
  
  
  var result = runSP('SP_DMTT_L_PR_WO', woNo);
  if (result.status) {
    TALON.addMsg("✅ Created WO Successfully: " + woNo);
    TALON.setSearchConditionData("I_WO", woNo, "");
  } else { 
    TALON.addErrorMsg(result.msg);
    TALON.setIsSuccess(false);
  }
}


function runSP(procName, ref_no) {
  var params = [];
  params['I_WO'] = ref_no;
  params['O_RESULT'] = '';

  var outputParams = ['O_RESULT'];
  var result = TalonDbUtil.prepareCall(
    TALON.getDbConfig(),
    procName,
    params,
    outputParams
  );

  return JSON.parse(result[0]);
}