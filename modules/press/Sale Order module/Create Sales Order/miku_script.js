// =============================================================
// ALWAYS-NEW SONO + INSERT TO dbo.T_PR_SORD  (ES5 / Talon)
// - SONO: 'SOP' + YY + MM + running(4)  (ใหม่ทุกครั้ง, ไม่ซ้ำ)
// - กันแข่ง: SERIALIZABLE + UPDLOCK/HOLDLOCK
// - I_DLYDATE = NVARCHAR(8) 'YYYYMMDD'
// - I_UNTPRI  = DETAIL.I_SALE_UNIT
// - I_LNNO    = 1..N ใหม่ทุกครั้ง
// =============================================================
var userData = TALON.getUserInfoMap() || {};
var HEADER   = TALON.getBlockData_Card(1) || {};
var DETAIL   = TALON.getBlockData_List(2) || [];

var UserId  = (userData["USER_ID"] || "SYSTEM");
var Program = "DMTT_PRESS";

// ---------- message wrappers ----------
function info(msg){ try{
  if (TALON.addInfoMsg) TALON.addInfoMsg(msg);
  else if (TALON.addMessageInfo) TALON.addMessageInfo(msg);
  else if (TALON.addMessage) TALON.addMessage(msg);
} catch(e){} }
function errorMsg(msg){ try{
  if (TALON.addErrorMsg) TALON.addErrorMsg(msg);
  else if (TALON.addMessageError) TALON.addMessageError(msg);
  else if (TALON.addMessage) TALON.addMessage("ERROR: "+msg);
} catch(e){} }

// ---------- helpers ----------
function esc(v){ return String(v==null ? "" : v).replace(/'/g,"''"); }
function s(v){ return String(v==null ? "" : v).trim(); }
function dec0(v){
  var n = parseFloat(s(v).replace(/,/g,""));
  return (isFinite(n) && !isNaN(n)) ? n : 0;
}
function pad2(n){ return (n<10 ? "0" : "") + n; }
function toYYYYMMDD(v){
  var t = s(v); if(!t) return "NULL";
  var a = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // dd/MM/yyyy
  if (a) return "N'"+a[3]+pad2(a[2])+pad2(a[1])+"'";
  var b = t.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/); // yyyy-MM-dd or yyyy/MM/dd
  if (b) return "N'"+b[1]+pad2(b[2])+pad2(b[3])+"'";
  var d = t.replace(/\D+/g,"");
  return (d.length>=8) ? "N'"+d.substr(0,8)+"'" : "NULL";
}
function toSQLDateTimeLiteral(v){
  if (v==null) return "NULL";
  if (Object.prototype.toString.call(v)==='[object Date]' && !isNaN(v)){
    var iso = v.getFullYear()+"-"+pad2(v.getMonth()+1)+"-"+pad2(v.getDate())+" "+
              pad2(v.getHours())+":"+pad2(v.getMinutes())+":"+pad2(v.getSeconds());
    return "CONVERT(datetime, N'"+iso+"', 121)";
  }
  var t = s(v);
  var m = t.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (m){
    var iso2 = m[1]+"-"+pad2(m[2])+"-"+pad2(m[3])+" "+pad2(m[4]||0)+":"+pad2(m[5]||0)+":"+pad2(m[6]||0);
    return "CONVERT(datetime, N'"+iso2+"', 121)";
  }
  var dmy = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy){
    return "CONVERT(datetime, N'"+dmy[3]+"-"+pad2(dmy[2])+"-"+pad2(dmy[1])+" 00:00:00', 121)";
  }
  return "NULL";
}
function sqlN(v){ return "N'"+esc(v||"")+"'"; }

// ---------- header values ----------
var I_QT_NO       = s(HEADER["I_QT_NO"]);
var I_SODATE_LIT  = toSQLDateTimeLiteral(HEADER["I_SODATE"]);   // datetime
var I_COMPCLS     = s(HEADER["I_COMPCLS"] || "0");
var I_CUSTOMER_PO = s(HEADER["I_CUSTOMER_PO"]);
var I_CSODE       = s(HEADER["I_CSODE"] || HEADER["I_CSCODE"]);
var I_SHIPTO      = s(HEADER["I_SHIPTO"]);
var I_BILLTO      = s(HEADER["I_BILLTO"]);
var I_ENDUSER     = s(HEADER["I_ENDUSER"] || userData["LOGIN_USER"] || userData["USER_ID"]);
var I_CURRENCY    = s(HEADER["I_CURRENCY"]);
var I_REM1        = s(HEADER["I_REM1"]);

