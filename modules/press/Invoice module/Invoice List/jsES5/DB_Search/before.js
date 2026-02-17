/**
 * ดึงข้อมูล Config ของระบบจากตาราง TLN_M_HANYO_CODE_MAIN
 * - ดึงค่า DSP1, DSP3, DSP4 ซึ่งเก็บค่าต่าง ๆ ของระบบ
 *   - DSP1 → DOMAIN_GA (Private IP ของ GA)
 *   - DSP3 → USERKEY  (User Key ของ GA)
 *   - DSP4 → DOMAIN_GA (Domain Name ของ GA)
 *   - DSP5 → DOMAIN_TLN (Domain Name ของ TALON)
 */
var searchData = TALON.getConditionData();
var sql = "SELECT DSP1, DSP3, DSP4, DSP5 FROM [TLN_M_HANYO_CODE_MAIN] " +
          "WHERE [SIKIBETU_CODE] = 'DMTT_G_GA_TLN_API' ";
var config = TalonDbUtil.select(TALON.getDbConfig(), sql)[0];

var _DOMAIN_GA_PRIVATE  = config["DSP4"];
var _DOMAIN_GA_PUBLIC   = config["DSP1"];

var _DOMAIN_TLN = config["DSP5"];

/* ====================================================== */

/**
 * เก็บค่า DOMAIN ต่าง ๆ ลงใน Cache ของ TALON
 * - DOMAIN_GA → เก็บค่า URL ของ GA
 * - DOMAIN_TLN → เก็บค่า URL ของ TALON
 */
TALON.putBindValue('DOMAIN_GA', _DOMAIN_GA_PRIVATE);
TALON.putBindValue('DOMAIN_TLN', _DOMAIN_TLN);
TALON.setSearchConditionData("DOMAIN_GA", _DOMAIN_GA_PUBLIC, "");
TALON.setSearchConditionData("DOMAIN_TLN", _DOMAIN_TLN, "");


/* ====================================================== */

/**
 * ตรวจสอบว่าใน Search Condition (Screen) มีค่า OTP หรือไม่
 * - ถ้าไม่มีค่า OTP:
 *   → แสดงปุ่ม Authorize GA และซ่อน Interface GA
 * - ถ้ามีค่า OTP:
 *   → ดึงค่าที่ต้องใช้ (OTP, USERKEY, COMPANY, GAUSERCODE) 
 *     แล้วเก็บลงใน Cache ของ TALON
 */
if (!searchData || !searchData['OTP']) {
    TALON.setSearchConditionData("DISPLAY", '1', "");
    //TALON.addWornMsg("⚠️ Please Click 'Authorize GA' button first. ");
} else {
    var _OTP        = searchData['OTP'];
    var _USERKEY    = config["DSP3"];
    var _COMPANY    = searchData['COMPANY'];
    var _GAUSERCODE = searchData['GAUSERCODE'];

    // เก็บค่าที่ต้องใช้สำหรับการ Auth
    TALON.putBindValue('OTP', _OTP);
    TALON.putBindValue('USERKEY', _USERKEY);
    TALON.putBindValue('COMPANY', _COMPANY);
    TALON.putBindValue('GAUSERCODE', _GAUSERCODE);
}