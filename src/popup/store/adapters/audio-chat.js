
const audioChatStoreAdapter = function (result, ...args) {
    console.log('>>>>>>>> intercepted >', result, ...args);
};


export default audioChatStoreAdapter;