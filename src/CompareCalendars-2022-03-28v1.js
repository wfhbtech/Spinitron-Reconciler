// ReadShows-2022-03-27v10.js  WORKING CODE PULLING 1 DAY AT A TIME
output.markdown('# Comparing Calendars...');

let table = base.getTable("Control Panel");
// Get the control panel record (should be only one) 
let controlPanelRecord = await input.recordAsync('Select a record to use', table);

if (controlPanelRecord) {
} else {
    output.text('No record was selected');
}

let googleScheduleView = base.getTable('Sync Broadcast Schedule').getView('View for Scripts');
let googleScheduleQuery = await googleScheduleView.selectRecordsAsync();
let googleScheduleRecords = googleScheduleQuery.records;
dbMsg("googleScheduleRecords", googleScheduleRecords);


let spinitronScheduleView = base.getTable('Spinitron Shows').getView('View for Scripts');
let spinitronScheduleQuery = await spinitronScheduleView.selectRecordsAsync();
let spinitronScheduleRecords = spinitronScheduleQuery.records;
dbMsg("spinitronScheduleRecords", spinitronScheduleRecords);

for (let googleRecord of googleScheduleRecords) {
    for (let spinitronRecord of spinitronScheduleRecords) {
        if (spinitronRecord.getCellValue('Spinitron Show Start') == googleRecord.getCellValue('Title')) {
            
        } else {

        }
    }
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

function dbMsg (theMessage) {
    console.debug (theMessage);
    }