// ReadShows-2022-04-01v11.js  WORKING CODE PULLING 1 DAY AT A TIME
output.markdown('# Spinitron Reader v10');

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

output.markdown('# Purging old records...');
// Purge old MegaSeg Event File records
let oldRecords = await base.getTable('Spinitron Shows').getView('View for Scripts').selectRecordsAsync();
let recIDs = [];
for (let record of oldRecords.records) { recIDs.push(record.id); }
while (recIDs.length > 0) {
    dbMsg(recIDs);
    await base.getTable('Spinitron Shows').deleteRecordsAsync(recIDs.slice(0, 50));
    recIDs = recIDs.slice(50);
}

output.markdown('# Reading schedule on Spinitron site...');

const startDate = new Date(controlPanelRecord.getCellValue('Starting Date for Reconciliation'));
dbMsg ("startDate: " + startDate);

const endDate = new Date(controlPanelRecord.getCellValue('Ending Date for Reconciliation'));
dbMsg ("endDate: " + endDate);

let eventFileCreateRecords = [];
const itemCount = 200;
for (let pageNum = 1; ; pageNum++){ 
const response = await getSpinitronShowsByDate (startDate, endDate, itemCount, pageNum);
dbMsg("Result from inside function");
dbMsg(response);

for (let item of response.items) {
    var sinceValue = "";
    if (item.since === null ) {
        sinceValue = 'null';
    } else {
        sinceValue = "Since" + item.since;
    }
    dbMsg(sinceValue);
    eventFileCreateRecords.push({
        fields: {
            "Spinitron Show Start":  item.start,
            "Spinitron Show": item.title,
            "Spinitron Duration": item.duration, 
            "Time Zone": item.timezone, 
            "One Off": item.one_off + "", 
            "Category": item.category, 
            "Description": item.description, 
            "Since": sinceValue, 
            "URL": item.url, 
            "Hide DJ": item.hide_dj + "", 
            "Image": item.image, 
            "Control Panel Link": [ controlPanelRecord ],
        },
    });
    }
    dbMsg ("length: " + response.items.length + " ... " + "page at end loop: " + pageNum);
    if (response.items.length < itemCount) { break; }
}


// Finally, create the Spinitron records.
output.markdown('# Creating Airtable schedule from Spinitron data');
while (eventFileCreateRecords.length > 0) {
    await base.getTable('Spinitron Shows').createRecordsAsync(eventFileCreateRecords.slice(0, 50));
    eventFileCreateRecords = eventFileCreateRecords.slice(50);
}

// Done!
output.markdown('# Done');


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

function dbMsg (theMessage) {
    //console.debug (theMessage);
    }