
function executeExcelImport(spName, number) {
    var params = [];
    params['N']   = number;
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

var result = executeExcelImport(
    'SP_CalcFibonacci', 
    20
);

if (result.status) { 
  var x = result.data;
  TALON.addMsg(x);
}


