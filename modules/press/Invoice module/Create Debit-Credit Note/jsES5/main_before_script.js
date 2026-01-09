var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var sdfDisplay = new SimpleDateFormat("yyyy-MM-dd");

var searchData = TALON.getConditionData();
var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];
var now       = new java.util.Date();


if (searchData.I_SHIP_INST === '') {




}

