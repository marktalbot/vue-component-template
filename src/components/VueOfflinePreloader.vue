<template>
    <div class="temp">
        <div class="preloader-progress-bar" :class="{ invisible: !showPreloaderBar }">
            <div class="bar" :style="{ width: percentLoaded + '%' }">
                <div class="peg"></div>
            </div>
        </div>
        <pre>{{ $data }}</pre>
    </div>
</template>

<script>
    import Preloader from '../classes/Preloader.js';
    
    export default {
        // @TODO: add the rest of props
        // namespaceX, versionX, assetsX, scope = '/', worker = '/worker.js', debug = false
        props: {
            assets: {
                type: Array,
                default: []
            },
            namespace: {
                type: String,
                default: 'vue'
            },
            version: {
                type: String,
                default: 'v1'
            },
            scope: {
                type: String,
                default: '/'
            },
            worker: {
                type: String,
                default: '/worker.js'
            },
            showPreloaderBar: {
                type: Boolean,
                default: true
            },
            debug: {
                type: Boolean,
                default: false
            },
        },

        data: function() {
            return {
                percentLoaded: 0,
                loadingComplete: false,
            }
        },

        created() {
            console.log('created from component22222', this.assets);

            new Preloader({
                assets: this.assets,
                namespace: this.namespace,
                version: this.version,
                scope: this.scope,
                worker: this.worker,
                showPreloaderBar: this.showPreloaderBar,
                debug: this.debug,
            });

            document.addEventListener('serviceWorker.preloading.asset', (event) => {
                this.percentLoaded = event.detail.percentageLoaded;
            });
            document.addEventListener('serviceWorker.preloading.complete', () => {
                this.loadingComplete = true;
            });
        }
    }
</script>

<style>
    /* Make clicks pass-through */
    .preloader-progress-bar {
        pointer-events: none;
    }

    .preloader-progress-bar .bar {
        background: #29d;
        position: fixed;
        z-index: 1031;
        top: 0;
        left: 0;
        /*width: 100%;*/
        width: 0;
        height: 2px;
        transition: all 200ms ease;
    }

    /* Blur effect */
    .preloader-progress-bar .peg {
        display: block;
        position: absolute;
        right: 0px;
        /*width: 100px;*/
        width: 0;
        height: 100%;
        box-shadow: 0 0 10px #29d, 0 0 5px #29d;
        opacity: 1.0;
        -webkit-transform: rotate(3deg) translate(0px, -4px);
        -ms-transform: rotate(3deg) translate(0px, -4px);
        transform: rotate(3deg) translate(0px, -4px);
    }
</style>