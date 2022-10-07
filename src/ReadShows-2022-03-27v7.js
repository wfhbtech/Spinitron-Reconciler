// ReadShows-2022-03-27v7.js
output.markdown('# Spinitron Reader');

let table = base.getTable("Control Panel");
// Get the control panel record (should be only one) 
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

const startDate = new Date(controlPanelRecord.getCellValue('Starting Date for Reconciliation'));
dbMsg ("startDate: " + startDate);

const endDate = new Date(controlPanelRecord.getCellValue('Ending Date for Reconciliation'));
dbMsg ("endDate: " + endDate);

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate()+1);
dbMsg ("tomorrow: " + tomorrow);

let aDate = new Date();
if (startDate.getTime()<tomorrow.getTime()) {
    aDate = new Date(tomorrow);
} else {
    aDate = new Date(startDate);
}

let eventFileCreateRecords = [];

while (aDate.getTime()<endDate.getTime()) {
    dbMsg ("date loop: ");
    dbMsg (aDate);
    const response = await getSpinitronShowsByDate (aDate);

    dbMsg ("response returned: ");
    dbMsg (response);
    for (let item of response.items) {
        eventFileCreateRecords.push({
            fields: {
                "Spinitron Show Start":  item.start,
                "Spinitron Show": item.title,
                "Spinitron Duration": item.duration, 
                "Control Panel Link": [ controlPanelRecord ],
            },
        });
        }
    

    aDate.setDate(aDate.getDate()+1);
}


// Finally, create the Spinitron records.
while (eventFileCreateRecords.length > 0) {
    await base.getTable('Spinitron Shows').createRecordsAsync(eventFileCreateRecords.slice(0, 50));
    eventFileCreateRecords = eventFileCreateRecords.slice(50);
}

// Done!



/*
    Return all Spinitron shows for a given date
    Assumes there will never be more than 20 shows 
    on one date.
*/
 async function getSpinitronShowsByDate (myDate) {
    dbMsg ("myDate: " + myDate);
    const theDate = new Date(myDate);
    theDate.setHours(0);
    theDate.setMinutes(0);
    theDate.setSeconds(0);
    dbMsg ("theDate: " + theDate);
    
    const cutoffDate = new Date(theDate);
    cutoffDate.setDate(cutoffDate.getDate()+1);
    dbMsg ("cutoffDate: " + cutoffDate);
/*    
    const TimezoneOffset = theDate.getTimezoneOffset();
    dbMsg ("getTimezoneOffset: " + TimezoneOffset);
    dbMsg ("startDate GMT: " + theDate);
    cutoffDate = new Date((cutoffDate+"T23:59:59"));
    dbMsg ("cutoffDate doubledamn: " + cutoffDate);
*/   
    const theDateISO = theDate.toISOString();
    cutoffISO = cutoffDate.toISOString();
    dbMsg ("stuff: " +theDateISO +"|"+cutoffISO);
    const params = {
        "start" : theDateISO,
        "end" :  cutoffISO,
        'fields' :  ['title', 'start', 'duration'] 
    
    };
    dbMsg ("paramz: " + params.start);
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
    let result = await response.json();
//    console.debug("Result from inside function");
//    console.debug(result);
    return result;
    }
    function dbMsg (theMessage) {
        console.debug (theMessage);
        }
    
        
