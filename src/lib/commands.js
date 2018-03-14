const createPopup = () => chrome.tabs.create({
    url: '../popup.html',
});

export default {
    'create-popup': createPopup
};
