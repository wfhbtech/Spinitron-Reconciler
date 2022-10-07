
const localTimeOffset = 5;
console.debug (new Date());
const d = new Date(2022,02,25,13);
console.debug ('d '+ d);
d.setHours( d.getHours()-localTimeOffset)
console.debug ('emodDate' + d.toString());
console.debug ('iso d ' + d.toUTCString());
console.debug (d);
const params = {
    "start" : "2022-04-01T12:00:00Z",
    "end" : "2022-04-01T23:59:59Z",
    'fields' :  ['title', 'start', 'duration'] 

};
console.debug("parms: " + JSON.stringify(params));



function shows = getSpinitronShowsByDate (date) {
const params = {
    "start" : "2022-04-01T12:00:00Z",
    "end" : "2022-04-01T23:59:59Z",
    'fields' :  ['title', 'start', 'duration'] 

};
let url = "https://spinitron.com/api/shows";
url += '?' + new URLSearchParams(params).toString();
console.debug("url:" + url);
let response = await fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer vlcy-1eFKglIpNccDNcW-vZc',
        'Content-Type': 'application/json',
    },
});
}
console.debug(response.body);
let res = await(response.json());
console.debug(res);
