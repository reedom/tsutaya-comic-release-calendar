(function () {
  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }
  
	function dateContent($td) {
		if (/^\d{4}\/\d{2}\/\d{2}/.test($td.textContent)) {
			return $td.textContent;
		}
	}

  function getTimeRange(settings, date) {
		const m     = date.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
		const ymd   = `${m[1]}${m[2]}${m[3]}`;
    if (settings.allday) {
      // (2018, 12, 32) still works...
      const date = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]) + 1);
      const [y, mm, d]  = [date.getFullYear(), date.getMonth() + 1,date.getDate()];
      return { start: ymd, end: `${y}${pad(mm)}${pad(d)}` };
    } else {
      const start = settings.starttime.replace(':', '');
      const end   = settings.endtime.replace(':', '');
      return { start: `${ymd}T${start}00`,
               end:   `${ymd}T${end}00` };
    }
  }

	function createLink(settings, date, $link, title, author, publisher) {
		const text = encodeURIComponent(`${title} レンタル開始`);
		const desc = encodeURIComponent(`${author}, ${publisher}`);

    const range = getTimeRange(settings, date);
		const start = encodeURIComponent(range.start);
		const end   = encodeURIComponent(range.end);

		const $a = document.createElement('a');
		$a.href = `http://www.google.com/calendar/event?action=TEMPLATE&text=${text}` +
				  `&dates=${start}/${end}` +
				  `&details=${desc}&location=TSUTAYA&trp=true&sprop=&sprop=name:`;
		$a.target = "_blank";
		$a.rel    = "nofollow";
		$a.textContent = date;
		return $a;
	}

  function loadSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get({
        allday: true,
        starttime: '10:00',
        endtime: '10:30',
      }, resolve);
    });
  }

  function populate(settings) {
	  document
		  .querySelectorAll("tr>td:first-child")
		  .forEach($date => {
			  const date = dateContent($date);
			  if (!date) return;

			  const $link      = $date.nextElementSibling.nextElementSibling.nextElementSibling;
			  const $title     = $link.nextElementSibling;
			  const $author    = $title.nextElementSibling;
			  const $publisher = $author.nextElementSibling.nextElementSibling;

			  const $a = createLink(settings, date, $link, $title.textContent, $author.textContent, $publisher.textContent);
			  const $parent = $date.parentNode;
			  $date.textContent = '';
			  $date.appendChild($a);
		  });
  }
  loadSettings()
    .then(populate);
})();
