var searchData  = TALON.getConditionData();
var DataList    = TALON.getBlockData_List(2);
var UserInfo    = TALON.getUserInfoMap();
var UserId      = UserInfo['USER_ID'];
var ProgramNM   = UserInfo['FUNC_ID'];
var getDate     = new java.util.Date();
var now         = DateFmt.formatDate(getDate.toString());


var logId = RunningNo.genId("DMTT_N_TL_WO", "LWOyyyymmxxxxx", false);

//TALON.addMsg(DataList);

DataList.forEach(function(Data) {
  var sql =
    "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS [Result] " +
    "FROM [T_PR_WOH_TEMP] " +
    "WHERE [I_WO] = '" + logId + "'";
  var isReady = TalonDbUtil.select(TALON.getDbConfig(), sql)[0]['Result'];
  
  var startDate = DateFmt.formatDate(Data['I_PLAN_START'].toString());
  var finishedDate = DateFmt.formatDate(Data['I_PLAN_FINISHED'].toString());
  
  //TALON.addMsg('Data ' + Data)
  if (isReady == 0) {
    var insertSql = 
      "INSERT INTO [T_PR_WOH_TEMP] (" +
      "  [I_WO]" +
      " ,[I_ITEMCODE]" +
      " ,[I_PLAN_START]" +
      " ,[I_PLAN_FINISHED]" +
      " ,[CREATED_DATE]" +
      " ,[CREATED_BY]" +
      " ,[CREATED_PRG_NM]" +
      " ,[UPDATED_DATE]" +
      " ,[UPDATED_BY]" +
      " ,[UPDATED_PRG_NM]" +
      " ,[MODIFY_COUNT]" +
      ") VALUES (" +
      "  '" + logId + "'" +
      " ,'" + searchData['I_ITEMCODE'] + "'" +
      " ,'" + startDate + "'" +
      " ,'" + finishedDate + "'" +
      " , '"+ now +"'" +
      " ,'" + UserId + "'" +
      " ,'" + ProgramNM + "'" +
      " , '"+ now +"'" +
      " ,'" + UserId + "'" +
      " ,'" + ProgramNM + "'" +
      " , 0" +
      ")";

    TALON.addMsg("SQL: " + insertSql);
    
    var result = TalonDbUtil.insert(TALON.getDbConfig(), insertSql);
    TALON.addMsg('Result: ' + result);
    
    TALON.setSearchConditionData("I_TRANSECTION", logId, "");
    TALON.addMsg('Click close button to Create Work Order Plan Screen');
  }
});