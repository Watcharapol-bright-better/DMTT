var UserInfo  = TALON.getUserInfoMap();
var UserId    = UserInfo['USER_ID'];
var ProgramNM = UserInfo['FUNC_ID'];

function extractValues(input) {
    var result = [];
    var newIndex = 1;

    var parts = input.split(',');
    parts.forEach(function(pair) {
        pair = pair.trim();
        if (pair !== '') {
            var idxSplit = pair.split(':');
            if (idxSplit.length === 2) {
                var values = idxSplit[1].split('|');

                result.push({
                    index: newIndex,
                    I_SONO: values[0] || '',
                    INTERNAL_NO: values[1] || ''
                });

                newIndex++;
            }
        }
    });

    return result;
}


var OSStatus = {
    Open: '00',
    Delivered: '01',
    Closed: '02',
    Cancelled: '03'
};


function onCancelSOChk(item) {

    var sqlChk =
        "" +
        "SELECT " +
        "           [D].[I_SONO] " +
        "          ,[D].[INTERNAL_NO] " +
        "          ,[D].[I_LNNO] " +
        "          ,ISNULL([D].[I_COMPCLS],'') AS [I_COMPCLS] " +
        "          ,ISNULL([H].[I_CUSTOMER_PO],'') AS [I_CUSTOMER_PO] " +
        "          ,[D].[I_DLYDATE] " +
        "          ,ISNULL([H].[I_CSCODE],'') AS [I_CSCODE] " +
        "          ,ISNULL([MC].[I_NAME],'') AS [I_NAME] " +
        "          ,ISNULL([H].[I_SODATE],GETDATE()) AS [I_SODATE] " +
        "          ,[D].[I_ITEMCODE] " +
        "          ,[FG].[I_DESC] " +
        "          ,[D].[I_AMOUNT] " +
        "          ,[D].[I_UNTPRI] " +
        "          ,[D].[I_QTY] " +
        "          ,[D].[I_DLY_PLACE] " +
        "          ,ISNULL([H].[I_PIC],'') AS [I_PIC] " +
        "          ,ISNULL([SHIP_1].[I_SHIP_QTY], 0) AS [I_DELIVERED] " +
        "          ,ISNULL([SHIP_2].[I_SHIP_QTY], 0) AS [I_PICKED] " +
        "          ,IIF( " +
        "                ISNULL([D].[I_QTY], 0) - ISNULL([SHIP_1].[I_SHIP_QTY], 0) - ISNULL([SHIP_2].[I_SHIP_QTY], 0) < 0, " +
        "                0, " +
        "                ISNULL([D].[I_QTY], 0) - ISNULL([SHIP_1].[I_SHIP_QTY], 0) - ISNULL([SHIP_2].[I_SHIP_QTY], 0) " +
        "           ) AS [BALANCE] " +
        " " +
        "          ,ISNULL([D].[I_CONFIRM_STATUS], 0) AS [I_CONFIRM_STATUS] " +
        "          ,[D].[CREATED_DATE] " +
        "          ,[D].[CREATED_BY] " +
        "          ,[D].[CREATED_PRG_NM] " +
        "          ,[D].[UPDATED_DATE] " +
        "          ,[D].[UPDATED_BY] " +
        "          ,[D].[UPDATED_PRG_NM] " +
        "          ,[D].[MODIFY_COUNT] " +
        " " +
        "    FROM [T_PR_SORD_D] [D] " +
        "    LEFT JOIN [T_PR_SORD_H] [H] ON [H].[I_SONO] = [D].[I_SONO] " +
        "    LEFT JOIN [MS_CS] [MC] ON [MC].[I_CSCODE] = [H].[I_CSCODE] " +
        "    LEFT JOIN [MS_PRFG] [FG] ON [FG].[I_ITEMCODE] = [D].[I_ITEMCODE] " +
        " " +
        "    LEFT JOIN ( " +
        "        SELECT " +
        "             [SHIPD].[I_SONO] " +
        "            ,[SHIPD].[I_ITEMCODE] " +
        "            ,SUM([SHIPD].[I_SHIP_QTY]) AS [I_SHIP_QTY] " +
        "        FROM [T_PR_SHIP_INST_D] [SHIPD] " +
        "        LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH] " +
        "            ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST] " +
        "        WHERE [SHIPH].[I_SHIP_CFM] IN ('3') " +
        "        GROUP BY [SHIPD].[I_SONO], [SHIPD].[I_ITEMCODE] " +
        "    ) [SHIP_1] " +
        "        ON [SHIP_1].[I_SONO] = [D].[I_SONO] " +
        "        AND [SHIP_1].[I_ITEMCODE] = [D].[I_ITEMCODE] " +
        " " +
        "    LEFT JOIN ( " +
        "        SELECT " +
        "             [SHIPD].[I_SONO] " +
        "            ,[SHIPD].[I_ITEMCODE] " +
        "            ,SUM([SHIPD].[I_SHIP_QTY]) AS [I_SHIP_QTY] " +
        "        FROM [T_PR_SHIP_INST_D] [SHIPD] " +
        "        LEFT JOIN [T_PR_SHIP_INST_H] [SHIPH] " +
        "            ON [SHIPH].[I_SHIP_INST] = [SHIPD].[I_SHIP_INST] " +
        "        WHERE [SHIPH].[I_SHIP_CFM] IN ('0', '1', '2') " +
        "        GROUP BY [SHIPD].[I_SONO], [SHIPD].[I_ITEMCODE] " +
        "    ) [SHIP_2] " +
        "        ON [SHIP_2].[I_SONO] = [D].[I_SONO] " +
        "        AND [SHIP_2].[I_ITEMCODE] = [D].[I_ITEMCODE] " +
        "    WHERE [D].[I_SONO] = '" + item.I_SONO + "' " +
        "    AND [D].[INTERNAL_NO] = '" + item.INTERNAL_NO + "' ";


    var checkData = TalonDbUtil.select(TALON.getDbConfig(), sqlChk);

    if (!checkData || checkData.length === 0) {
        TALON.addErrorMsg("❌ SO Detail not found");
    }

    var deliveredQty = Number(checkData[0].I_DELIVERED);
    var status = checkData[0].I_COMPCLS;


    // Case 1: Open & Delivered Qty = 0
    if (status === OSStatus.Open && deliveredQty === 0) {

        var sqlUpdate = "UPDATE [T_PR_SORD_D] " +
          "SET [I_COMPCLS] = '" + OSStatus.Cancelled + "', " +
          "    [MODIFY_COUNT]  = ISNULL([MODIFY_COUNT], 0) + 1, " +
          "    [UPDATED_DATE]  = GETDATE(), " +
          "    [UPDATED_PRG_NM]= '" + ProgramNM + "', " +
          "    [UPDATED_BY]    = '" + UserId + "' " +
          "WHERE I_SONO = '" + item.I_SONO + "' " +
          "AND INTERNAL_NO = '" + item.INTERNAL_NO + "'";

        TalonDbUtil.update(TALON.getDbConfig(), sqlUpdate);

        TALON.addMsg("✅ Cancelled SO Detail Successfully");
        TALON.setIsSuccess(true);
        return;
    }

    // Case 2: Open & Delivered Qty > 0
    if (status === OSStatus.Open && deliveredQty > 0) {
        TALON.addErrorMsg(
            "⚠️ SO Detail have been partially delivered. Please use Close SO funtion instead."
        );
        return;
    }

    // Case 3: Closed
    if (status === OSStatus.Closed) {
        TALON.addErrorMsg("⚠️ SO Detail is already closed");
        return;
    }

    // Case 4: Cancelled
    if (status === OSStatus.Cancelled) {
        TALON.addErrorMsg("⚠️ SO Detail is already cancelled");
        return;
    }
}


var searchData = TALON.getConditionData();
var valStr = extractValues(searchData.SELECTED);

if (valStr == '') {
    TALON.addErrorMsg('⚠️ No SO selected');
} else {
    valStr.forEach(function(item) {
        onCancelSOChk(item);
    });
}



// clear stack
TALON.setSearchConditionData('SELECTED', '', '');
