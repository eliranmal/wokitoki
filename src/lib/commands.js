const createPopup = () => chrome.tabs.create({
    url: '../popup.html?c=' + Date.now(),
});

export default {
    'create-popup': createPopup
};
