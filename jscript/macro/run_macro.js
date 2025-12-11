// run_macro.js
// Nashorn script to run Excel macro using JACOB 1.10

var ActiveXComponent = Java.type("com.jacob.activeX.ActiveXComponent");
var Dispatch = Java.type("com.jacob.com.Dispatch");
var Variant = Java.type("com.jacob.com.Variant");

function runMacro(filePath, macroName) {
    try {
        // Start Excel
        var excel = new ActiveXComponent("Excel.Application");
        excel.setProperty("Visible", false); // set true if you want to see Excel

        // Open workbook
        var workbooks = excel.getProperty("Workbooks").toDispatch();
        var workbook = Dispatch.call(workbooks, "Open", filePath).toDispatch();

        // Run macro
        var result = Dispatch.call(excel, "Run", macroName);

        // Close workbook without saving
        Dispatch.call(workbook, "Close", false);
        excel.invoke("Quit");

        print("Macro '" + macroName + "' ran successfully.");
        return result;

    } catch (e) {
        print("Error running macro: " + e);
    }
}

// Example usage
var filePath = "C:\\Users\\bb25004\\items\\dev\\TALON\\DMTT\\jscript\\macro\\demo_macro.xlsm";
var macroName = "Module1.HelloWorld"; // replace with your macro name

runMacro(filePath, macroName);
