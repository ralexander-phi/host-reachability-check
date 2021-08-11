function setStatus(element, state) {
  element.classList.remove('is-success');
  element.classList.remove('is-warning');
  element.classList.remove('is-danger');
  if (state == 'checking') {
    element.classList.add('is-warning');
    element.innerText = 'checking';
  } else if (state == 'up') {
    element.classList.add('is-success');
    element.innerText = 'healthy';
  } else {
    element.classList.add('is-danger');
    element.innerText = 'down';
  }
}

function setup(config) {
  var checkDiv = document.querySelector('#checks');

  var defaultRefresh = null;
  if ('refreshSeconds' in config) {
    defaultRefresh = config['refreshSeconds'];
  }

  for (idx in config['sites']) {
    const name = config['sites'][idx]['name'];
    const url = config['sites'][idx]['url'];
    const whichCheck = config['sites'][idx]['check'];

    var p = document.createElement('p');
    p.title = whichCheck + ' check for ' + url;
    checkDiv.appendChild(p);

    var statusOuter = document.createElement('span');
    statusOuter.classList.add('pr-2');
    statusOuter.style = 'width: 5.5rem; display: inline-block; text-align: right';
    p.appendChild(statusOuter);

    var statusSpan = document.createElement('span');
    statusSpan.classList.add('tag');
    statusSpan.classList.add('is-warning');
    statusSpan.innerText = 'initializing';
    statusOuter.appendChild(statusSpan);

    var nameSpan = document.createElement('span');
    nameSpan.innerText = name;
    p.appendChild(nameSpan);


    var siteRefresh = defaultRefresh;
    if ('refreshSeconds' in config['sites'][idx]) {
      siteRefresh = config['sites'][idx]['refreshSeconds'];
    }

    var params = null;
    if ('params' in config['sites'][idx]) {
      params = config['sites'][idx]['params'];
    }

    if ('img' == whichCheck) {
      console.log("Starting img check for " + name + " " + url +
	      " every " + siteRefresh + " seconds");
      imgCheck(name, url, siteRefresh, statusSpan);
    } else if ('http-get' == whichCheck) {
      console.log("Starting http-get check for " + name + " " + url +
	      " every " + siteRefresh + " seconds");
      httpGetCheck(name, url, siteRefresh, params, statusSpan);
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

  var img = document.createElement('img');
  img.onload = function() {
    console.log(new Date().toISOString() + " " + name + " is up");
    img.remove();
    setStatus(statusElm, 'up');
  }
  img.onerror = function() {
    console.log(new Date().toISOString() + " " + name + " is down");
    img.remove();
    setStatus(statusElm, 'down');
  }

  // Burst the browser cache
  img.src = url + '?_cacheBurst=' + new Date().getTime();

  setTimeout(genImgCheck(name, url, siteRefresh, statusElm), siteRefresh*1000);
}

function genHttpGetCheck(name, url, siteRefresh, params, statusElm) {
  return function() {
    httpGetCheck(name, url, siteRefresh, params, statusElm);
  }
}

function httpGetCheck(name, url, siteRefresh, params, statusElm) {
  setStatus(statusElm, 'checking');

  // TODO: needs to check if we have the ? already
  //       optional
  //       pick parameter name
  fetch(url + '?_cacheBurst=' + new Date().getTime())
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

  setTimeout(genHttpGetCheck(name, url, siteRefresh, params, statusElm), siteRefresh*1000);
}

window.onload = function() {
  document.querySelector('#noscript').remove();
  fetch('monitor.json')
    .then(data=>{ return data.json()})
    .then(config=>{setup(config)})
}

