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
    monitorGroup = document.createElement('p');
    monitorGroup.classList.add('pb-6');
    checkDiv.appendChild(monitorGroup);
    h = document.createElement('h2');
    h.innerText = groupName;
    h.classList.add('subtitle');
    h.classList.add('is-5');
    monitorGroup.appendChild(h);

    for (idx in groupConfig['monitors']) {
      const monitorConfig = groupConfig['monitors'][idx];
      const name = monitorConfig['name'];
      const url = monitorConfig['url'];
      const whichCheck = monitorConfig['check'];

      var p = document.createElement('p');
      p.title = whichCheck + ' check for ' + url;
      monitorGroup.appendChild(p);

      var statusOuter = document.createElement('span');
      statusOuter.classList.add('statusOuter');
      statusOuter.classList.add('pr-2');
      p.appendChild(statusOuter);

      var statusSpan = document.createElement('span');
      statusSpan.classList.add('tag');
      statusSpan.classList.add('status');
      statusSpan.innerText = 'initializing';
      statusOuter.appendChild(statusSpan);

      var nameSpan = document.createElement('span');
      nameSpan.innerText = name;
      p.appendChild(nameSpan);


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
        imgCheck(name, url, siteRefresh, burstCache, statusSpan);
      } else if ('http-get' == whichCheck) {
        console.log("Starting http-get check for " + name + " " + url +
  	      " every " + siteRefresh + " seconds");
        httpGetCheck(name, url, siteRefresh, burstCache, params, statusSpan);
      } else {
        console.log('Unsure what to do for ' + name + ' ' + whichCheck);
      }
    }
  }
}

function genImgCheck(name, url, siteRefresh, burstCache, statusElm) {
  return function() {
    imgCheck(name, url, siteRefresh, burstCache, statusElm);
  }
}

function imgCheck(name, url, siteRefresh, burstCache, statusElm) {
  setStatus(statusElm, 'checking');

  var img = document.createElement('img');
  img.onload = function() {
    console.log(new Date().toISOString() + " " + name + " is up");
    img.remove();
    setStatus(statusElm, 'up');
    setTimeout(genImgCheck(name, url, siteRefresh, burstCache, statusElm), siteRefresh*1000);
  }
  img.onerror = function() {
    console.log(new Date().toISOString() + " " + name + " is down");
    img.remove();
    setStatus(statusElm, 'down');
    setTimeout(genImgCheck(name, url, siteRefresh, burstCache, statusElm), siteRefresh*1000);
  }

  var target = url;
  if (burstCache) {
    target = addCacheBurst(url);
  }
  img.src = target;
}

function genHttpGetCheck(name, url, siteRefresh, burstCache, params, statusElm) {
  return function() {
    httpGetCheck(name, url, siteRefresh, burstCache, params, statusElm);
  }
}

function httpGetCheck(name, url, siteRefresh, burstCache, params, statusElm) {
  setStatus(statusElm, 'checking');

  var target = url;
  if (burstCache) {
    target = addCacheBurst(url);
  }
  fetch(target)
  .then(response => { 
    if (params['permitted-status'].includes(response.status)) {
      console.log(new Date().toISOString() + " " + name + " is up (status-code: " + response.status + ")");
      setStatus(statusElm, 'up');
    } else {
      // status code not permitted
      console.log(new Date().toISOString() + " " + name + " is down (status-code: " + response.status + ")");
      setStatus(statusElm, 'down');
    }
  })
  .catch(reason=>{
    // network error
    setStatus(statusElm, 'down');
  });

  setTimeout(genHttpGetCheck(name, url, siteRefresh, burstCache, params, statusElm), siteRefresh*1000);
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

