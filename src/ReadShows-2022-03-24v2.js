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


