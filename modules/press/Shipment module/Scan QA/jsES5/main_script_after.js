var UserInfo = TALON.getUserInfoMap();
var UserId = UserInfo["USER_ID"];
var ProgramNM = UserInfo["FUNC_ID"];
var now = new java.util.Date();
var data = TALON.getBlockData_List(2);

TALON.addMsg(data)

// target_mask