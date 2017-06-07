const ACTIONS = {
    INITIALIZE           : 'INITIALIZE',
    PRELOAD              : 'PRELOAD',
    PRELOADING_COMPLETED : 'PRELOADING_COMPLETED',
    RESOURCE_PRELOADED   : 'RESOURCE_PRELOADED', // @TODO: maybe rename this
}

export default class Preloader {

    constructor({ namespace, version, assets, scope = '/', worker = '/worker.js', debug = false}) {
        this.namespace = namespace;
        this.version   = version;
        this.assets    = assets;
        this.scope     = scope;
        this.worker    = worker;
        this.debug     = debug;
        this.messageChannel;
        
        console.log(this.debug, arguments)

        this.numberOfAssetsLoaded = 0;

        this.bootstrap();
    }

    bootstrap() {
        if (!this.supportsServiceWorker) {
            this.debug && console.warn('Service Workers are not supported in this browser.');
            return;
        }
        this.registerServiceWorker()
            .then(this.initalizeMessaging.bind(this))
            .then(this.initalizeServiceWorker.bind(this))
            .then(this.preloadAssets.bind(this)
        )
    }

    get totalNumberOfAssets() {
        return this.assets.length || 0;
    }

    get percentageLoaded() {
        this.numberOfAssetsLoaded++;
        return Math.round((this.numberOfAssetsLoaded / this.totalNumberOfAssets) * 100);
    }

    emit(event, data = null) {
        // document.dispatchEvent(new Event(event));
        document.dispatchEvent(new CustomEvent(event, data));
    }

    supportsServiceWorker() {
        return 'serviceWorker' in navigator;
    }

    registerServiceWorker() {
        return navigator.serviceWorker.register(this.worker, { scope: this.scope }).then(() => {
            this.emit('serviceWorker.register.success');
            return navigator.serviceWorker.ready;
        }).catch((error) => {
            console.log('Boo!', error);
            this.emit('serviceWorker.register.error');
        });
    }

    initalizeMessaging() {
        console.log('init messaging...');
        this.messageChannel = new MessageChannel();
        // Handle message events...
        this.messageChannel.port1.onmessage = this.handleMessageFromServiceWorker.bind(this);
    }

    initalizeServiceWorker() {
        console.log('init service worker...');
        navigator.serviceWorker.controller.postMessage({
            type    : ACTIONS.INITIALIZE,
            payload : {
                namespace          : this.namespace,
                version            : this.version,
                debug              : this.debug,
                messageChannelPort : this.messageChannel.port2
            }
        }, [this.messageChannel.port2]);
    }

    preloadAssets() {
        console.log('preload asset...');
        navigator.serviceWorker.controller.postMessage({
            type    : ACTIONS.PRELOAD,
            payload : this.assets,
        });
    }

    // @TODO Better name for this method?
    handleMessageFromServiceWorker() {
        switch (event.data.type) {
            case ACTIONS.RESOURCE_PRELOADED:
                this.emit('serviceWorker.preloading.asset', {
                    detail: { percentageLoaded : this.percentageLoaded }
                });
                break;
            case ACTIONS.PRELOADING_COMPLETED:
                this.emit('serviceWorker.preloading.complete');
                break;
            default:
                break;
        }
    }
}