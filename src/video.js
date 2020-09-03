export default class Video extends HTMLElement {
    static get PLAY_STATUS_CHANGED() { return 'status'; }

    static get METADATA() { return 'metadata'; }

    static get observedAttributes() {
        return ['camera', 'source']
    }

    constructor() {
        super();
        this.attachShadow( { mode: 'open' } );
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    background-color: black;
                }
            </style>
            <video playsinline></video>`;

        this.videoEl = this.shadowRoot.querySelector('video');
        this.width = 640;
        this.height = 480;

        if (this.getAttribute('loop')) {
            this.videoEl.loop = true;
        }
        this.playing = false;

        this.videoEl.onloadedmetadata = event => this.onMetadata(event);
        this.videoEl.onloadeddata = () => {
            this.videoEl.play();
        };

        this.videoEl.onpause = () => {
            this.playing = false;
            const ce = new CustomEvent(Video.PLAY_STATUS_CHANGED, {
                detail: { playing: this.playing, video: this.videoEl },
                bubbles: true, composed: true });
            this.dispatchEvent(ce);
        }

        this.videoEl.onended = event => this.onEnded(event);

        this.videoEl.onplaying = () => {
            this.playing = true;
            const ce = new CustomEvent(Video.PLAY_STATUS_CHANGED, {
                detail: { playing: this.playing, video: this.videoEl },
                bubbles: true, composed: true });
            this.dispatchEvent(ce);
        }
    }

    togglePlay() {
        if (this.playing) {
            this.videoEl.pause();
        } else {
            this.videoEl.play();
        }
    }

    get currentTime() {
        return this.videoEl.currentTime;
    }

    set currentTime(val) {
        this.videoEl.currentTime = val;
    }

    onEnded() {
        const ce = new CustomEvent(Video.PLAY_STATUS_CHANGED, {
            detail: { playing: this.playing, video: this.videoEl, ended: true },
            bubbles: true, composed: true });
        this.dispatchEvent(ce);
    }

    onMetadata(event) {
        const bounds = this.getBoundingClientRect();
        if (bounds.width > bounds.height) {
            this.width = bounds.width;
            this.height = bounds.width * event.target.videoHeight / event.target.videoWidth;
        } else {
            this.height = bounds.height;
            this.width = bounds.height * event.target.videoHeight / event.target.videoWidth;
        }
        this.videoEl.width = 640; // this.width;
        this.videoEl.height = 480; // this.height;
        this.resize();

        const ce = new CustomEvent(Video.METADATA, {
            detail: {
                playing: this.playing,
                duration: this.videoEl.duration,
                video: this.videoEl
            },
            bubbles: true, composed: true });
        this.dispatchEvent(ce);
    }

    async attributeChangedCallback(name, oldval, newval) {
        switch (name) {
            case 'source':
                if (newval !== oldval) {
                    this.videoEl.src = newval;
                }
                break;
            case 'camera':
                const stream = await navigator.mediaDevices.getUserMedia({
                    'audio': false,
                    'video': {
                        width: this.width,
                        height: this.height,
                    },
                });
                this.videoEl.srcObject = stream;
                break;
        }
    }

    resize() {
        const bounds = this.getBoundingClientRect();
        this.videoOffset = { x: bounds.width/2 - this.videoEl.width/2, y: bounds.height/2 - this.videoEl.height/2 };
        this.videoEl.style.marginLeft = `${bounds.width/2 - this.videoEl.width/2}px`;
        this.videoEl.style.marginTop = `${bounds.height/2 - this.videoEl.height/2}px`;
    }
}

if (!customElements.get('test-video')) {
    customElements.define('test-video', Video);
}
