/*jshint esversion: 6 */

const scriptName = "Spinitron Reconciliation";  // Now using Processing Cues as part of Core Program Data
const scriptVersion = "22-05-08 v3";
const consoleDebug = false;

output.markdown('# '+ scriptName);
output.markdown('Version '+ scriptVersion);
/*
    This script compares the Spinitron Shows table of broadcasts
    with our Google Calendar program schedule for discrepencies.
    Both calendars need to be identical, and this script updates
    the calendar to highlight any differences.
*/


const ctlPanel = 'Control Panel';
const scriptView = 'View for Scripts';
const reconcileTable ='Spinitron Reconciliation';
const broadcastSchedTable = 'Sync Broadcast Schedule';
const spinitronTable = 'Spinitron Shows';

const sourceBoth = "Both";
const sourceGcal = "Google Calendar";
const sourceSpinitron = "Spinitron";

let reconcileCreateRecords = [];
let reconcileUpdateRecords = [];

let table = base.getTable(ctlPanel);
// Get the control panel record (should be only one)
let controlPanelRecord = await input.recordAsync(
    'Select a record to use',
    table,
);

if (controlPanelRecord) {
} else {
    output.text('No record was selected');
}
const startDate = controlPanelRecord.getCellValue('Starting Date for Reconciliation');
dbMsg ("startDate: " + startDate);

const endDate = controlPanelRecord.getCellValue('Ending Date for Reconciliation');
dbMsg ("endDate: " + endDate);

// Purge old reconciliation records
output.markdown('# Purging old records...');
let oldRecords = await base.getTable(reconcileTable).getView(scriptView).selectRecordsAsync();
let recIDs = [];
for (let record of oldRecords.records) { recIDs.push(record.id); }
while (recIDs.length > 0) {
    dbMsg(recIDs);
    await base.getTable(reconcileTable).deleteRecordsAsync(recIDs.slice(0, 50));
    recIDs = recIDs.slice(50);
}

// Populate reconcilliation records with all of the Spinitron shows
let spinitronScheduleView = base
    .getTable(spinitronTable)
    .getView(scriptView);
let spinitronScheduleQuery = await spinitronScheduleView.selectRecordsAsync();
let spinitronScheduleRecords = spinitronScheduleQuery.records;
dbMsg('spinitronScheduleRecords', spinitronScheduleRecords);

output.markdown('# Adding the Spinitron records...');
for (let spinitronRecord of spinitronScheduleRecords) {
    reconcileCreateRecords.push({
        fields: {
            'Source': sourceSpinitron,
            'Broadcast': spinitronRecord.getCellValue('Spinitron Show'),
            'Show Start': spinitronRecord.getCellValue('Spinitron Show Start'),
            'Duration': spinitronRecord.getCellValue('Spinitron Duration'),
            'Control Panel': [controlPanelRecord],
    },
    });
}


// Create the Spinitron records in reconcilation table
while (reconcileCreateRecords.length > 0) {
    await base
        .getTable(reconcileTable)
        .createRecordsAsync(reconcileCreateRecords.slice(0, 50));
    reconcileCreateRecords = reconcileCreateRecords.slice(50);
}

// Now cycle through the Google Calendar records. We'll either update (for matches) or add new for mismatches
output.markdown('# Reconciling...');

let googleScheduleView = base
    .getTable(broadcastSchedTable)
    .getView(scriptView);
let googleScheduleQuery = await googleScheduleView.selectRecordsAsync();
let googleScheduleRecords = googleScheduleQuery.records;
dbMsg('googleScheduleRecords');
dbMsg(googleScheduleRecords);

let reconcileScheduleView = base
    .getTable(reconcileTable)
    .getView(scriptView);
let reconcileScheduleQuery = await reconcileScheduleView.selectRecordsAsync();
let reconcileScheduleRecords = reconcileScheduleQuery.records;
dbMsg('reconcileScheduleRecords');
dbMsg( reconcileScheduleRecords);

/*
    Both sets of records are sorted in ascending order by starting date/time.
    For each Google Calendar broadcast search for a matchon Name, start and end.
    Updated the 'Source' field to 'Both' for such matches.

    If the Spinitron Show start is higher than the Google Calendar show start there
    was no match to the Google Calendar entry; add that entry and continue
*/
for (let googleRecord of googleScheduleRecords) {
    if (googleRecord.getCellValue('Public Name').substring(0,2) =="Eco" ) {
        dbMsg('googleRecord Public Name');
        dbMsg(googleRecord.getCellValue('Public Name'));
    }
    dbMsg(googleRecord.getCellValue('Start'));
    dbMsg(googleRecord.getCellValue('End'));
    if (googleRecord.getCellValue('Start') < startDate) {
        continue;
    } 
    if (googleRecord.getCellValue('Start') > endDate) {
            break;
    }

    for (let reconcileRecord of reconcileScheduleRecords) {
        if (
            reconcileRecord.getCellValue('Broadcast') ==
                googleRecord.getCellValue('Public Name') &&
            reconcileRecord.getCellValue('Show Start') ==
                googleRecord.getCellValue('Start') &&
            reconcileRecord.getCellValue('Show End') ==
                googleRecord.getCellValue('End')
        ) {
            dbMsg('Match!', reconcileRecord.getCellValue('Broadcast'));
            reconcileUpdateRecords.push({
                "id": reconcileRecord.id,
                fields: {
                    Source: 'Both',
                },
            });
            break;
        } else {
            if (
                reconcileRecord.getCellValue('Show Start') >
                googleRecord.getCellValue('Start')
            ) {
                dbMsg('Miss', reconcileRecord.getCellValue('Show'));
                reconcileCreateRecords.push({
                    fields: {
                        'Source': 'Google Calendar',
                        'Broadcast': googleRecord.getCellValue('Public Name'),
                        'Show Start': googleRecord.getCellValue('Start'),
                        'Duration': googleRecord.getCellValue('Duration'),
                        'Control Panel': [controlPanelRecord],
                    },
                });
                break;
            }
        }
    }
}

dbMsg('ready to update ... ');
dbMsg("reconcileCreateRecords ", reconcileCreateRecords);
dbMsg("reconcileUpdateRecords ", reconcileUpdateRecords);


// Adding the Google calendar misses
output.markdown('# Adding the Google calendar misses...');
while (reconcileCreateRecords.length > 0) {
    await base
        .getTable(reconcileTable)
        .createRecordsAsync(reconcileCreateRecords.slice(0, 50));
    reconcileCreateRecords = reconcileCreateRecords.slice(50);
}


// Update the Spinitron records.
output.markdown('# Updating the matches...');
while (reconcileUpdateRecords.length > 0) {
    await base
        .getTable(reconcileTable)
        .updateRecordsAsync(reconcileUpdateRecords.slice(0, 50));
    reconcileUpdateRecords = reconcileUpdateRecords.slice(50);
}

// Done!
output.markdown('# Reconciliation Complete');

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

