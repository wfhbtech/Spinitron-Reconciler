/*jshint esversion: 6 */

const scriptName = "ReadShows";  // Now using Processing Cues as part of Core Program Data
const scriptVersion = "22-05-08 v11";
const consoleDebug = true;

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

let eventFileCreateRecords = [];
const itemCount = 200;
for (let pageNum = 1; ; pageNum++){ 
const response = await getSpinitronShowsByDate (startDate, endDate, itemCount, pageNum);
console.debug("Result from inside function");
console.debug(response);


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
    dbMsg ("length: " + response.items.length + " ... " + "page at end loop: " + pageNum);
    if (response.items.length < itemCount) { break; }
}


// Finally, create the Spinitron records.
while (eventFileCreateRecords.length > 0) {
    await base.getTable('Spinitron Shows').createRecordsAsync(eventFileCreateRecords.slice(0, 50));
    eventFileCreateRecords = eventFileCreateRecords.slice(50);
}

// Done!



/*
    Return all Spinitron shows for a given date range
*/
 async function getSpinitronShowsByDate (beginRange, endRange, itemCount, pageNum, ) {
    const count = 20;
    dbMsg ("beginRange: " + beginRange);
    dbMsg ("endRange: " + endRange);

    let beginISO = beginRange.toISOString();
    let endISO = endRange.toISOString();
    dbMsg ("stuff: " +beginISO +"|"+endISO);

    let params = {
        "start" : beginISO,
        "end" :  endISO,
        "count" : itemCount,
        "page" : pageNum
//        'fields' :  ['title', 'start', 'duration'] 
    };

    dbMsg ("paramz: " + params.page);

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
    return result;
}

// debugMsg - a conditional wrapper for console.debug messages as a debugging aid.

function dbMsg(a, b = null) {
    if (consoleDebug) {
        if (b==null) {
            console.debug (a);
        } else {
            console.debug (a, b);
        }
    }
  }

