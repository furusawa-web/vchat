/** 
* @license
* Copyright Copyright 2018 Google Inc. All Rights Reserved.
* Apache License Version 2.0（「本ライセンス」）に基づいてライセンスされます。
* あなたがこのファイルを使用するためには、本ライセンスに従わなければなりません。
* 本ライセンスのコピーは下記の場所から入手できます。
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* 適用される法律または書面での同意によって命じられない限り、
* 本ライセンスに基づいて頒布されるソフトウェアは、明示黙示を問わず、
* いかなる保証も条件もなしに「現状のまま」頒布されます。
* 本ライセンスでの権利と制限を規定した文言については、本ライセンスを参照してください。
*/

const imageScaleFactor = 0.2;
const outputStride = 16;
const flipHorizontal = false;
const stats = new Stats();
const winHeight = 1080;
const winWidth = 1920;

let naviko = new Image();
let navScale = 1
naviko.src = "naviko.png"
bindPage();

async function bindPage() {
    const net = await posenet.load();
    let video;
    try {
        video = await loadVideo();
    } catch (e) {
        console.error(e);
        return;
    }
    detectPoseInRealTime(video, net);
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}

async function setupCamera() {
    const video = document.getElementById('video');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': true
        });
        video.srcObject = stream;

        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } else {
        const errorMessage = "This browser does not support video capture, or this device does not have a camera";
        alert(errorMessage);
        return Promise.reject(errorMessage);
    }
}

function detectPoseInRealTime(video, net) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const flipHorizontal = true; // since images are being fed from a webcam

    async function poseDetectionFrame() {
        stats.begin();
        let poses = [];
        const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride);
        poses.push(pose);

        ctx.clearRect(0, 0, winWidth, winHeight);

        ctx.save();
        ctx.scale(1, 1);
        ctx.translate(-winWidth, 0);
        ctx.drawImage(video, 0, 0, winWidth, winHeight);
        ctx.restore();

        poses.forEach(({ s, keypoints }) => {
            //drawNaviko(keypoints[0], keypoints[1], ctx);
            drawImage(keypoints[0], keypoints[3], keypoints[4], ctx);
        });


        stats.end();

        requestAnimationFrame(poseDetectionFrame);
    }
    poseDetectionFrame();
}

function drawNaviko(nose, leye, ctx) {
    navScale = (leye.position.x - nose.position.x - 50) / 20;
    if (navScale < 1) navScale = 1;
    let nw = naviko.width * navScale;
    let nh = naviko.height * navScale;
    ctx.drawImage(naviko, nose.position.x - nh / 2, nose.position.y - nh / 1.5, nw, nh);
}

function drawImage(nose, leftEar, rightEar, ctx) {
    navScale = (rightEar.position.x - leftEar.position.x) / naviko.width;
    if (navScale < 0) navScale = navScale * -1;
    let nw = naviko.width * navScale * 1.5;
    let nh = naviko.height * navScale * 1.5;
    ctx.drawImage(naviko, nose.position.x - nh / 2, nose.position.y - nh / 1.5, nw, nh);
}
