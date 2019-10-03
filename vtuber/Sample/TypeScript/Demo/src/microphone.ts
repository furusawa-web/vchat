
var ripSyncValue = 0;

var setupMicrophone = function () {
    navigator.getUserMedia(
        { audio: true },
        function (stream) {
            //document.querySelector('audio').src = URL.createObjectURL(stream);
            document.querySelector('audio').srcObject = stream;
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

                if (score > 15) {
                    ripSyncValue = 1;
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