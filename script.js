function setStatus(element, statusClassName) {
  element.classList.remove('up');
  element.classList.remove('down');
  element.classList.remove('checking');
  element.classList.add(statusClassName);
}

function setup(config) {
  var tbody = document.querySelector('#checks-tbody');

  var defaultRefresh = null;
  if ('refreshSeconds' in config) {
    defaultRefresh = config['refreshSeconds'];
  }

  for (idx in config['sites']) {
    var row = tbody.insertRow(-1);
    var nameCell = row.insertCell(0);
    var statusCell = row.insertCell(1);
    const name = config['sites'][idx]['name'];
    const url = config['sites'][idx]['url'];

    var siteRefresh = defaultRefresh;
    if ('refreshSeconds' in config['sites'][idx]) {
      siteRefresh = config['sites'][idx]['refreshSeconds'];
    }

    nameCell.innerText = name;
    var statusElm = document.createElement('div');
    statusCell.appendChild(statusElm);

    var whichCheck = config['sites'][idx]['check'];
    var params = null;
    if ('params' in config['sites'][idx]) {
      params = config['sites'][idx]['params'];
    }

    if ('img' == whichCheck) {
      imgCheck(name, url, siteRefresh, statusElm);
    } else if ('http-get' == whichCheck) {
      httpGetCheck(name, url, siteRefresh, params, statusElm);
    } else {
      console.log('Unsure what to do for ' + name + ' ' + whichCheck);
    }
  }
}

function genImgCheck(name, url, siteRefresh, statusElm) {
  return function() {
    imgCheck(name, url, siteRefresh, statusElm);
  }
}

function imgCheck(name, url, siteRefresh, statusElm) {
  setStatus(statusElm, 'checking');
  console.log('Image check: ' + name);

  var img = document.createElement('img');
  img.onload = function() {
    setStatus(statusElm, 'up');
  }
  img.onerror = function() {
    setStatus(statusElm, 'down');
  }

  // Burst the browser cache
  img.src = url + '?' + Math.random();

  setTimeout(genImgCheck(name, url, siteRefresh, statusElm), siteRefresh*1000);
}

function genHttpGetCheck(name, url, siteRefresh, params, statusElm) {
  return function() {
    httpGetCheck(name, url, siteRefresh, params, statusElm);
  }
}

function httpGetCheck(name, url, siteRefresh, params, statusElm) {
  setStatus(statusElm, 'checking');
  console.log('HTTP GET check: ' + name);

  fetch(url)
  .then(response => { 
    if (params['permitted-status'].includes(response.status)) {
      setStatus(statusElm, 'up');
    } else {
      // status code not permitted
      setStatus(statusElm, 'down');
    }
  })
  .catch(reason=>{
    // network error
    setStatus(statusElm, 'down');
  });

  setTimeout(genHttpGetCheck(name, url, siteRefresh, params, statusElm), siteRefresh*1000);
}

window.onload = function() {
  document.querySelector('#noscript').remove();
  fetch('monitor.json')
    .then(data=>{ return data.json()})
    .then(config=>{setup(config)})
}

