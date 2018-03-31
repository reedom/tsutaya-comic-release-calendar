(function () {
  function loadLatestPageInfo() {
    const pageInfo = localStorage.pageInfo;
    return pageInfo ? JSON.parse(pageInfo) : null;
  }

  function storeLatestPageInfo(pageInfo) {
    localStorage.pageInfo = JSON.stringify(pageInfo);
    return pageInfo;
  }

  function notify(info) {
    chrome.browserAction.setBadgeText({text: info.month + "月"});
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function pageExists(url) {
    return fetch(url, { method: 'HEAD' })
      .then(req => {
        if (req.status === 200) {
          return true;
        }
        throw new Error('not found');
      })
      .catch(err => {
        throw err;
      });
  }

  function createURL({ year, month }) {
    const y = pad(year);
    const m = pad(month);
    return `https://www.discas.net/netdvd/comic-rental/releaseCalendar${y}${m}.html?sc_int=movie_cmc_header_calendar_area_top`;
  }

  function getThisMonth() {
    const today = new Date();
    return { year: today.getYear() % 100, month: today.getMonth() + 1, day: today.getDay() + 1 };
  }

  function getNextMonth() {
    let { year, month, day } = getThisMonth();
    return (month < 11) ? { year, month: month + 1, day } : { year: year + 1, month: 1, day };
  }

  function getToday() {
    const today = new Date();
    return { day: today.getDay() };
  }
  
  function getPageInfo(ym) {
    const url = createURL(ym);
    return pageExists(url)
      .then(() => { return { ...ym, url }; })
  }

  function getLatestPageInfo() {
    return getPageInfo(getNextMonth())
      .catch(err => {
        return getPageInfo(getThisMonth());
      });
  }

  function check() {
    let pageInfo = loadLatestPageInfo();
    if (!pageInfo) {
      getLatestPageInfo()
        .then(storeLatestPageInfo)
        .then(notify)
        .catch(err => {});
      return;
    }

    const nextMonth = getNextMonth();
    if (nextMonth.month === pageInfo.month) {
      // up to date
      return;
    }

    const thisMonth = getThisMonth();
    if (thisMonth.month === pageInfo.month && thisMonth.day < 20) {
      // new calendar will be released 20th or later of a month.
      // until then it skip the check to save the network bandwidth.
      return;
    }

    getPageInfo(nextMonth)
      .then(storeLatestPageInfo)
      .then(notify)
      .catch(err => {});
  }

  chrome.browserAction.onClicked.addListener(function() {
    chrome.browserAction.setBadgeText({text: ''});
    let pageInfo = loadLatestPageInfo();
    if (!pageInfo) return;
    chrome.tabs.create({ url: pageInfo.url });
  });

  const HOUR = 60 * 60 * 1000;
  setInterval(check, 4 * HOUR);
  check();
})();
