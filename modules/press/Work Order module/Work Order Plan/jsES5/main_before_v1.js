var searchData = TALON.getConditionData();
var NewData       = TALON.getBlockData_List(2)[0];
var UserInfo   = TALON.getUserInfoMap();
var UserId     = UserInfo['USER_ID'];
var ProgramNM  = UserInfo['FUNC_ID'];
var getDate    = new java.util.Date();
var now        = DateFmt.formatDate(getDate.toString());

var logId = RunningNo.genId("DMTT_N_TL_WO", "LWOyyyymmxxxxx", false);


var sql =
    "SELECT " +
    "    CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS [Result] " +
    "FROM [T_PR_WOH_TEMP] " +
    "WHERE [I_WO] = '" + logId + "'";
var isReady = TalonDbUtil.select(TALON.getDbConfig(), sql )[0]['Result'];

if (isReady == 0) { 

  var dataCol = [
    'I_WO',
    'I_ITEMCODE',
    'I_PLAN_START',
    'I_PLAN_FINISHED',
    
    'CREATED_DATE',
    'CREATED_BY',
    'CREATED_PRG_NM',
    'UPDATED_DATE',
    'UPDATED_BY',
    'UPDATED_PRG_NM',
    'MODIFY_COUNT'
  ];
  
  //var NewData = {};
  NewData['I_WO']            = logId;
  // NewData['I_PLAN_START']    = Data['I_PLAN_START'];
  // NewData['I_PLAN_FINISHED'] = Data['I_PLAN_FINISHED'];
  NewData['I_ITEMCODE']      = searchData['I_ITEMCODE'];
  NewData['CREATED_DATE']    = now;
  NewData['CREATED_BY']      = UserId;
  NewData['CREATED_PRG_NM']  = ProgramNM;
  NewData['UPDATED_DATE']    = now;
  NewData['UPDATED_BY']      = UserId;
  NewData['UPDATED_PRG_NM']  = ProgramNM;
  NewData['MODIFY_COUNT']    = 0;

  TALON.addMsg(JSON.stringify(NewData));
  TALON.addMsg(NewData);
  // TALON.addMsg(typeof Data);
  // TALON.addMsg(Data.getClass()); 
  
  TalonDbUtil.insertByMap(
    TALON.getDbConfig(),
    'T_PR_WOH_TEMP', // TABLE_NAME
    NewData,
    dataCol
  );
  TALON.setSearchConditionData("I_TRANSECTION", logId, "");
  TALON.addMsg('Click close button to Create Work Order Plan Screen');
  
}