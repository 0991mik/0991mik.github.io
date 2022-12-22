const version = '20221222113158';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/jekyll/update/2022/12/18/welcome-to-jekyll/","/alembic/general/2016/08/29/example-post-three/","/general/2016/08/29/example-post-three/","/alembic/history/external%20sources/2016/08/28/example-post-two/","/history/external%20sources/2016/08/28/example-post-two/","/alembic/general/external%20sources/2016/08/27/example-post-one/","/general/external%20sources/2016/08/27/example-post-one/","/about/","/alembic/categories/","/categories/","/elements/","/alembic/elements/","/blog/","/alembic/blog/","/","/alembic/","/","/manifest.json","/manifest.json","/alembic/offline/","/offline/","/alembic/assets/search.json","/assets/search.json","/alembic/search/","/search/","/assets/styles.css","/alembic/assets/styles.css","/thanks/","/alembic/thanks/","/redirects.json","/sitemap.xml","/robots.txt","/blog/page2/","/blog/page3/","/blog/page4/","/feed.xml","/assets/styles.css.map","/alembic/assets/styles.css.map","/assets/logos/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
