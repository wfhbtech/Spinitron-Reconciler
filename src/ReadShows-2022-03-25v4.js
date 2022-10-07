function dbMsg (theMessage) {
    console.debug (theMessage);
    }

output.markdown('# Spinitron Reader');

let table = base.getTable("Control Panel");
// Prompt the user to pick a record 
// If this script is run from a button field, this will use the button's record instead.
let controlPanelRecord = await input.recordAsync('Select a record to use', table);

if (controlPanelRecord) {
} else {
    output.text('No record was selected');
}

let programScheduleView = base.getTable('Sync Broadcast Schedule').getView('View for Scripts');
let programScheduleQuery = await programScheduleView.selectRecordsAsync();
let programScheduleRecords = programScheduleQuery.records;
dbMsg("programScheduleRecords", programScheduleRecords);

// Purge old Spinitron Show records

dbMsg('Purging old records...');
// Purge old MegaSeg Event File records
let oldRecords = await base.getTable('Spinitron Shows').getView('View for Scripts').selectRecordsAsync();
let recIDs = [];
for (let record of oldRecords.records) { recIDs.push(record.id); }
while (recIDs.length > 0) {
    dbMsg(recIDs);
    await base.getTable('Spinitron Shows').deleteRecordsAsync(recIDs.slice(0, 50));
    recIDs = recIDs.slice(50);
}

const startDateString = controlPanelRecord.getCellValue('Starting Date for Reconciliation');

const response = getSpinitronShowsByDate (startDateString)
dbMsg ("response: " + response);

/*
    Return all Spinitron shows for a given date
    Assumes there will never be more than 20 shows 
    on one date.
*/
 function getSpinitronShowsByDate (aDate) {
    dbMsg ("startDateString damn: " + aDate);
    const theDate = new Date(aDate+"T00:00:00");
    dbMsg ("startDate: " + theDate);
    
    const TimezoneOffset = startDate.getTimezoneOffset();
    dbMsg ("getTimezoneOffset: " + TimezoneOffset);
    theDate.setMinutes( theDate.getMinutes()-TimezoneOffset)
    dbMsg ("startDate GMT: " + theDate);
    const cutoffDate = new Date(theDate);
    cutoffDate.setHours( cutoffDate.getHours()+24);
    dbMsg ("cutoffDate doubledamn: " + cutoffDate);
/*    
    const params = {
        "start" : "2022-04-01T12:00:00Z",
        "end" : "2022-04-01T23:59:59Z",
        'fields' :  ['title', 'start', 'duration'] 
    
    };
    let url = "https://spinitron.com/api/shows";
    url += '?' + new URLSearchParams(params).toString();
    dbMsg("url:" + url);
    const response = await remoteFetchAsync(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer vlcy-1eFKglIpNccDNcW-vZc',
            'Content-Type': 'application/json',
        },
    });
    */
    return "boo";
    }
    
/*


const localTimeOffset = 5;
dbMsg (new Date());
const d = new Date(2022,02,25,13);
dbMsg ('d '+ d);
d.setHours( d.getHours()-localTimeOffset)
dbMsg ('emodDate' + d.toString());
dbMsg ('iso d ' + d.toUTCString());
dbMsg (d);
const params = {
    "start" : "2022-04-01T12:00:00Z",
    "end" : "2022-04-01T23:59:59Z",
    'fields' :  ['title', 'start', 'duration'] 

};
dbMsg("parms: " + JSON.stringify(params));

dbMsg(response.body);
let res = await(response.json());
dbMsg(res);
dbMsg ("startDateString: " + startDateString);
const startDate = new Date(startDateString+"T00:00:00");
dbMsg ("startDate: " + startDate);

const TimezoneOffset = startDate.getTimezoneOffset();
dbMsg ("getTimezoneOffset: " + TimezoneOffset);
startDate.setMinutes( startDate.getMinutes()-TimezoneOffset)
dbMsg ("startDate GMT: " + startDate);
*/

/*
    Return all Spinitron shows for a given date
    Assumes there will never be more than 20 shows 
    on one date.
async function getSpinitronShowsByDate (date) {

const params = {
    "start" : "2022-04-01T12:00:00Z",
    "end" : "2022-04-01T23:59:59Z",
    'fields' :  ['title', 'start', 'duration'] 

};
let url = "https://spinitron.com/api/shows";
url += '?' + new URLSearchParams(params).toString();
dbMsg("url:" + url);
let response = await remoteFetchAsync(url, {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer vlcy-1eFKglIpNccDNcW-vZc',
        'Content-Type': 'application/json',
    },
});
}
*/


    