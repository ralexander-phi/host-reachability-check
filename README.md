# Client-side Host Reachability

A simple, client-side javascript only, website reachability checker.

Unlike most website monitoring tools, this project only performs checks from the user's web browser.
There is no backend.
This is helpful in situations where you're not able to use a [server-side monitoring tool](https://github.com/crazy-canux/awesome-monitoring).
Those are much more full featured, so please consider those first.

This repo auto deploys to GitHub Pages, you can [see a demo here](https://alexsci.com/host-reachability-check/).

## Setup

To create your own list of monitored sites: fork this repo, customize the list of monitors, and deploy to your own GitHub pages site (or your preferred [static hosting](https://github.com/b-long/awesome-static-hosting-and-cms#free-hosting)).
You shouldn't need to edit the HTML or javascript, just the JSON file.


## Creating monitors

Edit `monitors.json` to add the monitors you'd like to track.

There are two types of monitors supported:
* `http-get` - Performs an HTTP GET
* `img` - Tries to load an image

To add your monitor add a `name`, `url`, `check`, and any `params` as needed.
See the sample `monitor.json` for details.


### HTTP GET monitors

This monitor will run an HTTP GET against the selected URL and check if the HTTP status code is in a list of acceptable codes.

HTTP GET monitors are limited by [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) and cannot work when CORS doesn't permit resources to load.
You may need to log in to each site if the health endpoint requires a user authentication cookie.

Example:
```
{
  "name": "example",
  "url": "https://example.com/health",
  "check": "http-get",
  "params": {
    "permitted-status": [ 200, 204 ],
  }
}
```

### Image monitors

The image monitor isn't restricted by CORS limitations, so it will work for more sites.

The ideal image to monitor will be small (to keep data transfer low) and should be something unlikely to be removed by a future website update.
favicons are a natural choice here.

There are various failure cases where a site's images would be loadable but the site would be offline for users.
As such, this simple check won't be comprehensive and is not ideal.

Example:
```
{
  "name": "example",
  "url": "https://example.com/favicon.ico",
  "check": "img",
}
```
Note: `params` is not needed here.


## Settings

* `refreshSeconds` retry checks after a period of time

Settings can be applied at the top level (to apply to all sites) or as an override for a per-site configuration.

