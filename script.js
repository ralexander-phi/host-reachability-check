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
    var p = document.createElement('p');
    var nameSpan = document.createElement('span');
    var statusSpan = document.createElement('span');
    p.appendChild(statusSpan);
    p.appendChild(nameSpan);
    checkDiv.appendChild(p);

    const name = config['sites'][idx]['name'];
    const url = config['sites'][idx]['url'];

    nameSpan.innerText = name;
    statusSpan.classList.add('tag');
    statusSpan.classList.add('m-2');
    statusSpan.classList.add('is-warning');
    statusSpan.innerText = 'checking';

    var siteRefresh = defaultRefresh;
    if ('refreshSeconds' in config['sites'][idx]) {
      siteRefresh = config['sites'][idx]['refreshSeconds'];
    }

    var whichCheck = config['sites'][idx]['check'];
    var params = null;
    if ('params' in config['sites'][idx]) {
      params = config['sites'][idx]['params'];
    }

    if ('img' == whichCheck) {
      imgCheck(name, url, siteRefresh, statusSpan);
    } else if ('http-get' == whichCheck) {
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

