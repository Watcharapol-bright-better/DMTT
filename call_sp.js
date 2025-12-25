/**
 * เรียกใช้งาน Stored Procedure สำหรับนำเข้าข้อมูลจาก Excel
 * คืนค่า JSON:
 * { "status": true|false, "message": "", "is_update": "0|1", "contract_no": "" }
 */
function executeExcelImport(procName, lumpSumFlag, contractNo) {
    var params = [];
    params['ContractNo']   = contractNo;
    params['LumpsumpFlag'] = lumpSumFlag;
    params['Result']       = ''; // Output parameter

    var outputParams = ['Result'];
    var result = TalonDbUtil.prepareCall(
        TALON.getDbConfig(),
        procName,
        params,
        outputParams
    );
    return JSON.parse(result[0]);
}

/**
 * สร้างหมายเลข Log ID ใหม่จากระบบรันเลขอัตโนมัติ
 */
function getNewLogID() {
    var sql = ""
        + "DECLARE @LogId NVARCHAR(MAX) "
        + "EXEC SP_RUN_NUMBERING_V1 "
        + "    @CodeType = 'PPLI_N_WAST_LOG', "
        + "    @Format = 'yyyymmddxxxxxxxx', "
        + "    @GeneratedNo = @LogId OUTPUT "
        + "SELECT @LogId AS [NUMBERING]";
    return TalonDbUtil.select(TALON.getDbConfig(), sql)[0]['NUMBERING'];
}

/**
 * ตรวจสอบว่ามีข้อมูลในตาราง ContractD2 หรือไม่
 */
function hasContractD2(contractNo) {
    var sql = ""
        + "SELECT CASE WHEN EXISTS ("
        + "  SELECT 1 FROM [PPLI_T_WASTE_CONTRACTD2] "
        + "  WHERE [CONTRACT_NO] = '" + contractNo + "'"
        + ") THEN 1 ELSE 0 END AS [IsExist]";
    return TalonDbUtil.select(TALON.getDbConfig(), sql)[0]['IsExist'];
}

// ========================================
// ขั้นตอนหลักของการทำงาน
// ========================================

var ContractKind = {
    Lumpsump: "1",
    Normal: "0"
}

var sqlList = "SELECT DISTINCT [CONTRACT_NO], [IS_UPDATE] FROM [PPLI_T_WASTE_CONTRACT_TEMP]";
var contractList = TalonDbUtil.select(TALON.getDbConfig(), sqlList);

