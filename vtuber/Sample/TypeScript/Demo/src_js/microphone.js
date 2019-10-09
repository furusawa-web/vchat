var ripSyncValue = 0;
var motionFlg = false;
var motionNum = 0;

$(function () {
    setupMicrophone();
})

var pushMotionButton = function (num) {
    motionFlg = true;
    motionNum = num;
}


var setupMicrophone = function () {
    navigator.getUserMedia(
        { audio: true },
        function (stream) {
            //document.querySelector('audio').src = URL.createObjectURL(stream);
            document.querySelector('audio').srcObject = stream;

            localStream.addTrack(stream.getTracks()[0]);

            var audioContext = new AudioContext();
            var analyser = audioContext.createAnalyser();
            var timeDomain = new Float32Array(analyser.frequencyBinCount);
            var frequency = new Uint8Array(analyser.frequencyBinCount);
            audioContext.createMediaStreamSource(stream).connect(analyser);

            (function animation() {
                analyser.getFloatTimeDomainData(timeDomain);
                analyser.getByteFrequencyData(frequency);

                var score = 0;
                //frequencyの平均値が50以上なら
                for (var i = 0; i < frequency.length; i++) {
                    score = score + frequency[i];
                }
                score = score / frequency.length;

                if (score > 10) {
                    var ripSyncValueTmp = score * (Math.random() + 0.5) / 30;
                    if (ripSyncValueTmp > 1) ripSyncValueTmp = 1;
                    if (ripSyncValue > ripSyncValueTmp) ripSyncValueTmp *= 0.8;
                    ripSyncValue = ripSyncValueTmp;
                } else {
                    ripSyncValue = 0;
                }

                setTimeout(function () {
                    requestAnimationFrame(animation);
                }, 100);

            })();

        },
        console.log
    );
}