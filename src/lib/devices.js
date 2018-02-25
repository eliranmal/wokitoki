const hasBrowserSupport = () => {
    return navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && navigator.mediaDevices.enumerateDevices && window.RTCPeerConnection;
};

const hasMics = (done) => {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            var hasMics = devices.some(device => device.kind === 'audioinput');
            done(null, hasMics);
        })
        .catch(() => {
            done('failed sniffing audio input devices');
        });
};

export default {
    hasBrowserSupport,
    hasMics,
};
