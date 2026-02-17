
var URI = Java.type('java.net.URI');
var Duration = Java.type("java.time.Duration");
var HttpClient = Java.type('java.net.http.HttpClient');
var HttpRequest = Java.type('java.net.http.HttpRequest');
var HttpResponse = Java.type('java.net.http.HttpResponse');
var BodyPublishers = Java.type("java.net.http.HttpRequest.BodyPublishers");

var HttpTimeoutException = Java.type('java.net.http.HttpTimeoutException');
var ConnectException = Java.type('java.net.ConnectException');
var IOException = Java.type('java.io.IOException');
var InterruptedException = Java.type('java.lang.InterruptedException');


/**
 * ตัวแปรที่ดึงค่าจาก Cache ของ TALON 
 * - ใช้สำหรับดึงค่าที่ระบบ TALON เคยเก็บไว้ชั่วคราว 
 */
var _COMPANY = TALON.getBindValue('COMPANY');
var _USERKEY = TALON.getBindValue('USERKEY');
var _DOMAIN_GA = TALON.getBindValue('DOMAIN_GA');
var _GAUSERCODE = TALON.getBindValue('GAUSERCODE');
var _FECH_TOKEN = TALON.getBindValue('FECH_TOKEN');

var client = HttpClient.newHttpClient();

var search = TALON.getConditionData();
var invoiceSelected = search['SELECTED'];


/* ====================================================== */

/**
 * ตรวจสอบว่า Refresh Token ที่ได้จาก Cache ยังมีอยู่หรือไม่
 * - ถ้าไม่มี Token → แจ้งให้ผู้ใช้กดปุ่ม Authorize ใหม่
 * - ถ้ามี Token → ส่งข้อมูล company, usercode, refreshtoken ไปยังระบบ GA
 *   เพื่อขอ Access Token ใหม่ และเรียกใช้ interfaceGA เพื่อเริ่มส่งข้อมูล
 */
if (_FECH_TOKEN == null || _FECH_TOKEN.trim() === "") {
    TALON.setSearchConditionData("DISPLAY", '1', "");
    TALON.addErrorMsg("⌛ Token expire, please Click 'Authorize GA' button. ");
} else if (invoiceSelected == null || invoiceSelected.trim() === "") {
    TALON.addErrorMsg('❌ Invoice No. is not selected. ');
} else {

    var authGA = JSON.stringify({
        company: _COMPANY,
        usercode: _GAUSERCODE,
        refreshtoken: _FECH_TOKEN
    });

    var authGetAccessToken = _DOMAIN_GA + "/api/security/publishAccessToken";
    var httpRequest = HttpRequest.newBuilder()
        .uri(URI.create(authGetAccessToken))
        .timeout(Duration.ofSeconds(120))
        .header("Content-Type", "application/json; charset=UTF-8")
        .header("Accept", "*/*")
        .POST(HttpRequest.BodyPublishers.ofString(authGA))
        .build();

    var response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
    var rowData = JSON.parse(response.body());
    var _ACCESS_TOKEN = rowData.accessToken;

    if (_ACCESS_TOKEN != null && _ACCESS_TOKEN !== "") {
        //TALON.addMsg("Access Token: " + _ACCESS_TOKEN);
        interfaceGA(_ACCESS_TOKEN);
    } else {
        TALON.setSearchConditionData("DISPLAY", '1', "");
        TALON.addErrorMsg("⌛ Token expire, please Click 'Authorize GA' button. ");
    }
}


/* ====================================================== */

