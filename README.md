# DMTT (Sale Order/Invoice modules)

## function group master 
`PR_SALE_ORDER` : Sale Order (Press)
`PR_INVOICE` : Invoice (Press)
`PR_SHIP_INST` : Shipment (Press)

## group config
`system` : PR_SALE_ORDER
`system` : PR_INVOICE
`system` : PR_SHIP_INST

## function group
`PR_SALE_ORDER` : <Func_ID>-<Func_Name> | TALON/APPLICATION/GENERALFREE/GENERALFREE.xhtml?PARAM_FUNC_ID=<Func_ID>&INIT_SEARCH=true
`PR_INVOICE` : <Func_ID>-<Func_Name> | TALON/APPLICATION/GENERALFREE/GENERALFREE.xhtml?PARAM_FUNC_ID=<Func_ID>&INIT_SEARCH=true

### PR_SALE_ORDER,PR_INVOICE

## Function List

✅ = Completed

⚠️ = In Progress


### [Sale Order Modules]
✅ `DMTT_PRESS_QT_DOWNLOAD` : Print Quotation (Press)

✅ `DMTT_T_PRESS_QT` : Create Quotation (Press) 

✅ `DMTT_T_PRESS_QT_LIST` : Quotation List (Press) 

✅ `DMTT_T_PRESS_SALES_ORDER` : Create Sales Order (Press) 

✅ `DMTT_T_PRESS_SALES_ORDER_EDIT` : Sales Order Edit (Press) 

✅ `DMTT_T_PRESS_SALES_ORDER_LIST` : Sales Order List (Press) ^

✅ `DMTT_T_PRESS_CONF_DELIIVERY_ORDER` : Confirm Delivery Order (Press)



Fixed conditional expression

### [Invoice Modules] 
✅ `DMTT_T_PRESS_SHIPMENT_INST` : Create Shipment Instruction (Press) 

✅ `DMTT_T_PRESS_SHIPMENT_INST_DETAIL` : Shipment Instruction Detail (Press) 

✅ `DMTT_T_PRESS_SHIPMENT_INST_LIST` : Shipment Instruction List (Press) 

✅ `DMTT_T_PRESS_ASSIGN_SHIP_JOB` : Assign Shipment Job (Press) 

✅ `DMTT_T_PRESS_SHIPMENT_JOB_LIST` : Shipment Job List (Press) 

✅ `DMTT_T_PRESS_SHIPMENT_JOB_DETAILS` : Shipment Job Details (Press) 

✅ `DMTT_T_PRESS_CREATE_INVOICE` : Create Invoice (Press)

✅ `DMTT_T_PRESS_INVOICE_DETAIL` : Invoice Detail (Press) 

✅ `DMTT_T_PRESS_INVOICE_LIST` : Invoice List (Press) 

✅ `DMTT_T_PRESS_DELIVERY_ORDER_DOWNLOAD` : Print Delivery Order (Press)

✅ `DMTT_T_PRESS_INVOICE_DOWNLOAD` : Print Invoice (Press)

✅ `DMTT_T_PRESS_SHIPMENT_ORDER_DOWNLOAD` : Print Shipping Order (Press)

✅ `DMTT_T_PRESS_PACKAGE_LIST_DOWNLOAD` : Print Packing List (Press)

✅ `DMTT_T_PRESS_SHIPPING_MARKS_DOWNLOAD` : Print Shipping Marks (Press)

✅ `DMTT_T_PRESS_CREATE_DNCN` : Create Debit/Credit Note (Press) 

✅ `DMTT_T_PRESS_DNCN_DETAIL` : Debit/Credit Note Detail (Press) 

✅ `DMTT_T_PRESS_SCAN_QA` : Scan QA (Press)

✅ `DMTT_R_PRESS_SALES` : Sales Report (Press)


<br/>


##  Necessary Tools


### [ID Numbering]
- `DMTT_N_LNNO`
- `DMTT_N_QT`
- `DMTT_N_QT_IN`
- `DMTT_N_SO`
- `DMTT_N_SO_IN`
- `DMTT_N_IV`
- `DMTT_N_IV_IN`


### [Hunyo Code]
- `DMTT_G_INVOICE_TYPE` : Invoice Type
- `DMTT_G_SO_STATUS` : SO Status, I_COMPCLS +

- `DMTT_G_CURRENCY` : Currency Code 
  - 'THB' : Thai Baht
  - 'USD' : US Dollar
  - 'EUR' : Euro
  - 'JPY' : Japanese Yen
  - 'CNY' : Chinese Yuan
  - 'SGD' : Singapore Dollar

- `DMTT_G_RATE_TYPE` : Exchange Rate Type | '1' : TTB | '2' : TTS | '3' : TTM
- `DMTT_T_CHK_BOX`
- `DMTT_G_APPROVE`
- `DMTT_G_PR_PATTERN`
- `DMTT_G_OS_COMFIRM`
- `DMTT_G_SHIP_INT_STATUS` (I_SHIP_CFM) Shipment Status | '0': Pending, '1': Picking, '2': Completed, '3': Confirmed 
- `DMTT_G_EMAIL_CFT`
- `DMTT_G_QA_STATUS` QA Status | '0': Not QA | '1': Passed | '2': Failed

### [Search Subform]
- `DMTT_T_SHP010_CS` : Ship To, I_SHIPTO | Bill To, I_BILLTO
- `DMTT_S_SO_LIST`: DMTT Sale Order Subform
- `DMTT_S_CURRENCY` : Currency Subform ^
- `DMTT_S_INVOICE_TYPE` : Allowed Invoice Type Subform
- `DMTT_S_CS` : Customer Subform +
- `DMTT_S_USER_LIST` : DMTT User List Subform ^

### [Table List]

- `MS_PRFG`
- `MS_CS`
- `MS_EXG`

- `T_PR_STOCK`
- `T_PR_WOH`

- `T_PR_QT_H`
- `T_PR_QT_D`

- `T_PR_SHIP_INST_H`
- `T_PR_SHIP_INST_D`

- `T_PR_SORD_H`
- `T_PR_SORD_D`

- `T_PR_INVOICE_H`
- `T_PR_INVOICE_D`


https://sandbox-dev-talon.bright-better.com/Talon/;jsessionid=351a87ace63d0b101a7f40fdcd29