if (!I_QT_NO || !I_CSODE){
  errorMsg("❌ Missing required: I_QT_NO or I_CSODE.");
  TALON.setIsSuccess(false);
} else {

  // ===== 1) Generate unique SONO (always new) =====
  var now = new Date();
  var YY  = String(now.getFullYear()).slice(-2);
  var MM  = ("0"+(now.getMonth()+1)).slice(-2);
  var PREFIX = "SOP"+YY+MM;

  var sqlNext =
    "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE; BEGIN TRAN; " +
    "DECLARE @prefix NVARCHAR(10)=N'"+PREFIX+"', @n INT, @next NVARCHAR(20); " +
    "SELECT @n = ISNULL(MAX(CAST(RIGHT(I_SONO,4) AS INT)),0) " +
    "FROM dbo.T_PR_SORD WITH (UPDLOCK, HOLDLOCK) WHERE I_SONO LIKE @prefix + '%'; " +
    "WHILE 1=1 BEGIN " +
    "  SET @n = @n + 1; " +
    "  SET @next = @prefix + RIGHT(CONCAT('0000', @n),4); " +
    "  IF NOT EXISTS (SELECT 1 FROM dbo.T_PR_SORD WITH (UPDLOCK, HOLDLOCK) WHERE I_SONO = @next) BREAK; " +
    "END " +
    "COMMIT; " +
    "SELECT NEXT_SONO=@next;";

  var rs = TALON.executeSQL(sqlNext);
  var I_SONO_AUTO = PREFIX + "0001";
  if (rs && rs.rows && rs.rows[0] && rs.rows[0]["NEXT_SONO"]) I_SONO_AUTO = rs.rows[0]["NEXT_SONO"];

  // สะท้อน SO No. ใหม่บนจอ (ถ้ามีฟิลด์)
  try { if (TALON.setFieldValue) TALON.setFieldValue("I_SONO", I_SONO_AUTO); } catch(e){}

  // ===== 2) INSERT รายการ (LNNO = 1..N ใหม่ทุกครั้ง) =====
  var ln = 0, inserted = 0;

  for (var i=0; i<DETAIL.length; i++){
    var r = DETAIL[i] || {};
    var item = s(r["I_ITEMCODE"] || r["ITEMCODE"]);
    var qty  = dec0(r["I_QTY"]);
    var amt  = dec0(r["I_AMOUNT"]);

    // ข้ามแถวว่างจริง ๆ
    if (!item && qty===0 && amt===0) continue;

    ln++; // ไล่ 1..N ใน SONO ใหม่นี้

    var I_ITEMCODE = item;
    var DLYDATE_SQL= toYYYYMMDD(r["I_DLYDATE"]);   // 'YYYYMMDD' | NULL
    var I_QTY      = qty;
    var I_AMOUNT   = amt;
    var I_UNTPRI   = dec0(r["I_SALE_UNIT"]);       // Unit price from QT detail

    var sql =
      "INSERT INTO dbo.T_PR_SORD ("+
      " I_SONO, I_QT_NO, I_LNNO, I_SODATE, I_COMPCLS, I_CUSTOMER_PO,"+
      " I_CSODE, I_SHIPTO, I_BILLTO, I_ENDUSER, I_CURRENCY, I_REM1,"+
      " I_ITEMCODE, I_DLYDATE, I_QTY, I_AMOUNT, I_UNTPRI,"+
      " CREATED_DATE, CREATED_BY, CREATED_PRG_NM,"+
      " UPDATED_DATE, UPDATED_BY, UPDATED_PRG_NM, MODIFY_COUNT"+
      ") SELECT "+
      " "+sqlN(I_SONO_AUTO)+","+
      " "+sqlN(I_QT_NO)+","+
      " "+ln+","+
      " "+(I_SODATE_LIT!=='NULL' ? I_SODATE_LIT : "GETDATE()")+","+
      " "+sqlN(I_COMPCLS)+","+
      " "+sqlN(I_CUSTOMER_PO)+","+
      " "+sqlN(I_CSODE)+","+
      " "+sqlN(I_SHIPTO)+","+
      " "+sqlN(I_BILLTO)+","+
      " "+sqlN(I_ENDUSER)+","+
      " "+sqlN(I_CURRENCY)+","+
      " "+sqlN(I_REM1)+","+
      " "+sqlN(I_ITEMCODE)+","+
      " "+DLYDATE_SQL+","+
      " "+I_QTY+","+
      " "+I_AMOUNT+","+
      " "+I_UNTPRI+","+
      " GETDATE(), N'"+esc(UserId)+"', N'"+esc(Program)+"',"+
      " GETDATE(), N'"+esc(UserId)+"', N'"+esc(Program)+"', 0;";

    TalonDbUtil.executeUpdateSQL(TALON.getDbConfig(), sql);
    inserted++;
  }

  info("🆕 SO No: "+I_SONO_AUTO+" — inserted "+inserted+" row(s).");
  TALON.setIsSuccess(true);
}
