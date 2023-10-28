/**
 * Given an endpoint URL, submits a GET request to the endpoint and returns the response.
 * @param endpoint Endpoint URL to send the POST request to.
 * @returns {Promise<unknown>}
 */
function xhrTransportGet(endpoint) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", endpoint);
        xhr.onload = () => resolve(xhr.responseText);
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}