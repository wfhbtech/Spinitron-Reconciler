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
dbMsg ("startDateString");
dbMsg (startDateString);
const startDate = new Date(controlPanelRecord.getCellValue('Starting Date for Reconciliation'));
dbMsg ("startDate");
dbMsg (startDate);

const endDate = new Date(controlPanelRecord.getCellValue('Ending Date for Reconciliation'));
dbMsg ("endDate");
dbMsg (endDate);

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate()+1);
dbMsg ("tomorrow");
dbMsg (tomorrow);

let aDate = new Date();
if (startDate.getTime()<tomorrow.getTime()) {
    aDate = new Date(tomorrow);
    dbMsg ("aDate/tomorrow");
    dbMsg (aDate);
} else {
    aDate = new Date(startDate);
    dbMsg ("aDate/start");
    dbMsg (aDate);
}

while (aDate.getTime()<endDate.getTime()) {
    dbMsg ("date loop: ");
    dbMsg (aDate);


    aDate.setDate(aDate.getDate()+1);

}

const response = await getSpinitronShowsByDate (dDate);

dbMsg ("response returned: ");
dbMsg (response);
let eventFileCreateRecords = [];
for (let item of response.items) {
    dbMsg ("start: " + item.start);
    dbMsg ("title: " + item.title);
    dbMsg ("duration: " + item.duration);
    eventFileCreateRecords.push({
        fields: {
            "Spinitron Show Start":  item.start,
            "Spinitron Show": item.title,
            "Spinitron Duration": item.duration, 
            "Control Panel": [ controlPanelRecord ],
        },
    });
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
 async function getSpinitronShowsByDate (aDate) {
    dbMsg ("startDateString damn: " + aDate);
    const theDate = new Date(aDate+"T00:00:00");
    dbMsg ("startDate: " + theDate);
    
    const TimezoneOffset = theDate.getTimezoneOffset();
    dbMsg ("getTimezoneOffset: " + TimezoneOffset);
    dbMsg ("startDate GMT: " + theDate);
    const cutoffDate = new Date((aDate+"T23:59:59"));
    dbMsg ("cutoffDate doubledamn: " + cutoffDate);
   
    const theDateISO = theDate.toISOString();
    const cutoffISO = cutoffDate.toISOString();
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
    console.debug("Result from inside function");
    console.debug(result);
    return result;
    }
    
