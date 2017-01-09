function sendReminder() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var templates = spreadsheet.getSheetByName('Templates');

  var sheet = spreadsheet.getSheetByName('SignUp');
  var dataRange = sheet.getDataRange();

  var data = dataRange.getValues();
  
  for (var i=1; i<data.length; i++) {  // skip headers
    var row = data[i];
    
    var date = row[0];
    var name = row[1] || 'CSE student';
    var email = row[2];
    
    if (!date) {
      continue;
    }
    
    if (!email) {
      continue;
    }

    // send reminder email
    var howManyDays = dateDiffInDays(date);
    
    switch (howManyDays) {
      case 1:
        var subject = templates.getRange('B3').getValue();
        var message = fillInTemplateFromObject(templates.getRange('C3').getValue(), {name: name});
        Logger.log('Emailing %s the day before', email)
        MailApp.sendEmail(email, subject, message);
        break;
        
      case 4:
        var subject = templates.getRange('B2').getValue();
        var message = fillInTemplateFromObject(templates.getRange('C2').getValue(), {name: name});
        Logger.log('Emailing %s the week before with %s', email, message)
        MailApp.sendEmail(email, subject, message);
        break;
    }
  }
}

/**
 * Returns in how many days the provided date is. 
 */
function dateDiffInDays(date) {
  var MS_PER_DAY = 1000 * 60 * 60 * 24;
  var now = new Date();
  
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  var utc2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Replaces markers in a template string with values define in a JavaScript data object.
 * Arguments:
 *   - template: string containing markers, for instance ${"Column name"}
 *   - data: JavaScript object with values to that will replace markers. For instance
 *           data.columnName will replace marker ${"Column name"}
 * Returns a string without markers. If no data is found to replace a marker, it is
 * simply removed.
 */
function fillInTemplateFromObject(template, data) {
  var email = template;
  // Search for all the variables to be replaced, for instance ${"Column name"}
  var regex = /\$\{([^\$]+)\}/g;
  var match = regex.exec(template);

  // Replace variables from the template with the actual values from the data object.
  // If no value is available, replace with the empty string.
  while (match !== null) {
    var variableData = data[match[1]];
    email = email.replace(match[0], variableData || "");
    match = regex.exec(template);
  }

  return email;
}