contractList.forEach(function(row) {
    var contractNo = row['CONTRACT_NO'];
    var isUpdate   = row['IS_UPDATE'];

    LOG.step("Start processing contract: " + contractNo);

    var runRowNumber = 
        "WITH [CTE] AS ( " +
        "    SELECT " +
        "        [CONTRACT_NO], " +
        "        [DETAIL_TYPE], " +
        "        [INTERNAL_NO], " +
        "        ROW_NUMBER() OVER (PARTITION BY [CONTRACT_NO], [DETAIL_TYPE] ORDER BY [INTERNAL_NO]) AS [RN] " +
        "    FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] " +
        "    WHERE [DETAIL_TYPE] <> 1 AND [CONTRACT_NO] = '"+contractNo+"' " +
        ") " +
        "UPDATE [T] " +
        "SET [T].[ROW_NO] = [CTE].[RN] " +
        "FROM [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] [T] " +
        "INNER JOIN [CTE] " +
        "    ON [T].[CONTRACT_NO] = [CTE].[CONTRACT_NO] " +
        "   AND [T].[DETAIL_TYPE] = [CTE].[DETAIL_TYPE] " +
        "   AND [T].[INTERNAL_NO] = [CTE].[INTERNAL_NO] " +
        "WHERE [T].[CONTRACT_NO] = '"+contractNo+"' ";
    TalonDbUtil.update(TALON.getDbConfig(), runRowNumber);


    try {
        // เรียก SP เพื่อดึงข้อมูลจาก temp table เข้าตารางหลัก
        var result = executeExcelImport(
            'SP_PPLI_EXCEL_IMPORT_WASTE_CONTRACT', 
            ContractKind.Normal, 
            contractNo
        );

        if (!result || !result.status) {
            var msg = result ? result.message : "Unknown import error";
            TALON.setIsSuccess(false);
            TALON.addErrorMsg("Import failed [" + contractNo + "]: " + msg);
            LOG.error("Import failed: " + contractNo + " | " + msg);
            return;
        }

        // อัปเดตสถานะใน temp table
        var newIsUpdate = result['is_update'];
        var sqlUpdate = ""
            + "UPDATE [dbo].[PPLI_T_WASTE_CONTRACT_TEMP] "
            + "SET [IS_UPDATE] = '" + newIsUpdate + "' "
            + "WHERE [CONTRACT_NO] = '" + contractNo + "'";
        TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);

        LOG.success("Import success: " + contractNo + " | isUpdate=" + newIsUpdate);

        // สร้าง Log ID
        var logID = getNewLogID();

        // ตรวจสอบว่ามีข้อมูล D2 แล้วบันทึกประวัติ
        var hasD2 = hasContractD2(contractNo);
        var spList = hasD2
            ? ["SP_PPLI_L_WASTE_CONTRACTH", "SP_PPLI_L_WASTE_CONTRACTD", "SP_PPLI_L_WASTE_CONTRACTD2"]
            : ["SP_PPLI_L_WASTE_CONTRACTH", "SP_PPLI_L_WASTE_CONTRACTD"];

        var logResult = logContractHistory(contractNo, spList, newIsUpdate, logID);

        if (!logResult || !logResult.status) {
            var logMsg = logResult ? logResult.message : "Unknown log error";
            TALON.addErrorMsg("Log failed [" + contractNo + "]: " + logMsg);
            LOG.warn("Log failed: " + contractNo + " | " + logMsg);
        } else {
            LOG.info("Log created for contract: " + contractNo + " | LogID=" + logID);
            LOG.success('Waste Contract: ['+contractNo+'], is update ['+newIsUpdate+'] Successfully Imported. ');
            TALON.addMsg('✅ Waste Contract: ['+contractNo+'], Successfully Imported. ');

        }

        // ลบข้อมูล temp หลังจากประมวลผลเสร็จ
        var sqlDel = "DELETE FROM [PPLI_T_WASTE_CONTRACT_TEMP] WHERE [CONTRACT_NO] = '" + contractNo + "'";
        TalonDbUtil.delete(TALON.getDbConfig(), sqlDel);
        LOG.info("Temp data deleted for contract: " + contractNo);

    } catch (e) {
        TALON.setIsSuccess(false);
        TALON.addErrorMsg("Exception: " + e.message + " [CONTRACT_NO=" + contractNo + "]");
        LOG.error("Exception: " + contractNo + " | " + e.message);
    }



    var listChargeType = 
        "SELECT [CHARGETYPE] " +
        "FROM (VALUES (1),(2),(3),(4),(5),(6)) AS [AllChargeTypes]([CHARGETYPE]) " +
        "WHERE [CHARGETYPE] NOT IN ( " +
        "    SELECT [CHARGETYPE] " +
        "    FROM [dbo].[PPLI_T_WASTE_CONTRACTD2] " +
        "    WHERE [CONTRACT_NO] = '"+contractNo+"' " +
        ")";

    var missingChargeType = TalonDbUtil.select(TALON.getDbConfig(), listChargeType);

    if (missingChargeType) {
        var rowNo = 1; 
        missingChargeType.forEach(function(row) {
            var numList = TALON.getNumberingData('PPLI_N_IMS_INTERNAL_NO', 1);
            var _NUM = numList[0];

            var insertDefault = 
                "INSERT INTO [PPLI_T_WASTE_CONTRACTD2] " +
                "([CONTRACT_NO], [CHARGETYPE], [INTERNAL_NO], [ROW_NO]) " +
                "VALUES (" +
                "'" + contractNo + "', " +
                row['CHARGETYPE'] + ", " +
                "'" + _NUM + "', " +
                rowNo + 
                ")";

            TalonDbUtil.insert(TALON.getDbConfig(), insertDefault);

            rowNo++;
        });
    }


    LOG.step("Finish processing contract: " + contractNo);
});

