# Full Build Process

You'll only need this if you're looking to contribute changes to this project, or you're looking for extra customizations.

Note that the hugo build process will overwrite `public/monitor.json` with `static/monitor.json`, so make sure you preserve any edits you've made in that file.

## Install Hugo

There's a couple ways to [install Hugo](https://gohugo.io/getting-started/installing/).


I like using Docker:

    docker run --rm -it \
      -v $(pwd):/src \
      -p 1313:1313 \
      klakegg/hugo:0.83.1-ext-alpine \
      serve


## Install nodejs

You'll also need to [install nodejs](https://nodejs.org/en/download/).

For on Debian I use:

    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs


## Install Dependencies

    npm i


## Running Locally

    hugo serve --watch --minify

Or using Docker:

    docker run --rm -it \
      -v $(pwd):/src \
      -p 1313:1313 \
      klakegg/hugo:0.83.1-ext-alpine \
      serve

The site should now be visible at [http://localhost:1313/](http://localhost:1313/).

## Build

For ease of deployments, the build output should be saved to the `public/` folder.
This ensures that anyone editing the script won't need to install all the development dependencies.

You can build with:

   hugo --minify

Or using Docker:

    docker run --rm -it \
      -v $(pwd):/src \
      -p 1313:1313 \
      klakegg/hugo:0.83.1-ext-alpine \
      --minify

Pay special attention to `public/monitor.json` and `static/monitor.json` to keep these in sync.
Once you're happy with your changes you can commit and push to deploy.