/**
 * ฟังก์ชันหลักที่ใช้สำหรับส่งข้อมูล Invoice ไปยังระบบ mcframeGA
 *
 * - รับ access token จากขั้นตอนก่อนหน้า
 * - อ่าน Invoice No. ที่ผู้ใช้เลือก
 * - Loop ข้อมูลแต่ละ Invoice No:
 *   - ดึงข้อมูลจาก DB (findById)
 *   - จัดเรียงข้อมูลให้อยู่ในรูปแบบที่ API ของระบบ GA ต้องการ
 *   - สร้าง Payload และส่งไปยัง API ของ mcframeGA
 *   - ตรวจสอบผลลัพธ์:
 *     - ถ้าสำเร็จ: บันทึกสถานะสำเร็จ
 *     - ถ้าไม่สำเร็จ: เก็บ log และ error detail ลงในฐานข้อมูล
 * - บันทึกข้อมูลที่ส่งและผลลัพธ์ของ API ในตาราง LOG
 */
function interfaceGA(taken) {

    var invoiceNoList = extractValues(invoiceSelected);
    var index = 0;
    var mainID = {};
    var DATA_LIST = [];

    invoiceNoList.forEach(function(id) {
        var dataList = findById(id);
        dataList.forEach(function(row) {
            var mapData = {
                "lineNo": index + 1, // RecordKey : Row = number 
                "values": [
                    { "fieldName": "VOUCHERNO", "value": row['I_INVOICE_NO'] },
                    { "fieldName": "ROWNO", "value": row['ROW_NO'] },
                    { "fieldName": "DEPTCODE", "value": row['DEPTCODE'] },

                    { "fieldName": "INPDATE", "value": formatDate(row['INPDATE']) },
                    //{ "fieldName": "INPDATE", "value": row['INPDATE'] },
                    
                    { "fieldName": "DRCRTYPE", "value": row['DRCRTYPE'] },
                    { "fieldName": "INCHARGECODE", "value": _GAUSERCODE },
                    { "fieldName": "ACCODE", "value": row['ACCODE'] },

                    { "fieldName": "TAXTYPE", "value": row['TAXTYPE'] },
                    //{ "fieldName": "TAXTYPE", "value": 3 },

                    { "fieldName": "TAXABLECODE", "value": row['TAXABLECODE'] },
                    { "fieldName": "CORRESPCODE", "value": row['CORRESPCODE'] },
                    { "fieldName": "RATETYPE", "value": row['RATETYPE'] },
                    { "fieldName": "RATE", "value": row['RATE'] },
                    { "fieldName": "CURRENCYCODE", "value": row['CURRENCYCODE'] },
                    { "fieldName": "INPAMOUNT_FC", "value": row['INPAMOUNT_FC'] },
                    { "fieldName": "INPAMOUNT_SC", "value": row['INPAMOUNT_SC'] },
                    { "fieldName": "TAXABLEAMOUNT_FC", "value": row['TAXABLEAMOUNT_FC'] },
                    { "fieldName": "TAXABLEAMOUNT_SC", "value": row['TAXABLEAMOUNT_SC'] },
                    { "fieldName": "TAXAMOUNT_FC", "value": row['TAXAMOUNT_FC'] },
                    { "fieldName": "TAXAMOUNT_SC", "value": row['TAXAMOUNT_SC'] },
                    { "fieldName": "DATALEVEL", "value": 1 },
                    { "fieldName": "DETAIL_DESCRIPTNAME", "value": row['DETAIL_DESCRIPTNAME'] }
                ]
            };
            index++;
            mainID[index] = row['I_INVOICE_NO'];
            DATA_LIST.push(mapData);
        });

       var payload = JSON.stringify({
            company: _COMPANY,
            userid: _GAUSERCODE,
            accesstoken: _ACCESS_TOKEN,
            lang: "en-US",
            userkey: _USERKEY,
            data: DATA_LIST
        });
        //TALON.addMsg(payload);

        var url = _DOMAIN_GA + "/api/publish/debtcollectionrequest/save";

        try {
            var requestGA = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(120))
                .header("Content-Type", "application/json")
                .POST(BodyPublishers.ofString(payload))
                .build();

            var responseGA = client.send(requestGA, HttpResponse.BodyHandlers.ofString());
            var resData = JSON.parse(responseGA.body());

            var interfaceLogID = RunningNo.genId("DMTT_N_AR_LOG", "IFyyyymmddxxxxxx", true);

            if (resData.Status !== 0) {
                TALON.addErrorMsg("❌ Invoice No. "+id+" : send to mcframeGA failed! ")
                //TALON.addErrorMsg(responseGA.body());
                //setInterfaceStatus(interfaceLogID, id, '2')

                var errorList = resData.SaveStatusDetail.map(function (it) {
                    var rowKey = it.RecordKey.replace("Row = ", "");
                    return {
                        ID: mainID[rowKey],
                        RowNo: rowKey,
                        ItemName: it.ItemName,
                        ErrorDetail: it.ErrorDetail
                    };
                });
                /*TALON.addErrorMsg(JSON.stringify(errorList));*/

                errorList.forEach(function(rowErr) {
                    setErrorLog(interfaceLogID, rowErr);
                });
                
            } else {
                TALON.addMsg("✅ Invoice No. "+id+" : send to mcframeGA Successfully!");
                // setInterfaceStatus(interfaceLogID, id, '1')
            }

            var resData = JSON.stringify(responseGA.body());
            setInterfaceAPILog(interfaceLogID, payload, resData);
            
            index = 0;
            DATA_LIST = [];
        } catch (e) {
            if (e instanceof HttpTimeoutException) {
                TALON.addErrorMsg("🌐 Request to mcframeGA timed out after 120 seconds. ");
            } else if (e instanceof ConnectException) {
                TALON.addErrorMsg("🌐 Unable connect to the server. Please check your internet connection. ");
            } else if (e instanceof IOException) {
                TALON.addErrorMsg("⚠️ An I/O error: " + e.getMessage());
            } else if (e instanceof InterruptedException) {
                TALON.addErrorMsg("🔁 Request was interrupted. ");
            } else {
                TALON.addErrorMsg("❌ Unexpected error: " + e);
            }
        }

    });

 

}


