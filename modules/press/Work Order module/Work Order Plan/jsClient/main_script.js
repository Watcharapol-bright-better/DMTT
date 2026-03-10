var woWatcherStarted = false;

function watchWO() {

  const wo = document.getElementById("TLN_1_I_WO");
  const cond = document.getElementsByName("CNDTN_I_WO")[0];
  const btn = document.getElementById("TLN_1_confirm wo");

  if (!wo || !cond || !btn) return;

  const current = wo.value.trim();
  if (current === "") return;

  const lastWO = sessionStorage.getItem("AUTO_WO_LAST");

  // ถ้า WO เปลี่ยน
  if (current !== lastWO) {

    console.log("WO detected:", current);

    //cond.value = current;
    sessionStorage.setItem("AUTO_WO_LAST", current);

    btn.click();
  }
}

function startWOWatcher() {

  if (woWatcherStarted) return;
  woWatcherStarted = true;

  setInterval(function () {
    watchWO();
  }, 300);

}

function resizeContents_end() { 
  startWOWatcher();
}