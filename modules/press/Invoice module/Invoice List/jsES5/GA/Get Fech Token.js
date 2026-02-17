
var URI = Java.type('java.net.URI');
var HttpClient = Java.type('java.net.http.HttpClient');
var HttpRequest = Java.type('java.net.http.HttpRequest');
var HttpResponse = Java.type('java.net.http.HttpResponse');


/**
 * ดึงค่าจาก Cache ของ TALON 
 * - ใช้สำหรับระบุตัวตนของผู้ใช้และระบบ
 * - OTP (One-Time Password) จะถูกนำมาใช้เพื่อขอ Refresh Token ใหม่
 */
var _OTP        = TALON.getBindValue('OTP');
var _COMPANY    = TALON.getBindValue('COMPANY');
var _GAUSERCODE = TALON.getBindValue('GAUSERCODE');
var _DOMAIN_GA  = TALON.getBindValue('DOMAIN_GA');

var onetimepass = _OTP;
var company     = _COMPANY;
var usercode    = _GAUSERCODE;

var client = HttpClient.newHttpClient();


/* ====================================================== */

/**
 * เตรียมข้อมูล Payload เพื่อขอ Refresh Token
 * - company     → รหัสบริษัท
 * - usercode    → รหัสผู้ใช้งาน GA
 * - onetimepass → OTP ที่ใช้ครั้งเดียว (สำหรับการยืนยัน)
 */
var payload = JSON.stringify({
    company: company,
    usercode: usercode,
    onetimepass: onetimepass
});
TALON.addMsg(payload);

var authGetFechToken = _DOMAIN_GA + "/api/security/getAccessKey";
var httpRequest = HttpRequest.newBuilder()
    .uri(URI.create(authGetFechToken))
    .header("Content-Type", "application/json; charset=UTF-8")
    .header("Accept", "*/*")
    .POST(HttpRequest.BodyPublishers.ofString(payload))
    .build();


/* ====================================================== */

/**
 * ส่ง Request เพื่อขอ Refresh Token จาก GA
 * - ถ้าสำเร็จ:
 *   - เก็บ Refresh Token ลงใน Cache (FECH_TOKEN)
 *   - แจ้งข้อความ Authorized สำเร็จ
 * - ถ้าไม่สำเร็จ:
 *   - แจ้งให้ผู้ใช้กดปุ่ม Authorize GA ใหม่
 */
try {
    var response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
    var rowData = JSON.parse(response.body());

    if (!rowData.messages || rowData.messages.length === 0) {
        // TALON.addMsg("Access Token: " + rowData.accessToken);
        // TALON.addMsg("Refresh Token: " + rowData.refreshToken);

        TALON.setSearchConditionData("DISPLAY", '0', "");
        TALON.putBindValue('FECH_TOKEN', rowData.refreshToken);
        TALON.addMsg("✅ GA Authorized Successfully! ");
    } else {
        TALON.setSearchConditionData("DISPLAY", '1', "");
        TALON.addErrorMsg("⌛ Token expire, please Click 'Authorize GA' button. ");
    }

} catch (e) {
    TALON.addErrorMsg("⚠️ System Error : " + e);
}
