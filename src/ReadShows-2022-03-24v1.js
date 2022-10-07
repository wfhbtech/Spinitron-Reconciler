let response = await fetch('https://spinitron.com/api/shows?', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer vlcy-1eFKglIpNccDNcW-vZc',
        'Content-Type': 'application/json',
        'start': '2022-04-01T12:00:00Z',
        'end': '2022-04-01T13:00:00Z',
        'fields' :  ['title', 'start', 'duration'] ,
    },
});
console.debug(response.body);
const res = await(response.json());
console.debug(res);


$ curl -s -G -i -H 'Authorization: Bearer SECRET' https://spinitron.com/api/shows \

  -d start=2022-04-01T12:00:00Z -d end=2022-04-01T13:00:00Z


// encode to scape spaces
const esc = encodeURIComponent;
const url = 'https://spinitron.com/api/shows?';
const params = { 
    Authorization: 'Bearer vlcy-1eFKglIpNccDNcW-vZc',
    Content-Type: 'application/json',
    start: '2022-04-01T12:00:00Z',
    end: '2022-04-01T13:00:00Z'
};
// this line takes the params object and builds the query string
const query = Object.keys(params).map(k => `${esc(k)}=${esc(params[k])}`).join('&')
const res = await fetch(url+query);
const googleResponse = await res.json()
console.debug(googleResponse);


// encode to scape spaces
const esc = encodeURIComponent;
const url = 'https://maps.googleapis.com/maps/api/geocode/json?';
const params = { 
    key: "asdkfñlaskdGE",
    address: "evergreen avenue",
    city: "New York"
};
// this line takes the params object and builds the query string
const query = Object.keys(params).map(k => `${esc(k)}=${esc(params[k])}`).join('&')
const res = await fetch(url+query);
const googleResponse = await res.json()
console.debug(googleResponse);

const url = 'https://spinitron.com/api/shows?';
let params = "start=2022-04-01T12:00:00Z" + "&" + "end=2022-04-01T23:59:59Z"; 
let response = await fetch(url+params, {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer vlcy-1eFKglIpNccDNcW-vZc',
        'Content-Type': 'application/json',
    },
});
console.debug(response.body);
let res[] = await(response.json());
console.debug(res[0]);


