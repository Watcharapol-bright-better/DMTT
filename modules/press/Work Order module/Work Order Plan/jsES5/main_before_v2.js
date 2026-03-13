var searchData  = TALON.getConditionData();
var DataList    = TALON.getBlockData_List(2);
var UserInfo    = TALON.getUserInfoMap();
var UserId      = UserInfo['USER_ID'];
var ProgramNM   = UserInfo['FUNC_ID'];
var getDate     = new java.util.Date();
var now         = DateFmt.formatDate(getDate.toString());

var logId = RunningNo.genId("DMTT_N_TL_WO", "LWOyyyymmxxxxx", false);

TALON.addMsg(DataList);

DataList[0].forEach(function(Data) {
  var sql =
    "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS [Result]" +
    "FROM [T_PR_WOH_TEMP] " +
    "WHERE [I_WO] = '" + logId + "'";
  var isReady = TalonDbUtil.select(TALON.getDbConfig(), sql)[0]['Result'];

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

    Data['I_WO']            = logId;
    Data['I_ITEMCODE']      = searchData['I_ITEMCODE'];
    Data['CREATED_DATE']    = now;
    Data['CREATED_BY']      = UserId;
    Data['CREATED_PRG_NM']  = ProgramNM;
    Data['UPDATED_DATE']    = now;
    Data['UPDATED_BY']      = UserId;
    Data['UPDATED_PRG_NM']  = ProgramNM;
    Data['MODIFY_COUNT']    = 0;

    TALON.addMsg("Data :", Data);
    TalonDbUtil.insertByMap(
      TALON.getDbConfig(),
      'T_PR_WOH_TEMP',
      Data,
      dataCol
    );
    TALON.setSearchConditionData("I_TRANSECTION", logId, "");
    TALON.addMsg('Click close button to Create Work Order Plan Screen');
  }
  
});