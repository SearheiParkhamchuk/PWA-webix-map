const CACHE_KEY = 'pwa-webix-map-v1'
const DYNAMIC_CACHE = 'dynamic-cache-v1'

const ASSETS_URLS = ['./index.html', './main.js', './main.css']

// First, check the data in the cache and then we try to get the data if they are not in the cache
const cacheFirst = async (request) => {
  const cached = await caches.match(request)
  return cached ?? fetch(request).catch((err) => console.log(err))
}

// First, try to get data over the network, if there is an error, then we take data from the cache or show a page with a message
const networkFirst = async (request) => {
  const cache = await caches.open(DYNAMIC_CACHE)
  try {
    const response = await fetch(request)
    await cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = cache.match(request)
    return cached ?? caches.match('/offline.html')
  }
}

self.addEventListener('install', async () => {
  try {
    const cache = await caches.open(CACHE_KEY)
    await cache.addAll(ASSETS_URLS)
  } catch (err) {
    console.error(err)
  }
})

self.addEventListener('activate', () => {
  console.log('activate')
})

// Called every time for any data request
self.addEventListener('fetch', async (event) => {
  const { request } = event
  const url = new URL(request.url)
  // if (url.origin === location.origin) {
  //   event.respondWith(cacheFirst(request))
  // } else {
  //   event.respondWith(networkFirst(request))
  // }
})
