
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


var _COMPANY = TALON.getBindValue('COMPANY');
var _USERKEY = TALON.getBindValue('USERKEY');
var _DOMAIN_GA = TALON.getBindValue('DOMAIN_GA');
var _GAUSERCODE = TALON.getBindValue('GAUSERCODE');
var _FECH_TOKEN = TALON.getBindValue('FECH_TOKEN');

var client = HttpClient.newHttpClient();

var search = TALON.getConditionData();
var invoiceSelected = search['SELECTED'];

function extractValues(input) {
    return input.split(',').map(function(pair) {
        var split = pair.trim().split(':');
        return split.length > 1 ? split[1].trim() : null;
    }).filter(Boolean);
}

/* ====================================================== */

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
        sendToGA(_ACCESS_TOKEN);
    } else {
        TALON.setSearchConditionData("DISPLAY", '1', "");
        TALON.addErrorMsg("⌛ Token expire, please Click 'Authorize GA' button. ");
    }
}


/* ====================================================== */

/**
 * ส่งข้อมูล Invoice ไปยังระบบ mcframeGA
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
function sendToGA(taken) {

    var invoiceNoList = extractValues(invoiceSelected);
    var index = 0;
    var mainID = {};
    var DATA_LIST = [];

    invoiceNoList.forEach(function(id) {
        var dataList = findById(id);
        dataList.forEach(function(row) {
            var values = [
                { "fieldName": "VOUCHERNO", "value": row['GA_VOUCHERNO'] },
                { "fieldName": "INVOICENO", "value": row['GA_INVOICENO'] },
                //{ "fieldName": "RATETYPE", "value": row['GA_RATETYPE'] },
                { "fieldName": "INPDATE", "value": DateFmt.formatDate(row['GA_INPDATE'].toString()) },
                { "fieldName": "HEADER_DEPTCODE", "value": row['GA_HEADER_DEPTCODE'] },
                { "fieldName": "DEPTCODE", "value": row['GA_DEPTCODE'] },
                { "fieldName": "ACCODE", "value": row['GA_ACCODE'] },
                { "fieldName": "HEADER_TAXABLECODE", "value": row['GA_HEADER_TAXABLECODE'] },
                
                // { "fieldName": "TAXTYPE", "value": row['GA_TAXTYPE'] },
                { "fieldName": "TAXTYPE", "value": "2" }, 
                
                { "fieldName": "DRCRTYPE", "value": "0" },
                { "fieldName": "CORRESPTYPE", "value": row['GA_CORRESPTYPE'] },
                
                //{ "fieldName": "INPAMOUNT_FC", "value": row['GA_INPAMOUNT_FC'] },
                { "fieldName": "INPAMOUNT_FC", "value": 1112.1150 },

                { "fieldName": "INPAMOUNT_SC", "value": row['GA_INPAMOUNT_SC'] },
                { "fieldName": "TAXABLEAMOUNT_FC", "value": row['GA_TAXABLEAMOUNT_FC'] },
                { "fieldName": "TAXABLEAMOUNT_SC", "value": row['GA_TAXABLEAMOUNT_SC'] },
                { "fieldName": "TAXAMOUNT_FC", "value": row['GA_TAXAMOUNT_FC'] },
                { "fieldName": "TAXAMOUNT_SC", "value": row['GA_TAXAMOUNT_SC'] },
                { "fieldName": "JOURNALTYPE", "value": row['GA_JOURNALTYPE'] },
                { "fieldName": "POSTPADCOLOR", "value": row['GA_POSTPADCOLOR'] },
                { "fieldName": "POSTPADTEXT", "value": row['GA_POSTPADTEXT'] },
                { "fieldName": "INCHARGECODE", "value": _GAUSERCODE },
                { "fieldName": "CORRESPCODE", "value": "CV000001" },
                { "fieldName": "CURRENCYCODE", "value": "THB" }
            ];

            for (var i = 0; i < values.length; i++) {
                values[i]["Col"] = i + 1;
            }

            var mapData = {
                "lineNo": index + 1,
                "values": values
            };
            
            index++;
            mainID[index] = row['GA_INVOICENO'];
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
        // TALON.addMsg(payload);

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
                TALON.addErrorMsg("❌ Invoice No. "+id+" : send to mcframeGA failed.  ")

                var errorList = resData.SaveStatusDetail.map(function (it) {
                    var rowKey = it.RecordKey.replace("Row = ", "");
                    return {
                        ID: mainID[rowKey],
                        RowNo: rowKey,
                        ItemName: it.ItemName,
                        ErrorDetail: it.ErrorDetail
                    };
                });

                errorList.forEach(function(rowErr) {
                    saveARError(interfaceLogID, rowErr);
                });
                
            } else {
                TALON.addMsg("✅ Invoice No. "+id+" : send to mcframeGA Successfully.  ");
            }

            saveARLog(interfaceLogID, payload, responseGA.body());
            
            index = 0;
            DATA_LIST = [];
            TALON.setSearchConditionData("SELECTED", "", "");
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
 * บันทึกข้อมูลที่ส่งไปยังระบบ mcframeGA ลงในฐานข้อมูล
 * - เก็บข้อมูลที่ส่ง (SEND) และข้อมูลผลลัพธ์ที่ได้รับ (RESPONSE)
 */
