// Spinitron Reconciliation-2022-04-01v1.js  
/*
    This script compares the Spinitron Shows table of broadcasts
    with our Google Calendar program schedule for discrepencies.
    Both calendars need to be identical, and this script updates
    the calendar to highlight any differences.
*/
output.markdown('# Reconsile Spinitron Schedule...v1');

const ctlPanel = 'Control Panel';
const scriptView = 'View for Scripts';
const reconcileTable ='Spinitron Reconciliation';
const broadcastSchedTable = 'Sync Broadcast Schedule';
const spinitronTable = 'Spinitron Shows';

const sourceBoth = "Both";
const sourceGcal = "Google Calendar";
const sourceSpinitron = "Spinitron";


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

// Purge old Spinitron Show records

dbMsg('Purging old records...');
let oldRecords = await base.getTable(reconcileTable).getView(scriptView).selectRecordsAsync();
let recIDs = [];
for (let record of oldRecords.records) { recIDs.push(record.id); }
while (recIDs.length > 0) {
    dbMsg(recIDs);
    await base.getTable(reconcileTable).deleteRecordsAsync(recIDs.slice(0, 50));
    recIDs = recIDs.slice(50);
}

let googleScheduleView = base
    .getTable(broadcastSchedTable)
    .getView(scriptView);
let googleScheduleQuery = await googleScheduleView.selectRecordsAsync();
let googleScheduleRecords = googleScheduleQuery.records;
dbMsg('googleScheduleRecords');
dbMsg(googleScheduleRecords);

let spinitronScheduleView = base
    .getTable('Spinitron Shows')
    .getView(scriptView);
let spinitronScheduleQuery = await spinitronScheduleView.selectRecordsAsync();
let spinitronScheduleRecords = spinitronScheduleQuery.records;
dbMsg('spinitronScheduleRecords');
dbMsg( spinitronScheduleRecords);

let reconcileCreateRecords = [];


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
            spinitronRecord.getCellValue('Spinitron Show Start') ==
            googleRecord.getCellValue('Start') )  
            {
                // Starting times match
                if ( // Matching entries
                    spinitronRecord.getCellValue('Spinitron Show') ==
                    googleRecord.getCellValue('Public Name') &&
                    spinitronRecord.getCellValue('Spinitron Show End') ==
                    googleRecord.getCellValue('End') 
                    ) {
                        // Matching entries
                        addBoth(spinitronRecord, sourceBoth );
                     } else { 
                        // No match at all
                        addSpinitron(spinitronRecord, sourceSpinitron);
                        addGoogle(googleRecord, sourceGcal);
                     } 
                break;
            } else {
                if (
                    spinitronRecord.getCellValue('Spinitron Show Start') >
                    googleRecord.getCellValue('Start')
                ) {

        
            }
        
        if (
            spinitronRecord.getCellValue('Spinitron Show Start') >
            googleRecord.getCellValue('Start')
        ) {


                        reconcileCreateRecords.push({
                            fields: {
                                'Source': 'Both',
                                'Show Start': googleRecord.getCellValue('Start'),
                                'Broadcast': googleRecord.getCellValue('Public Name'),
                                'Duration': googleRecord.getCellValue('Duration'),
                                'Control Panel': [controlPanelRecord],
                                'Spinitron Shows': [spinitronRecord],
                                'Google Calendar Showsl': [googleRecord],
                            },
                        })
                    } else {

                    }
                }
        {
            dbMsg('Match!', spinitronRecord.getCellValue('Spinitron Show'));
            reconcileCreateRecords.push({
                fields: {
                    'Source': 'Google Calendar',
                    'Show Start': googleRecord.getCellValue('Start'),
                    'Broadcast': googleRecord.getCellValue('Public Name'),
                    'Duration': googleRecord.getCellValue('Duration'),
                    'Control Panel': [controlPanelRecord],
            },
            });
            break;
        } else {
            if (
                spinitronRecord.getCellValue('Spinitron Show Start') >
                googleRecord.getCellValue('Start')
            ) {
                dbMsg('Miss', spinitronRecord.getCellValue('Spinitron Show'));
                reconcileCreateRecords.push({
                    fields: {
                        'Source': 'Google Calendar',
                        'Show Start': googleRecord.getCellValue('Start'),
                        'Broadcast': googleRecord.getCellValue('Public Name'),
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
dbMsg(reconcileCreateRecords);


// Create the Spinitron records.
while (reconcileCreateRecords.length > 0) {
    await base
        .getTable('Spinitron Shows')
        .createRecordsAsync(reconcileCreateRecords.slice(0, 50));
    reconcileCreateRecords = reconcileCreateRecords.slice(50);
}



// Done!

function addSpinitron(mySpinRecord) {
    dbMsg('Match!', spinitronRecord.getCellValue('Spinitron Show'));
    reconcileCreateRecords.push({
        fields: {
            'Source': 'Spinitron',
            'Show Start': mySpinRecord.getCellValue('Start'),
            'Broadcast': mySpinRecord.getCellValue('Public Name'),
            'Duration': mySpinRecord.getCellValue('Duration'),
            'Control Panel': [controlPanelRecord],    }
        });
    }
    
function addGoogle(myGoogleRecord) {
    dbMsg('Match!', spinitronRecord.getCellValue('Spinitron Show'));
    reconcileCreateRecords.push({
        fields: {
            'Source': 'Google Calendar',
            'Show Start': myGoogleRecord.getCellValue('Start'),
            'Broadcast': myGoogleRecord.getCellValue('Public Name'),
            'Duration': myGoogleRecord.getCellValue('Duration'),
            'Control Panel': [controlPanelRecord],    }
        });
    }
        
function addBoth(mySpinRecord) {
    dbMsg('Match!', spinitronRecord.getCellValue('Spinitron Show'));
    reconcileCreateRecords.push({
        fields: {
            'Source': 'Both',
            'Show Start': mySpinRecord.getCellValue('Start'),
            'Broadcast': mySpinRecord.getCellValue('Public Name'),
            'Duration': mySpinRecord.getCellValue('Duration'),
            'Control Panel': [controlPanelRecord],    }
        });
    }
            
function dbMsg(theMessage) {
//    console.debug(theMessage);
}
