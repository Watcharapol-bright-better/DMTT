(function () {
    // ============================================================
    // 1. INITIAL SETUP & CONFIGURATION
    // ============================================================
    var db = TALON.getDbConfig();
    var TABLE_WOH      = "T_PR_WOH";
    var TABLE_WOUSEMAT = "T_PR_WOUSEMAT";
    var TABLE_WRDTL    = "T_PR_WR_DTL";
    var TABLE_STOCK    = "T_MT_STOCK";

    var HeaderData   = TALON.getBlockData_Card(1);
    var FGDetailData = TALON.getBlockData_List(2);
    var RMData       = TALON.getBlockData_List(3);
    
    var I_WO = HeaderData["I_WO"];
    var u    = getUser();

    if (!I_WO) {
        TALON.addErrorMsg("Work Order No is required.");
        TALON.setIsSuccess(false);
        return;
    }

    try {
        TalonDbUtil.begin(db);

        var colWOH      = getColSet(TABLE_WOH);
        var colWOUSEMAT = getColSet(TABLE_WOUSEMAT);
        var colWRDTL    = getColSet(TABLE_WRDTL);

        // ============================================================
        // 2. PART A: UPDATE HEADER (T_PR_WOH)
        // ============================================================
        var fg = (FGDetailData && FGDetailData.length) ? FGDetailData[0] : null;
        var firstItem = fg ? fg["I_ITEMCODE"] : null; 
        var sets = [];

        function pushSet(col, val, isExpr) {
            if (!colWOH[String(col).toUpperCase()]) return;
            if (isExpr) sets.push(col + " = " + val);
            else sets.push(col + " = " + toSqlLiteral(val));
        }

        pushSet("I_PLAN_START",    HeaderData["I_PLAN_START"]);
        pushSet("I_PLAN_FINISHED", HeaderData["I_PLAN_FINISHED"]);
        pushSet("I_WO_TYPE",       HeaderData["I_WO_TYPE"]);
        pushSet("I_PR_MACHINE",    HeaderData["I_PR_MACHINE"]);
        pushSet("I_CUSTOMER",      HeaderData["I_CUSTOMER"]); 
        
        if (fg) {
            pushSet("I_DLY_DATE", fg["I_DLY_DATE"]);
            pushSet("I_WO_QTY",   fg["I_WO_QTY"]);
            pushSet("I_REQ_COIL", fg["I_REQ_COIL"]);
            pushSet("I_PRIORITY", fg["I_PRIORITY"]);
            pushSet("I_REM1",     fg["I_REM1"]);
        }

        pushSet("I_COMPLETE_FLG", "3");
        pushSet("UPDATED_DATE",   u.now);
        pushSet("UPDATED_BY",     u.userId);
        pushSet("UPDATED_PRG_NM", u.prgNm);
        if (colWOH["MODIFY_COUNT"]) pushSet("MODIFY_COUNT", "ISNULL(MODIFY_COUNT,0) + 1", true);

        if (sets.length) {
            var sqlUpdateWOH = "UPDATE dbo." + TABLE_WOH + " SET " + sets.join(", ") + " WHERE I_WO = " + toSqlLiteral(I_WO);
            TalonDbUtil.executeUpdateSQL(db, sqlUpdateWOH);
        }

        // ============================================================
        // 3. PART B: REBUILD MATERIAL & STOCK REDUCTION
        // ============================================================
        TalonDbUtil.executeUpdateSQL(db, "DELETE FROM dbo." + TABLE_WOUSEMAT + " WHERE I_WO = " + toSqlLiteral(I_WO));
        TalonDbUtil.executeUpdateSQL(db, "DELETE FROM dbo." + TABLE_WRDTL + " WHERE I_WO = " + toSqlLiteral(I_WO));

        // --- เรียงลำดับตาม Priority ก่อนประมวลผล ---
        RMData.sort(function(a, b) {
            return (toNum(a["I_PRIORITY"]) || 999) - (toNum(b["I_PRIORITY"]) || 999);
        });

        // เตรียมค่าน้ำหนักที่ต้องการตัด (Qty * RM_Wgt / 1000)
        var woQty = fg ? toNum(fg["I_WO_QTY"]) : 0;
        var rmWgtGram = fg ? toNum(fg["I_RM_WGT"]) : 0;
        var totalNeedWeightKg = (woQty * rmWgtGram) / 1000;

        var ln = 0;
        for (var i = 0; i < RMData.length; i++) {
            var src = RMData[i];
            if (!src || !isPicked(src["I_PICK_FLG"])) continue;

            ln++;
            var currentWeightInStock = toNum(src["I_CUR_WGT"]);
            
            // --- 3.1 Insert T_PR_WOUSEMAT ---
            var rowM = {
                "I_WO": I_WO, "I_LNNO": ln, "I_PICK_FLG": "1", "I_COIL_BK": "1",
                "I_WEIGHT": currentWeightInStock,
                "I_COILNO": src["I_COILNO"], "I_CUTNO": src["I_CUTNO"], "I_HOOPNO": src["I_HOOPNO"],
                "I_LOCATION": src["I_LOCCD"], "I_PRIORITY": src["I_PRIORITY"],
                "CREATED_DATE": u.now, "CREATED_BY": u.userId, "CREATED_PRG_NM": u.prgNm,
                "UPDATED_DATE": u.now, "UPDATED_BY": u.userId, "UPDATED_PRG_NM": u.prgNm, "MODIFY_COUNT": 0
            };
            var mtWo = (src["RM_WO"] && String(src["RM_WO"]).trim() !== "") ? src["RM_WO"] : src["I_COILNO"];
            rowM["I_WO_COILNO"] = mtWo; rowM["I_WO_CUTNO"] = mtWo; rowM["I_WO_HOOPNO"] = mtWo;
            insertByMapping(TABLE_WOUSEMAT, rowM, colWOUSEMAT);

            // --- 3.2 Insert T_PR_WR_DTL (ใช้ค่า Cur Wgt ก่อนตัดบันทึกลลง I_ORG_WGT) ---
            var rowD = {
                "I_WO": I_WO, "I_COIL_SEQ": ln, "I_ITEMCODE": firstItem,
                "I_COILNO": src["I_COILNO"], "I_CUT_NO": src["I_CUTNO"], "I_HOOPNO": src["I_HOOPNO"],
                "I_ORG_WGT": currentWeightInStock, // บันทึกค่าก่อนโดนตัด
                "I_COIL_BK": "1", "I_COIL_SCANNED_STATUS": "0",
                "CREATED_DATE": u.now, "CREATED_BY": u.userId, "CREATED_PRG_NM": u.prgNm,
                "UPDATED_DATE": u.now, "UPDATED_BY": u.userId, "UPDATED_PRG_NM": u.prgNm, "MODIFY_COUNT": 0
            };
            insertByMapping(TABLE_WRDTL, rowD, colWRDTL);

            // --- 3.3 UPDATE T_MT_STOCK (ตัดสต็อกจริงตามลำดับ) ---
            if (totalNeedWeightKg > 0) {
                var weightToSub = (currentWeightInStock >= totalNeedWeightKg) ? totalNeedWeightKg : currentWeightInStock;
                totalNeedWeightKg -= weightToSub;

                if (weightToSub > 0) {
                    var sqlUpdateStock = "UPDATE dbo." + TABLE_STOCK + " " +
                                         "SET I_CUR_WGT = ISNULL(I_CUR_WGT, 0) - " + weightToSub + ", " +
                                         "    UPDATED_DATE = " + toSqlLiteral(u.now) + ", " +
                                         "    UPDATED_BY = " + toSqlLiteral(u.userId) + " " +
                                         "WHERE I_COILNO = " + toSqlLiteral(src["I_COILNO"]) + 
                                         "  AND I_CUTNO = " + toSqlLiteral(src["I_CUTNO"]) +
                                         "  AND I_HOOPNO = " + toSqlLiteral(src["I_HOOPNO"]);
                    TalonDbUtil.executeUpdateSQL(db, sqlUpdateStock);
                }
            }
        }

        TalonDbUtil.commit(db);

        // --- CALL PROCEDURE ---
        var itemDataList = new Array();
        itemDataList['I_WO'] = I_WO;
        itemDataList['iID']  = u.userId;
        itemDataList['oMSG'] = ''; 
        var recitemNameList = ['oMSG'];
        
        var itemRecList = TalonDbUtil.prepareCall(TALON.getDbConfig(), 'DMTT_L_PR_WO', itemDataList, recitemNameList);
        
        for (var i = 0; i < itemRecList.length; i++) {
            var rec = itemRecList[i];
            if (rec !== 'OK') { TALON.addErrorMsg("Log Process: " + rec); } 
        }

        TALON.addMsg("Confirm, Update Work Order, and Stock Deducted successfully.");
        TALON.setIsSuccess(true);

    } catch (e) {
        TalonDbUtil.rollback(db);
        TALON.addErrorMsg("Save failed: " + e);
        TALON.setIsSuccess(false);
    }

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================
    function insertByMapping(tableName, dataMap, colSet) {
        var finalData = {}, finalCols = [];
        for (var k in dataMap) {
            if (colSet[k.toUpperCase()]) {
                finalData[k] = dataMap[k];
                finalCols.push(k);
            }
        }
        TalonDbUtil.insertByMap(db, tableName, finalData, Java.to(finalCols, "java.lang.String[]"));
    }

    function getUser() {
        var info = TALON.getUserInfoMap();
        return {
            userId: info ? info["USER_ID"] : "SYSTEM",
            prgNm:  info ? info["FUNC_ID"] : "BATCH",
            now:    new java.util.Date()
        };
    }

    function toSqlLiteral(v) {
        if (v == null) return "NULL";
        if (v instanceof java.util.Date) {
            var sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            return "'" + sdf.format(v) + "'";
        }
        if (typeof v === "number") return String(v);
        var s = String(v).replace(/'/g, "''");
        return s.trim() === "" ? "NULL" : "'" + s + "'";
    }

    function isPicked(v) {
        var s = String(v || "").trim().toUpperCase();
        return (v === true || s === "1" || s === "Y" || s === "TRUE" || s === "ON");
    }

    function toNum(v) {
        if (v == null) return 0;
        if (typeof v === "number") return v;
        return parseFloat(String(v).replace(/,/g, "")) || 0;
    }

    function getColSet(tableName) {
        var sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='" + tableName + "'";
        var rows = TalonDbUtil.select(db, sql);
        var set = {};
        if (rows) {
            for (var i = 0; i < rows.length; i++) {
                set[String(rows[i]["COLUMN_NAME"]).toUpperCase()] = true;
            }
        }
        return set;
    }
})();