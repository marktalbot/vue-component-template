// Initial lifecycle
// --------------------
// 1. download
// 2. install
// 3. activate

// basic worker events
// --------------------
// install
// message
// sync
// activate
// install
// fetch

// Temp stuff
// let namespace = 'mt';
// let version   = 'v1';
// let cacheName = `${namespace}-${version}`;
// let assets    = ['foo.png'];

const ACTIONS = {
    INITIALIZE           : 'INITIALIZE',
    PRELOAD              : 'PRELOAD',
    PRELOADING_COMPLETED : 'PRELOADING_COMPLETED',
    RESOURCE_PRELOADED   : 'RESOURCE_PRELOADED',
}

//-------------------------- good
const CACHE = {
    namespace : undefined,
    version   : undefined,
    get name() {
        return `${this.namespace}-${this.version}`;
    }
};
let messageChannelPort;
let debug = false;
//-------------------------- good

self.addEventListener('install', (event) => {
    // Perform install stuff (open caches, etc)
    event.waitUntil(
        self.skipWaiting().then(() => {
            console.log('EVENT: install', Date.now());
            // caches.open(cacheName).then((cache) => {
            //     console.log('Opened cache:', cacheName);
            //     return cache.addAll(assets);
            // })
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('EVENT: activate');
});

self.addEventListener('message', (event) => {
   console.log('EVENT: message', event);
   event.waitUntil(handleMessage(event.data));
});

// @TODO: Temp code from Google docs.... switch out
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        console.log('fetching...........................')
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// const reducer = () => {
//     switch (action === 'TEST1') {
//         case label_1:
//             // statements_1
//             break;
//         default:
//             // statements_def
//             break;
//     }
// }

function handleMessage(action) {
    switch (action.type) {
        case 'INITIALIZE':
            console.log('handleMessage: INITIALIZE', action.payload);
            initialize(action.payload);
            break;
        case 'PRELOAD':
            console.log('handleMessage: PRELOAD', action.payload);
            preloadAll(CACHE.name, action.payload);
            break;
        default:
            break;
    }
}

function initialize(data) {
    console.log('function initialize()', data);
    CACHE.namespace    = data.namespace;
    CACHE.version      = data.version;
    debug              = data.debug;
    messageChannelPort = data.messageChannelPort;
    
    console.log(CACHE);
    console.log('CACHE', CACHE.name);
}

function preload(cache, asset) {
    // @TODO need to build this out more
    console.log(asset)
    return cache.add(asset).then(() => {
        messageChannelPort.postMessage({
            type    : ACTIONS.RESOURCE_PRELOADED,
            payload : {},
        });
    });
}

function preloadAll(cacheName, data) {
    return caches
        .open(cacheName)
        .then((cache) => Promise.all(data.map((asset) => preload(cache, asset))))
        .then(() => {
            // @TODO Extract actions into own file and import into Preloader.js and worker.js (Will this break the worker if it's being sym linked?)
            messageChannelPort.postMessage({
                type    : ACTIONS.PRELOADING_COMPLETED,
                payload : {},
            });
        }
    );
}