/**
 * TO SEE BUG, UNCOMMENT THE BELOW IMPORT
 * Warnings:
 * engine.ts:224 webgl backend was already registered. Reusing existing backend factory.
 t.registerBackend @ engine.ts:224
 (anonymous) @ backend_webgl.ts:2801
 engine.ts:224 cpu backend was already registered. Reusing existing backend factory.
 t.registerBackend @ engine.ts:224
 (anonymous) @ backend_cpu.ts:3829
 environment.ts:54 Platform browser has already been set. Overwriting the platform with [object Object].

 Error when running: engine.ts:583 Uncaught (in promise) TypeError: t is not a function

 Ideally, both Posenet and FaceAPI would function in the same app/session, but the error is preventing this, even when not using Posenet,
 just importing it

 console.log will show FaceAPI results when Posenet import is commented out
 */

// import * as Posenet from '@tensorflow-models/posenet';
import * as faceapi from 'face-api.js';
import Video from './video.js';

const frames = [];

export default class FacePoseVideo extends Video {
    onEnded(event) {
        super.onEnded(event);

        const info = {
            duration: this.videoEl.duration,
            width: this.videoEl.width,
            height: this.videoEl.height,
            aspect: this.videoEl.width / this.videoEl.height,
            keyframes: frames
        }
    }

    onMetadata(event) {
        super.onMetadata(event);
        this.loadDetectionModel();
        this.faceDetectionFrame();
    }

    async loadDetectionModel() {
        if (!faceapi.nets.tinyFaceDetector.params) {
            await faceapi.loadFaceLandmarkModel('./weights');
            await faceapi.nets.tinyFaceDetector.loadFromUri('./weights')
        }
    }

    async faceDetectionFrame() {
        if (this.playing && faceapi.nets.tinyFaceDetector.params) {
            const inputSize = 128;
            const scoreThreshold = 0.5;
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold }); // or  new faceapi.SsdMobilenetv1Options({ minConfidence })
            const result = await faceapi.detectSingleFace(this.videoEl, options).withFaceLandmarks();
            console.log('points', result);
        }
        requestAnimationFrame( () => this.faceDetectionFrame());
    }
}

if (!customElements.get('video-facepose')) {
    customElements.define('video-facepose', FacePoseVideo);
}
