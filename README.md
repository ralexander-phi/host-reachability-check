# Client-side Host Reachability

A simple, client-side javascript only, website reachability checker.

Unlike most website monitoring tools, this project only performs checks from the user's web browser.
There is no backend.
This is helpful in situations where you're not able to use a [server-side monitoring tool](https://github.com/Enapiuz/awesome-monitoring).
Those are much more full featured, so please consider those first.

You can [see a demo here](https://alexsci.com/host-reachability-check/), which serves the content in this repo.

## Setup

To create your own list of monitored sites:

* fork this repo
* edit `docs/monitor.json`
* deploy to [your own GitHub pages site](https://gohugo.io/hosting-and-deployment/hosting-on-github/) (or your preferred [static hosting](https://github.com/b-long/awesome-static-hosting-and-cms#free-hosting)).
  * be sure to deploy from the `docs` directory

You shouldn't need to edit the HTML or javascript, just the JSON file.

If you've deployed the site correctly, you should be able to see it at `https://<username>.github.io/host-reachability-check/`.

## Editing on GitHub

Open https://github.com/ and navigate to your fork of this project.
Open the `docs/monitor.json` file and click the pencil icon to edit it.

You can commit this file and GitHub pages will update your site within a minute or so.


## Editing Locally

`git clone` the project to your development computer.

If you're only looking to edit the monitors, then you can edit `docs/monitor.json` directly.
You can use [any http server](https://github.com/praharshjain/http-server-one-liners) to serve this content.
I prefer the python3 version:

    python -m http.server --directory docs/ 8000

You can now view your changes at [http://localhost:8000/](http://localhost:8000).

Once you're happy with the changes, commit and push your changes to update your site.

If you're looking to change the HTML, JavaScript, or CSS, you'll need to follow the instructions in `README-full-build.md`.


## Configuration

Edit `monitor.json` to add the sites you'd like to monitor.

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


### Other Settings

* `refreshSeconds` retry checks after a period of time

Settings can be applied at the top level (to apply to all sites) or as an override for a per-site configuration.


## Debugging and Logging

Your web browser likely supports [developer tools](https://www.computerhope.com/issues/ch002153.htm).

Open the network tab to watch network requests and to see detailed information about their status.

Open the console log to see logs from the application, as well as other error information provided by the web browser.

