(function () {
  function showError(text) {
    let elm = document.getElementById('error');
    elm.textContent = text;
  }

  function hideError(text) {
    showError('');
  }

  function saveOptions(values) {
    chrome.storage.sync.set(values, () => window.close());
  }

  function restoreOptions() {
    chrome.storage.sync.get({
      allday: true,
      starttime: '10:00',
      endtime: '10:30',
    }, applyValues);
  }

  function readValues() {
    return {
      allday:    document.getElementById('allday').checked,
      starttime: document.getElementById('starttime').value,
      endtime:   document.getElementById('endtime').value,
    };
  }

  function applyValues(values) {
    document.getElementById('allday').checked = values.allday;

    let elm;
    elm = document.getElementById('starttime');
    elm.value = values.starttime;
    elm.disabled = values.allday;

    elm = document.getElementById('endtime');
    elm.value = values.endtime;
    elm.disabled = values.allday;
  }

  function validateValues(values) {
    if (values.allday) {
      return;
    }

    if (!values.starttime || !values.endtime) {
      return "開始時刻・終了時刻を入力してください";
    }

    if (values.endtime < values.starttime) {
      if (!/^23:/.test(values.starttime) || !/^00:/.test(values.endtime)) { //23->00のみ許可
        return "開始時刻と終了時刻が逆かもしれません";
      }
    }
  }
  
  function onFormSubmit(e) {
    e.preventDefault();
    hideError();

    const values = readValues();
    const error = validateValues(values);
    if (error) {
      showError(error);
      return;
    }
      
    saveOptions(values);
  }

  function onAlldayChange() {
    const { allday } = readValues();
    document.getElementById('starttime').disabled = allday;
    document.getElementById('endtime').disabled = allday;
  }

  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('form').addEventListener('submit', onFormSubmit);
  document.getElementById('allday').addEventListener('change', onAlldayChange);
})();
