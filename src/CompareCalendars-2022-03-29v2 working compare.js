// CompareCalendars-2022-03-29v2.js  
/*
    This script compares the Spinitron Shows table of broadcasts
    with our Google Calendar program schedule for discrepencies.
    Both calendars need to be identical, and this script updates
    the calendar to highlight any differences.
*/
output.markdown('# Comparing Calendars...');

let table = base.getTable('Control Panel');
// Get the control panel record (should be only one)
let controlPanelRecord = await input.recordAsync(
    'Select a record to use',
    table,
);

if (controlPanelRecord) {
} else {
    output.text('No record was selected');
}

let googleScheduleView = base
    .getTable('Sync Broadcast Schedule')
    .getView('View for Scripts');
let googleScheduleQuery = await googleScheduleView.selectRecordsAsync();
let googleScheduleRecords = googleScheduleQuery.records;
dbMsg('googleScheduleRecords');
dbMsg(googleScheduleRecords);

let spinitronScheduleView = base
    .getTable('Spinitron Shows')
    .getView('View for Scripts');
let spinitronScheduleQuery = await spinitronScheduleView.selectRecordsAsync();
let spinitronScheduleRecords = spinitronScheduleQuery.records;
dbMsg('spinitronScheduleRecords');
dbMsg( spinitronScheduleRecords);

let spinitronCreateRecords = [];
let spinitronUpdateRecords = [];

/*
    Both sets of records are sorted in ascending order by starting date/time.
    For each Google Calendar broadcast search for a matchon Name, start and end.
    Updated the 'Source' field to 'Both' for such matches.

    If the Spinitron Show start is higher than the Google Calendar show start there
    was no match to the Google Calendar entry; add that entry and continue
*/
for (let googleRecord of googleScheduleRecords) {
    for (let spinitronRecord of spinitronScheduleRecords) {
        if (
            spinitronRecord.getCellValue('Spinitron Show') ==
                googleRecord.getCellValue('Public Name') &&
            spinitronRecord.getCellValue('Spinitron Show Start') ==
                googleRecord.getCellValue('Start') &&
            spinitronRecord.getCellValue('Spinitron Show End') ==
                googleRecord.getCellValue('End')
        ) {
            dbMsg('Match!', spinitronRecord.getCellValue('Spinitron Show'));
            spinitronUpdateRecords.push({
                "id": spinitronRecord.id,
                fields: {
                    Source: 'Both',
                },
            });
            break;
        } else {
            if (
                spinitronRecord.getCellValue('Spinitron Show Start') >
                googleRecord.getCellValue('Start')
            ) {
                dbMsg('Miss', spinitronRecord.getCellValue('Spinitron Show'));
                spinitronCreateRecords.push({
                    fields: {
                        'Source': 'Google Calendar',
                        'Spinitron Show Start': googleRecord.getCellValue('Start'),
                        'Spinitron Show': googleRecord.getCellValue('Public Name'),
                        'Spinitron Duration': googleRecord.getCellValue('Duration'),
                        'Control Panel Link': [controlPanelRecord],
                    },
                });
                break;
            }
        }
    }
}

dbMsg('ready to update ... ');
dbMsg(spinitronCreateRecords);
dbMsg(spinitronUpdateRecords);


// Create the Spinitron records.
while (spinitronCreateRecords.length > 0) {
    await base
        .getTable('Spinitron Shows')
        .createRecordsAsync(spinitronCreateRecords.slice(0, 50));
    spinitronCreateRecords = spinitronCreateRecords.slice(50);
}


// Update the Spinitron records.
while (spinitronUpdateRecords.length > 0) {
    await base
        .getTable('Spinitron Shows')
        .updateRecordsAsync(spinitronUpdateRecords.slice(0, 50));
    spinitronUpdateRecords = spinitronUpdateRecords.slice(50);
}

// Done!

function dbMsg(theMessage) {
//    console.debug(theMessage);
}
