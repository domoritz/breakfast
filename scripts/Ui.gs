function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createAddonMenu()
      .addItem('Insert my email', 'insertEmail')
      .addSubMenu(ui.createMenu('Admin stuff')
                  .addItem('Copy past dates', 'copyToPast')
                  .addItem('Sync calendar', 'syncCalendar'))
      .addToUi();
  
  showSidebar();
}

function insertEmail() {
  SpreadsheetApp.getActiveRange().setValue(Session.getActiveUser().getEmail());
}

function copyToPast() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  var current = spreadsheet.getSheetByName('SignUp');
  var data = current.getRange(2, 1, current.getMaxRows(), 3).getValues();
  
  var past = spreadsheet.getSheetByName('Past');
  for (i in data) {  // skip header
    var row = data[i];
    if (row[0] < new Date()) {
      // if we have name or email copy data over
      if (row[1] || row[2]) {
        past.appendRow(row);
      }
    }
  }
  
  Browser.msgBox('Copied past dates from "SignUp" to "Past" sheet. You can now delete the rows for past dates.');
}
