function syncCalendar() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var calendarId = 'cs.washington.edu_rs49k1fe4dbcd6oo74ot2dr8ac@group.calendar.google.com';
  var calendar = CalendarApp.getCalendarById(calendarId);

  var sheet = spreadsheet.getSheetByName('SignUp');
  var dataRange = sheet.getDataRange();
  
  var data = dataRange.getValues();
  
  var earliestDate = null;
  for (i=1; i<data.length; i++) {  // skip headers
    var date = data[i][0];
    
    if (!date) {
      continue;
    }
    
    if (earliestDate == null || date < earliestDate) {
      earliestDate = date;
    }
  }
  
  if (earliestDate == null) {
    Logger.log('Nobody has signed up yet.');
    return;
  }
  
  Logger.log('Earliest date: %s', earliestDate);
  
  // hack to get calendar event by id
  // needed beacuse of https://code.google.com/p/google-apps-script-issues/issues/detail?id=395
  var events = calendar.getEvents(earliestDate, new Date(2099, 0, 1));  // what can possibly go wrong
  
  // dicionary of all events, we will delete whatever stays in here at the end of this function
  var indexedEvents = {};
  
  for (var i=0; i<events.length; i++) {
    indexedEvents[events[i].getId()] = events[i];
  }
  
  for (var i=1; i<data.length; i++) {  // skip headers
    var row = data[i];
    
    var date = row[0];
    var name = row[1] || 'CSE student';
    var email = row[2];
    var emails = email.split(',').map(function(s) {return s.trim()});
    var location = row[3] || 'Atrium';
    var eventId = row[5];
    
    if (!date) {
      continue;
    }
    
    // no email or name means no breakfast :-(
    if (!email && !row[1]) {
      row[5] = '';
      continue;
    }
    
    // create or update calendar event
    var title = name + ' brings breakfast';
    var startTime = new Date(date);
    startTime.setHours(10);
    var endTime = new Date(date);
    endTime.setHours(11);
    
    var event = undefined;
    
    if (eventId) {
      event = indexedEvents[eventId];
      
      if (!event) {
        Logger.log('Cannot find event %s', event);
      } else {
        event.setTitle(title);
        event.setTime(startTime, endTime);
      }
    }
    
    if (!event) {
      event = calendar.createEvent(title, startTime, endTime);
      event.setDescription('Edit at https://breakfast.cs.washington.edu and subscribe at https://goo.gl/BdOI7K.');
      row[5] = event.getId();
    }
    
    // remove id from indexed events so that we don't delete it
    delete indexedEvents[event.getId()];
    
    if (email) {
      for (var j=0; j<emails.length; j++) {
        event.addGuest(emails[j]);
      }
    }
    
    event.setLocation(location + ' in Paul G. Allen Center');
  }
  
  // write updated information back
  dataRange.setValues(data);
  
  Logger.log('Deleting %s entries', Object.keys(indexedEvents).length);
  
  // delete all events that are still in the indexed events dict
  Object.keys(indexedEvents).forEach(function(eventId) {
    indexedEvents[eventId].deleteEvent();
  });
}
