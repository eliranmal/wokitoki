
chrome.commands.onCommand.addListener(function(command) {
    console.log('onCommand');
    console.log(arguments);
    switch (command) {
        case 'create-popup':
            createPopup();
            break;
    }
});

function createPopup() {
    console.log('creating popup');
    chrome.windows.create({
        url: '../popup.html',
        width: 700,
        height: 400,
        focused: true,
        type: chrome.windows.WindowType.POPUP,
    });
}