function saveARLog(interfaceLogID, sendData, resData) {
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
 * บันทึก Error ที่เกิดจากการส่งข้อมูล Invoice ไปยัง GA
 * - รับ error detail จาก API response
 * - สร้าง Error Log ID ใหม่ (ผ่าน SP_RUN_NUMBERING)
 * - เก็บข้อมูล error เช่น I_INVOICE_NO, ROW_NO, FIELD ที่ Error, รายละเอียด error
 * - บันทึกผู้สร้าง log, และวันเวลาที่เกิด error
 */
function saveARError(interfaceLogID, rowErr) {
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

    // TALON.addMsg(JSON.stringify(rowErr));
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
        
    var sql =
        "" +
        "SELECT " +
        "     [GA_VOUCHERNO] " +
        "    ,[GA_INVOICENO] " +
        "    ,[I_SONO] " +
        "    ,[I_QT_NO] " +
        "    ,[GA_RATETYPE] " +
        "    ,[GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE] " +
        "    ,[I_TYPE] " +
        "    ,[GA_DEPTCODE] " +
        "    ,[GA_ACCODE] " +
        "    ,[GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE] " +
        "    ,[GA_CORRESPTYPE] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_SC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_SC] " +
        "    ,[GA_TAXAMOUNT_FC] " +
        "    ,[GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE] " +
        "    ,[GA_POSTPADCOLOR] " +
        "    ,[GA_POSTPADTEXT] " +
        "FROM ( " +
        "    SELECT " +
        "         [IVD].[I_INVOICE_NO] AS [GA_VOUCHERNO] " +
        "        ,[IVD].[I_INVOICE_NO] AS [GA_INVOICENO] " +
        "        ,[IVD].[I_SONO] " +
        "        ,[SD].[I_QT_NO] " +
        "        ,[QTH].[I_EXG_RATE_TYPE] AS [GA_RATETYPE] " +
        "        ,[IVH].[I_INVOICE_DATE] AS [GA_INPDATE] " +
        "        ,[IVD].[I_ITEMCODE] " +
        "        ,'AD' AS [GA_HEADER_DEPTCODE] " +
        "        ,[FG].[I_TYPE] " +
        "        ,[FG].[I_ITEM_GROUP] " +
        "        ,'102012' AS [GA_DEPTCODE] " +
        "        ,'40100050' AS [GA_ACCODE] " +
        "        ,'S999' AS [GA_HEADER_TAXABLECODE] " +
        "        ,'1' AS [GA_TAXTYPE] " +
        "        ,'1' AS [GA_CORRESPTYPE] " +
        "        ,[IVD].[I_QTY] " +
        "        ,[IVD].[I_UNIT_PRICE] " +
        "        ,[IVD].[I_AMOUNT] " +
        "        ,ROUND( " +
        "            (ISNULL([QTD].[I_RM_AMT], 0) + ISNULL([QTD].[I_LOSS_AMT], 0)), 2 " +
        "        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT] " +
        "        ,0 AS [GA_TAXAMOUNT_FC] " +
        "        ,0 AS [GA_TAXAMOUNT_SC] " +
        "        ,'0' AS [GA_JOURNALTYPE] " +
        "        ,'' AS [GA_POSTPADCOLOR] " +
        "        ,'' AS [GA_POSTPADTEXT] " +
        " " +
        "    FROM [dbo].[T_PR_INVOICE_D] [IVD] " +
        "        LEFT JOIN [T_PR_INVOICE_H] [IVH] " +
        "            ON [IVH].[I_INVOICE_NO] = [IVD].[I_INVOICE_NO] " +
        "        LEFT JOIN [MS_PRFG] [FG] " +
        "            ON [FG].[I_ITEMCODE] = [IVD].[I_ITEMCODE] " +
        "        LEFT JOIN [T_PR_SORD_H] [SD] " +
        "            ON [SD].[I_SONO] = [IVD].[I_SONO] " +
        "        LEFT JOIN [T_PR_QT_H] [QTH] " +
        "            ON [QTH].[I_QT_NO] = [SD].[I_QT_NO] " +
        "        LEFT JOIN ( " +
        "            SELECT [QD].[I_QT_NO] " +
        "                  ,[QD].[INTERNAL_NO] " +
        "                  ,[QD].[I_ITEMCODE] " +
        "                  ,[QD].[I_RM_AMT] " +
        "                  ,[QD].[I_LOSS_AMT] " +
        "                  ,[QD].[I_FEE_PROCESS] " +
        "                  ,[QD].[I_FEE_CUSTOM] " +
        "                  ,[QD].[I_FEE_PACK] " +
        "                  ,[QD].[I_FEE_EXPENSE] " +
        "                  ,[MP].[I_FEE_DLY] " +
        "                  ,[QD].[I_FEE_MGM] " +
        "            FROM [T_PR_QT_D] [QD] " +
        "                LEFT JOIN [MS_PRFG] AS [MP] " +
        "                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE] " +
        "        ) AS [QTD] " +
        "            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO] " +
        "    WHERE [IVH].[I_INVOICE_NO] = '" + invoiceNo + "' " +
        "      AND [FG].[I_TYPE] = 1 " +
        ") AS [MAIN] " +
        "GROUP BY " +
        "     [GA_VOUCHERNO], [GA_INVOICENO], [I_SONO], [I_QT_NO], [GA_RATETYPE], [GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE], [GA_DEPTCODE], [GA_ACCODE], [GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE], [GA_CORRESPTYPE], [GA_TAXAMOUNT_FC], [GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE], [GA_POSTPADCOLOR], [GA_POSTPADTEXT], [I_TYPE] " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT " +
        "     [GA_VOUCHERNO] " +
        "    ,[GA_INVOICENO] " +
        "    ,[I_SONO] " +
        "    ,[I_QT_NO] " +
        "    ,[GA_RATETYPE] " +
        "    ,[GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE] " +
        "    ,[I_TYPE] " +
        "    ,[GA_DEPTCODE] " +
        "    ,[GA_ACCODE] " +
        "    ,[GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE] " +
        "    ,[GA_CORRESPTYPE] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_SC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_SC] " +
        "    ,[GA_TAXAMOUNT_FC] " +
        "    ,[GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE] " +
        "    ,[GA_POSTPADCOLOR] " +
        "    ,[GA_POSTPADTEXT] " +
        "FROM ( " +
        "    SELECT " +
        "         [IVD].[I_INVOICE_NO] AS [GA_VOUCHERNO] " +
        "        ,[IVD].[I_INVOICE_NO] AS [GA_INVOICENO] " +
        "        ,[IVD].[I_SONO] " +
        "        ,[SD].[I_QT_NO] " +
        "        ,[QTH].[I_EXG_RATE_TYPE] AS [GA_RATETYPE] " +
        "        ,[IVH].[I_INVOICE_DATE] AS [GA_INPDATE] " +
        "        ,[IVD].[I_ITEMCODE] " +
        "        ,'AD' AS [GA_HEADER_DEPTCODE] " +
        "        ,[FG].[I_TYPE] " +
        "        ,[FG].[I_ITEM_GROUP] " +
        "        ,'102012' AS [GA_DEPTCODE] " +
        "        ,'40100055' AS [GA_ACCODE] " +
        "        ,'S999' AS [GA_HEADER_TAXABLECODE] " +
        "        ,'1' AS [GA_TAXTYPE] " +
        "        ,'1' AS [GA_CORRESPTYPE] " +
        "        ,[IVD].[I_QTY] " +
        " " +
        "        ,ROUND( " +
        "            (ISNULL([QTD].[I_FEE_PROCESS], 0) + " +
        "             ISNULL([QTD].[I_FEE_CUSTOM], 0) + " +
        "             ISNULL([QTD].[I_FEE_PACK], 0) + " +
        "             ISNULL([QTD].[I_FEE_EXPENSE], 0) + " +
        "             ISNULL([QTD].[I_FEE_DLY], 0) + " +
        "             ISNULL([QTD].[I_FEE_MGM], 0)), 2 " +
        "        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT] " +
        "        ,0 AS [GA_TAXAMOUNT_FC] " +
        "        ,0 AS [GA_TAXAMOUNT_SC] " +
        "        ,'0' AS [GA_JOURNALTYPE] " +
        "        ,'' AS [GA_POSTPADCOLOR] " +
        "        ,'' AS [GA_POSTPADTEXT] " +
        " " +
        "    FROM [dbo].[T_PR_INVOICE_D] [IVD] " +
        "        LEFT JOIN [T_PR_INVOICE_H] [IVH] " +
        "            ON [IVH].[I_INVOICE_NO] = [IVD].[I_INVOICE_NO] " +
        "        LEFT JOIN [MS_PRFG] [FG] " +
        "            ON [FG].[I_ITEMCODE] = [IVD].[I_ITEMCODE] " +
        "        LEFT JOIN [T_PR_SORD_H] [SD] " +
        "            ON [SD].[I_SONO] = [IVD].[I_SONO] " +
        "        LEFT JOIN [T_PR_QT_H] [QTH] " +
        "            ON [QTH].[I_QT_NO] = [SD].[I_QT_NO] " +
        "        LEFT JOIN ( " +
        "            SELECT [QD].[I_QT_NO] " +
        "                  ,[QD].[INTERNAL_NO] " +
        "                  ,[QD].[I_ITEMCODE] " +
        "                  ,[QD].[I_RM_AMT] " +
        "                  ,[QD].[I_LOSS_AMT] " +
        "                  ,[QD].[I_FEE_PROCESS] " +
        "                  ,[QD].[I_FEE_CUSTOM] " +
        "                  ,[QD].[I_FEE_PACK] " +
        "                  ,[QD].[I_FEE_EXPENSE] " +
        "                  ,[MP].[I_FEE_DLY] " +
        "                  ,[QD].[I_FEE_MGM] " +
        "            FROM [T_PR_QT_D] [QD] " +
        "                LEFT JOIN [MS_PRFG] AS [MP] " +
        "                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE] " +
        "        ) AS [QTD] " +
        "            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO] " +
        " " +
        " " +
        "    WHERE [IVH].[I_INVOICE_NO] = '" + invoiceNo + "' " +
        "      AND [FG].[I_TYPE] = 1 " +
        ") AS [MAIN] " +
        "GROUP BY " +
        "     [GA_VOUCHERNO], [GA_INVOICENO], [I_SONO], [I_QT_NO], [GA_RATETYPE], [GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE], [GA_DEPTCODE], [GA_ACCODE], [GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE], [GA_CORRESPTYPE], [GA_TAXAMOUNT_FC], [GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE], [GA_POSTPADCOLOR], [GA_POSTPADTEXT], [I_TYPE] " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT " +
        "     [GA_VOUCHERNO] " +
        "    ,[GA_INVOICENO] " +
        "    ,[I_SONO] " +
        "    ,[I_QT_NO] " +
        "    ,[GA_RATETYPE] " +
        "    ,[GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE] " +
        "    ,[I_TYPE] " +
        "    ,[GA_DEPTCODE] " +
        "    ,[GA_ACCODE] " +
        "    ,[GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE] " +
        "    ,[GA_CORRESPTYPE] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_SC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_SC] " +
        "    ,[GA_TAXAMOUNT_FC] " +
        "    ,[GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE] " +
        "    ,[GA_POSTPADCOLOR] " +
        "    ,[GA_POSTPADTEXT] " +
        "FROM ( " +
        "    SELECT " +
        "         [IVD].[I_INVOICE_NO] AS [GA_VOUCHERNO] " +
        "        ,[IVD].[I_INVOICE_NO] AS [GA_INVOICENO] " +
        "        ,[IVD].[I_SONO] " +
        "        ,[SD].[I_QT_NO] " +
        "        ,[QTH].[I_EXG_RATE_TYPE] AS [GA_RATETYPE] " +
        "        ,[IVH].[I_INVOICE_DATE] AS [GA_INPDATE] " +
        "        ,[IVD].[I_ITEMCODE] " +
        "        ,'AD' AS [GA_HEADER_DEPTCODE] " +
        "        ,[FG].[I_TYPE] " +
        "        ,[FG].[I_ITEM_GROUP] " +
        "        ,'102011' AS [GA_DEPTCODE] " +
        "        ,'40100050' AS [GA_ACCODE] " +
        "        ,'S999' AS [GA_HEADER_TAXABLECODE] " +
        "        ,'1' AS [GA_TAXTYPE] " +
        "        ,'1' AS [GA_CORRESPTYPE] " +
        "        ,[IVD].[I_QTY] " +
        "        ,ROUND( " +
        "            (ISNULL([QTD].[I_RM_AMT], 0) + ISNULL([QTD].[I_LOSS_AMT], 0)), 2 " +
        "        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT] " +
        "        ,0 AS [GA_TAXAMOUNT_FC] " +
        "        ,0 AS [GA_TAXAMOUNT_SC] " +
        "        ,'0' AS [GA_JOURNALTYPE] " +
        "        ,'' AS [GA_POSTPADCOLOR] " +
        "        ,'' AS [GA_POSTPADTEXT] " +
        " " +
        "    FROM [dbo].[T_PR_INVOICE_D] [IVD] " +
        "        LEFT JOIN [T_PR_INVOICE_H] [IVH] " +
        "            ON [IVH].[I_INVOICE_NO] = [IVD].[I_INVOICE_NO] " +
        "        LEFT JOIN [MS_PRFG] [FG] " +
        "            ON [FG].[I_ITEMCODE] = [IVD].[I_ITEMCODE] " +
        "        LEFT JOIN [T_PR_SORD_H] [SD] " +
        "            ON [SD].[I_SONO] = [IVD].[I_SONO] " +
        "        LEFT JOIN [T_PR_QT_H] [QTH] " +
        "            ON [QTH].[I_QT_NO] = [SD].[I_QT_NO] " +
        "        LEFT JOIN ( " +
        "            SELECT [QD].[I_QT_NO] " +
        "                  ,[QD].[INTERNAL_NO] " +
        "                  ,[QD].[I_ITEMCODE] " +
        "                  ,[QD].[I_RM_AMT] " +
        "                  ,[QD].[I_LOSS_AMT] " +
        "                  ,[QD].[I_FEE_PROCESS] " +
        "                  ,[QD].[I_FEE_CUSTOM] " +
        "                  ,[QD].[I_FEE_PACK] " +
        "                  ,[QD].[I_FEE_EXPENSE] " +
        "                  ,[MP].[I_FEE_DLY] " +
        "                  ,[QD].[I_FEE_MGM] " +
        "            FROM [T_PR_QT_D] [QD] " +
        "                LEFT JOIN [MS_PRFG] AS [MP] " +
        "                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE] " +
        "        ) AS [QTD] " +
        "            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO] " +
        "    WHERE [IVH].[I_INVOICE_NO] = '" + invoiceNo + "' " +
        "      AND ([FG].[I_TYPE] <> 1 OR [FG].[I_TYPE] IS NULL) " +
        ") AS [MAIN] " +
        "GROUP BY " +
        "     [GA_VOUCHERNO], [GA_INVOICENO], [I_SONO], [I_QT_NO], [GA_RATETYPE], [GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE], [GA_DEPTCODE], [GA_ACCODE], [GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE], [GA_CORRESPTYPE], [GA_TAXAMOUNT_FC], [GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE], [GA_POSTPADCOLOR], [GA_POSTPADTEXT], [I_TYPE] " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT " +
        "     [GA_VOUCHERNO] " +
        "    ,[GA_INVOICENO] " +
        "    ,[I_SONO] " +
        "    ,[I_QT_NO] " +
        "    ,[GA_RATETYPE] " +
        "    ,[GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE] " +
        "    ,[I_TYPE] " +
        "    ,[GA_DEPTCODE] " +
        "    ,[GA_ACCODE] " +
        "    ,[GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE] " +
        "    ,[GA_CORRESPTYPE] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_INPAMOUNT_SC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_FC] " +
        "    ,SUM([ITEM_AMOUNT]) AS [GA_TAXABLEAMOUNT_SC] " +
        "    ,[GA_TAXAMOUNT_FC] " +
        "    ,[GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE] " +
        "    ,[GA_POSTPADCOLOR] " +
        "    ,[GA_POSTPADTEXT] " +
        "FROM ( " +
        "    SELECT " +
        "         [IVD].[I_INVOICE_NO] AS [GA_VOUCHERNO] " +
        "        ,[IVD].[I_INVOICE_NO] AS [GA_INVOICENO] " +
        "        ,[IVD].[I_SONO] " +
        "        ,[SD].[I_QT_NO] " +
        "        ,[QTH].[I_EXG_RATE_TYPE] AS [GA_RATETYPE] " +
        "        ,[IVH].[I_INVOICE_DATE] AS [GA_INPDATE] " +
        "        ,[IVD].[I_ITEMCODE] " +
        "        ,'AD' AS [GA_HEADER_DEPTCODE] " +
        "        ,[FG].[I_TYPE] " +
        "        ,[FG].[I_ITEM_GROUP] " +
        "        ,'102011' AS [GA_DEPTCODE] " +
        "        ,'40100055' AS [GA_ACCODE] " +
        "        ,'S999' AS [GA_HEADER_TAXABLECODE] " +
        "        ,'1' AS [GA_TAXTYPE] " +
        "        ,'1' AS [GA_CORRESPTYPE] " +
        "        ,[IVD].[I_QTY] " +
        "        ,ROUND( " +
        "            (ISNULL([QTD].[I_FEE_PROCESS], 0) + " +
        "             ISNULL([QTD].[I_FEE_CUSTOM], 0) + " +
        "             ISNULL([QTD].[I_FEE_PACK], 0) + " +
        "             ISNULL([QTD].[I_FEE_EXPENSE], 0) + " +
        "             ISNULL([QTD].[I_FEE_DLY], 0) + " +
        "             ISNULL([QTD].[I_FEE_MGM], 0)), 2 " +
        "        ) * [IVD].[I_QTY] AS [ITEM_AMOUNT] " +
        "        ,0 AS [GA_TAXAMOUNT_FC] " +
        "        ,0 AS [GA_TAXAMOUNT_SC] " +
        "        ,'0' AS [GA_JOURNALTYPE] " +
        "        ,'' AS [GA_POSTPADCOLOR] " +
        "        ,'' AS [GA_POSTPADTEXT] " +
        " " +
        "    FROM [dbo].[T_PR_INVOICE_D] [IVD] " +
        "        LEFT JOIN [T_PR_INVOICE_H] [IVH] " +
        "            ON [IVH].[I_INVOICE_NO] = [IVD].[I_INVOICE_NO] " +
        "        LEFT JOIN [MS_PRFG] [FG] " +
        "            ON [FG].[I_ITEMCODE] = [IVD].[I_ITEMCODE] " +
        "        LEFT JOIN [T_PR_SORD_H] [SD] " +
        "            ON [SD].[I_SONO] = [IVD].[I_SONO] " +
        "        LEFT JOIN [T_PR_QT_H] [QTH] " +
        "            ON [QTH].[I_QT_NO] = [SD].[I_QT_NO] " +
        "        LEFT JOIN ( " +
        "            SELECT [QD].[I_QT_NO] " +
        "                  ,[QD].[INTERNAL_NO] " +
        "                  ,[QD].[I_ITEMCODE] " +
        "                  ,[QD].[I_RM_AMT] " +
        "                  ,[QD].[I_LOSS_AMT] " +
        "                  ,[QD].[I_FEE_PROCESS] " +
        "                  ,[QD].[I_FEE_CUSTOM] " +
        "                  ,[QD].[I_FEE_PACK] " +
        "                  ,[QD].[I_FEE_EXPENSE] " +
        "                  ,[MP].[I_FEE_DLY] " +
        "                  ,[QD].[I_FEE_MGM] " +
        "            FROM [T_PR_QT_D] [QD] " +
        "                LEFT JOIN [MS_PRFG] AS [MP] " +
        "                    ON [MP].[I_ITEMCODE] = [QD].[I_ITEMCODE] " +
        "        ) AS [QTD] " +
        "            ON [QTD].[I_QT_NO] = [SD].[I_QT_NO] " +
        "    WHERE [IVH].[I_INVOICE_NO] = '" + invoiceNo + "' " +
        "      AND ([FG].[I_TYPE] <> 1) " +
        ") AS [MAIN] " +
        "GROUP BY " +
        "     [GA_VOUCHERNO], [GA_INVOICENO], [I_SONO], [I_QT_NO], [GA_RATETYPE], [GA_INPDATE] " +
        "    ,[GA_HEADER_DEPTCODE], [GA_DEPTCODE], [GA_ACCODE], [GA_HEADER_TAXABLECODE] " +
        "    ,[GA_TAXTYPE], [GA_CORRESPTYPE], [GA_TAXAMOUNT_FC], [GA_TAXAMOUNT_SC] " +
        "    ,[GA_JOURNALTYPE], [GA_POSTPADCOLOR], [GA_POSTPADTEXT], [I_TYPE] " +
        "ORDER BY [GA_ACCODE], [GA_DEPTCODE]";
    return TalonDbUtil.select(TALON.getDbConfig(), sql);
}

