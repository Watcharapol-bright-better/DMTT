
# COMMON_JS_BB 
lib ส่วนกลางสำหรับจัดการ Running Number และการฟอร์แมตวันที่


---


## 1. Running Number Generator



ใช้สำหรับสร้างเลขรันไอดี (Running Number) จากฐานข้อมูล
ถ้าใช้ในเครื่องตัวเองต้องลง `SP_RUN_NUMBERING_V1` ด้วยมาด้วย



### `RunningNo.genId(id, format, isCommit)`



| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | รหัสประเภทเลขรัน (เช่น "DMTT_N_IV") |
| `format` | `string` | รูปแบบของเลขรัน (เช่น "IVyyyymmxxxxx") |
| `isCommit` | `boolean` | (Optional) ยืนยันการอัปเดตเลขรันย้อนกลับไม่ได้ (Default: `false`) |



**ตัวอย่างการใช้งาน:**



```js
var no = RunningNo.genId("DMTT_N_IV", "IVyyyymmxxxxx", true);
// result: "IV20260100001"
```



---



## 2. Date Format Utility



ใช้สำหรับแปลงรูปแบบวันที่และเวลาให้อยู่ในรูปแบบมาตรฐาน



### `DateFmt.formatDate(dateString)`



แปลงวันที่ให้เป็นรูปแบบ `YYYY-MM-DD`



```js
var date = DateFmt.formatDate("Mon Dec 29 00:00:00 ICT 2025");
// result: "2025-12-29"
```



### `DateFmt.formatDateTime(dateTimeString)`



แปลงวันเวลาให้เป็นรูปแบบ `YYYY-MM-DD HH:mm:ss`



```js
var dateTime = DateFmt.formatDateTime("Thu Dec 25 06:38:09 GMT 2025");
// result: "2025-12-25 06:38:09"
```