/* ====================================================== */

/**
 * บันทึกข้อมูลการ Interface ไปยังระบบ mcframeGA ลงในฐานข้อมูล
 * - เก็บข้อมูลที่ส่ง (SEND) และข้อมูลผลลัพธ์ที่ได้รับ (RESPONSE)
 * - แทนที่ single quote เพื่อป้องกันปัญหาการ insert SQL
 */
function setInterfaceAPILog(interfaceLogID, sendData, resData) {

    var detailCol = [
        'I_INTERFACED_LOG_ID',
        'I_SEND',
        'I_RESPONSE'
    ];

    var Data = {};
    Data['I_INTERFACED_LOG_ID'] = interfaceLogID;
    Data['I_SEND'] = sendData;
    Data['I_RESPONSE'] = resData;

    TalonDbUtil.insertByMap(
        TALON.getDbConfig(),
        'IF_API_AR_LOG', // TABLE_NAME
        Data,
        detailCol
    );

}

/**
 * ฟังก์ชันบันทึก Error ที่เกิดจากการส่งข้อมูล Invoice ไปยัง GA
 * - รับ error detail จาก API response
 * - สร้าง Error Log ID ใหม่ (ผ่าน SP_RUN_NUMBERING)
 * - เก็บข้อมูล error เช่น I_INVOICE_NO, ROW_NO, FIELD ที่ Error, รายละเอียด error
 * - บันทึกผู้สร้าง log, และวันเวลาที่เกิด error
 */
