function setStatus(element, state) {
  if (state == 'checking') {
    element.innerText = 'checking';
    // keep existing color
  } else if (state == 'up') {
    element.classList.add('is-success');
    element.classList.remove('is-danger');
    element.innerText = 'healthy';
  } else {
    element.classList.add('is-danger');
    element.classList.remove('is-success');
    element.innerText = 'down';
  }
}

function logMessage(element, name, msg) {
  var timestamp = new Date().toLocaleTimeString();
  var p = document.createElement('p');
  p.innerText = timestamp + ": " + msg;
  addToListMaxSize(element, p, 20);
  console.log(timestamp + ": " + name + " " + msg);
}

function addToListMaxSize(listElement, toAdd, maxSize) {
  while (listElement.childElementCount >= maxSize) {
    listElement.removeChild(listElement.firstChild);
  }
  listElement.appendChild(toAdd);
}

function setup(config) {
  var checkDiv = document.querySelector('#checks');

  var defaultRefresh = null;
  if ('refreshSeconds' in config) {
    defaultRefresh = config['refreshSeconds'];
  }

  var defaultBurstCache = true;
  if ('burstCache' in config) {
    defaultBurstCache = config['burstCache'];
  }

  for (grpIdx in config['groups']) {
    const groupConfig = config['groups'][grpIdx];
    const groupName = groupConfig['name'];
    var groupDetails = document.createElement('details');
    groupDetails.open = true;
    checkDiv.appendChild(groupDetails);

    var groupSummary = document.createElement('summary');
    groupSummary.innerText = groupName;
    groupSummary.classList.add('subtitle');
    groupSummary.classList.add('is-5');
    groupDetails.appendChild(groupSummary);

    var monitorGroup = document.createElement('p');
    monitorGroup.classList.add('pb-6');
    groupDetails.appendChild(monitorGroup);

    for (idx in groupConfig['monitors']) {
      const monitorConfig = groupConfig['monitors'][idx];
      const name = monitorConfig['name'];
      const url = monitorConfig['url'];
      const whichCheck = monitorConfig['check'];
      var about;
      if ('about' in monitorConfig) {
        about = monitorConfig['about'];
      } else {
        about = null;
      }

      var monitorDetails = document.createElement('details');
      monitorDetails.classList.add('pb-2');
      monitorGroup.appendChild(monitorDetails);

      var monitorSummary = document.createElement('summary');
      monitorDetails.appendChild(monitorSummary);

      var statusOuter = document.createElement('span');
      statusOuter.classList.add('statusOuter');
      statusOuter.classList.add('pr-2');
      monitorSummary.appendChild(statusOuter);

      var statusSpan = document.createElement('span');
      statusSpan.classList.add('tag');
      statusSpan.classList.add('status');
      statusSpan.classList.add('monitor-status');
      statusSpan.innerText = 'initializing';
      statusOuter.appendChild(statusSpan);

      var nameSpan = document.createElement('span');
      nameSpan.innerText = name;
      monitorSummary.appendChild(nameSpan);

      var details = document.createElement('pre');
      details.classList.add('monitor-details');
      details.classList.add('m-2');
      monitorDetails.appendChild(details);
      var detailsHeader = document.createElement('div');
      detailsHeader.innerText = "URL: " + url;
      details.appendChild(detailsHeader);
      var detailsHeader2 = document.createElement('p');
      detailsHeader2.innerText = "Check Type: " + whichCheck;
      details.appendChild(detailsHeader2);
      if (about) {
        var detailsHeader3 = document.createElement('p');
        detailsHeader3.innerText = about;
        details.appendChild(detailsHeader3);
      }

      var siteRefresh = defaultRefresh;
      if ('refreshSeconds' in monitorConfig) {
        siteRefresh = monitorConfig['refreshSeconds'];
      }

      var params = null;
      if ('params' in monitorConfig) {
        params = monitorConfig['params'];
      }

      var burstCache = defaultBurstCache;
      if ('burstCache' in monitorConfig) {
        burstCache = monitorConfig['burstCache'];
      }

      if ('img' == whichCheck) {
        console.log("Starting img check for " + name + " " + url +
  	      " every " + siteRefresh + " seconds");
        imgCheck(name, url, siteRefresh, burstCache, monitorDetails);
      } else if ('http-get' == whichCheck) {
        console.log("Starting http-get check for " + name + " " + url +
  	      " every " + siteRefresh + " seconds");
        httpGetCheck(name, url, siteRefresh, burstCache, params, monitorDetails);
      } else {
        console.log('Unsure what to do for ' + name + ' ' + whichCheck);
      }
    }
  }
}

function genImgCheck(name, url, siteRefresh, burstCache, monitorElm) {
  return function() {
    imgCheck(name, url, siteRefresh, burstCache, monitorElm);
  }
}

function imgCheck(name, url, siteRefresh, burstCache, monitorElm) {
  var statusElm = monitorElm.querySelector('.monitor-status');
  var monitorDetails = monitorElm.querySelector('.monitor-details');
  setStatus(statusElm, 'checking');

  var img = document.createElement('img');
  img.onload = function() {
    logMessage(monitorDetails, name, "up");
    img.remove();
    setStatus(statusElm, 'up');
    setTimeout(genImgCheck(name, url, siteRefresh, burstCache, monitorElm), siteRefresh*1000);
  }
  img.onerror = function() {
    logMessage(monitorDetails, name, "down");
    img.remove();
    setStatus(statusElm, 'down');
    setTimeout(genImgCheck(name, url, siteRefresh, burstCache, monitorElm), siteRefresh*1000);
  }

  var target = url;
  if (burstCache) {
    target = addCacheBurst(url);
  }
  img.src = target;
}

function genHttpGetCheck(name, url, siteRefresh, burstCache, params, monitorElm) {
  return function() {
    httpGetCheck(name, url, siteRefresh, burstCache, params, monitorElm);
  }
}

function httpGetCheck(name, url, siteRefresh, burstCache, params, monitorElm) {
  var statusElm = monitorElm.querySelector('.monitor-status');
  var monitorDetails = monitorElm.querySelector('.monitor-details');
  setStatus(statusElm, 'checking');

  var target = url;
  if (burstCache) {
    target = addCacheBurst(url);
  }
  fetch(target)
  .then(response => { 
    if (params['permitted-status'].includes(response.status)) {
      logMessage(monitorDetails, name, "up (status-code: " + response.status + ")");
      setStatus(statusElm, 'up');
    } else {
      // status code not permitted
      logMessage(monitorDetails, name, "down (status-code: " + response.status + ")");
      setStatus(statusElm, 'down');
    }
  })
  .catch(reason=>{
    // network error
    logMessage(monitorDetails, name, "down (see developer tools network tab)");
    setStatus(statusElm, 'down');
  });

  setTimeout(genHttpGetCheck(name, url, siteRefresh, burstCache, params, monitorElm), siteRefresh*1000);
}

function addCacheBurst(url) {
  var target = url;
  var cacheParam = '_cacheBurst=' + new Date().getTime();
  if (target.includes('?')) {
    target += '&' + cacheParam;
  } else {
    target += '?' + cacheParam;
  }
  return target;
}

window.addEventListener("DOMContentLoaded", e => {
  document.querySelector('#noscript').remove();
  fetch('monitor.json')
    .then(data=>{ return data.json()})
    .then(config=>{setup(config)})
});