function setErrorLog(interfaceLogID, rowErr) {
    if (!rowErr) return;

    var now        = new java.util.Date();
    var userData   = TALON.getUserInfoMap();
    var userId     = userData['USER_ID'];

    var logErrId = RunningNo.genId(
        "DMTT_N_AR_ERR_LOG",
        "ELyyyymmddxxxxxx",
        true
    );

    var detailCol = [
        'I_ERROR_LOG_ID',
        'I_INTERFACED_LOG_ID',
        'I_INVOICE_NO',
        'I_ROW_NO',
        'I_TARGET_FIELD',
        'I_ERROR_DETAILS',
        'I_CREATED_DATE',
        'I_CREATED_BY'
    ];

    var data = {};

    data['I_ERROR_LOG_ID']       = logErrId;
    data['I_INTERFACED_LOG_ID']  = interfaceLogID;
    data['I_INVOICE_NO']         = rowErr.ID;
    data['I_ROW_NO']             = rowErr.RowNo;
    data['I_TARGET_FIELD']       = rowErr.ItemName;
    data['I_ERROR_DETAILS']      = rowErr.ErrorDetail;
    data['I_CREATED_DATE']       = DateFmt.formatDateTime(now.toString());
    data['I_CREATED_BY']         = userId;

    TalonDbUtil.insertByMap(
        TALON.getDbConfig(),
        'IF_API_AR_ERR',
        data,
        detailCol
    );
}


/**
 * อัปเดตสถานะการ Interface ของ Invoice
 * - status = '1' → สำเร็จ
 * - status = '2' → ล้มเหลว
 * - บันทึก INTERFACED_LOG_ID, INTERFACED_STATUS และ ACCRUAL_STATUS (ถ้าสำเร็จ)
 */
function setInterfaceStatus(interfaceLogID, idTarget, status) {
    if (status === '1') {
        var sqlUpdate =
            "UPDATE [PPLI_T_ACCRUEDH] " +
            "SET [INTERFACED_LOG_ID] = '" + interfaceLogID + "', " +
            "    [INTERFACED_STATUS] = '1', " +
            "    [ACCRURAL_STATUS] = '1' " +
            "WHERE [I_INVOICE_NO] = '" + idTarget + "' ";
        TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);
    } else if (status === '2') {
        var sqlUpdate =
            "UPDATE [PPLI_T_ACCRUEDH] " +
            "SET [INTERFACED_LOG_ID] = '" + interfaceLogID + "', " +
            "[INTERFACED_STATUS] = '2' " +
            "WHERE [I_INVOICE_NO] = '" + idTarget + "' ";
        TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);
    }

}

/**
 * ดึงข้อมูล Invoice แบบ Row Detail ตามหมายเลข I_INVOICE_NO
 * - ใช้สำหรับนำไปจัดรูปแบบข้อมูลเพื่อส่งออกไปยังระบบ GA
 */
function findById(invoiceNo) {
    var query = "SELECT " +
        "    [I_INVOICE_NO], " +
        "    [ROW_NO], " +
        "    [DEPTCODE], " +
        "    [INPDATE], " +
        "    [DRCRTYPE], " +
        "    [ACCODE], " +
        "    [TAXABLECODE], " +
        "    [TAXTYPE], " +
        "    [BILL_TO_CORRESP], " +
        "    [CURRENCYCODE], " +
        "    [RATETYPE], " +
        "    [RATE], " +
        "    [TAXABLEAMOUNT_FC], " +
        "    [TAXABLEAMOUNT_SC], " +
        "    [TAXAMOUNT_FC], " +
        "    [TAXAMOUNT_SC], " +
        "    [INPAMOUNT_FC], " +
        "    [INPAMOUNT_SC], " +
        "    [DETAIL_DESCRIPTNAME] " +
        "FROM [PPLI_T_ACCRUED_JOURNAL] " +
        "WHERE [I_INVOICE_NO] = '" + invoiceNo + "' AND [INPAMOUNT_SC] <> 0";

    return TalonDbUtil.select(TALON.getDbConfig(), query);
}


function extractValues(input) {
    return input.split(',').map(function(pair) {
        var split = pair.trim().split(':');
        return split.length > 1 ? split[1].trim() : null;
    }).filter(Boolean);
}

