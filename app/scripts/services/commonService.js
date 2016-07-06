'use strict';
function CommonService(databaseService, emailService, globalizationService, sharedService) {
    function validateBooking(booking, authToken, calendar, caller, handleErrorDBCallback) {
      var bookingToValidate = booking;
          databaseService.validateBookingDB(bookingToValidate.id, authToken).then(function () {
            bookingToValidate.isValidated = true;
            sharedService.prepForBookingValidatedBroadcast(calendar, bookingToValidate, caller);       
        },handleErrorDBCallback);
    }

    function cancelConflictedBookings(authToken, bookingToValidateID, bookingsSharingSlotToBeCancelled, refreshCalendarAfterDeletionFunction, handleErrorDBCallback){
      if(bookingsSharingSlotToBeCancelled !== []) {
        var bookingToRemoveIds= [];
        for (var i = 0; i < bookingsSharingSlotToBeCancelled.length; i++){
          var bookingsSharingSlotID = bookingsSharingSlotToBeCancelled[i].id;
          if(bookingToValidateID !== bookingsSharingSlotID){
            bookingToRemoveIds.push(bookingsSharingSlotToBeCancelled[i].id);
          }
        }
        databaseService.deleteBookingsDB(bookingToRemoveIds, authToken)
          .then(refreshCalendarAfterDeletionFunction, handleErrorDBCallback);
      }
    }

    function getBookingsSharingSlot(booking, calendar, bookingsSharingSlot) {
      if(calendar !== undefined && booking !== undefined) {
        var start = parseFloat(booking.scheduleStart);
        var bookingID = booking.id;
        var end = parseFloat(booking.scheduleEnd);
        for (var i = 0; i < calendar.length; i++) {
          var detail = calendar[i];
          var dStart = detail.scheduleStart;
          var dEnd = parseFloat(detail.scheduleEnd);
          if(bookingID !== detail.id &&
            booking.day === detail.day &&
            parseInt(booking.year) === parseInt(detail.year) &&
            dStart < end && start < dEnd) {
            bookingsSharingSlot.push(angular.copy(detail));
          }
        }
      }
    }


    function sendEmails(bookingValidated, bookingsCancelled, authToken, i18nVALIDATION_EMAIL_SUBJECT, i18nVALIDATION_EMAIL_BODY, i18nCANCEL_EMAIL_SUBJECT, i18nCANCEL_EMAIL_BODY, handleErrorDBCallback){
      sendConfirmationEmail(bookingValidated, authToken, i18nVALIDATION_EMAIL_SUBJECT, i18nVALIDATION_EMAIL_BODY, handleErrorDBCallback);
      sendCancelationEmails(bookingValidated.id, authToken, bookingsCancelled, i18nCANCEL_EMAIL_SUBJECT, i18nCANCEL_EMAIL_BODY, handleErrorDBCallback);  
    }

    function sendConfirmationEmail(booking, authToken, i18nVALIDATION_EMAIL_SUBJECT, i18nVALIDATION_EMAIL_BODY, handleErrorDBCallback){
      databaseService.getBookerEmailDB(booking.bookedBy, authToken).
      then(function(response) {
        var to = response.data.email;
        var from = 'admin@admin.fr';
        var cc = '';
        var scheduleStart = (booking.scheduleStart+'h').replace(".5h", "h30");
        var scheduleEnd = (booking.scheduleEnd+'h').replace(".5h", "h30");
        var subject = globalizationService.getLocalizedString(i18nVALIDATION_EMAIL_SUBJECT);
        var body = globalizationService.getLocalizedString(i18nVALIDATION_EMAIL_BODY);
        subject = subject.replace("<BOOKING_DAY>", booking.day)
                .replace("<BOOKING_SCHEDULE_START>", scheduleStart)
                .replace("<BOOKING_SCHEDULE_END>", scheduleEnd);

         body = body.replace("<BOOKING_DAY>", booking.day)
                .replace("<BOOKING_SCHEDULE_START>", scheduleStart)
                .replace("<BOOKING_SCHEDULE_END>", scheduleEnd);

        emailService.sendEmail(from, to, cc, subject, body, authToken);

      }, handleErrorDBCallback);
    }

    function sendCancelationEmails(bookingValidatedID, authToken, bookingsCancelled, i18nCANCEL_EMAIL_SUBJECT, i18nCANCEL_EMAIL_BODY, handleErrorDBCallback) {
      if(bookingsCancelled !== undefined){
        for(var i = 0; i < bookingsCancelled.length; i++) {
          var bookingCancelled = bookingsCancelled[i];
          if(bookingCancelled.id !== bookingValidatedID) {
            databaseService.getBookerEmailDB(bookingCancelled.bookedBy, authToken).
            then(function(response) {
              sendCancelationEmail(response, bookingCancelled, authToken, i18nCANCEL_EMAIL_SUBJECT, i18nCANCEL_EMAIL_BODY);
            }, handleErrorDBCallback);
          }
        }
      }
          
      }

    function sendCancelationEmail (response, bookingCancelled, authToken, i18nCANCEL_EMAIL_SUBJECT, i18nCANCEL_EMAIL_BODY) {
        var to = response.data.email;
        var from = 'admin@admin.fr';
        var cc = '';
        var scheduleStart = (bookingCancelled.scheduleStart+'h').replace(".5h", "h30");
        var scheduleEnd = (bookingCancelled.scheduleEnd+'h').replace(".5h", "h30");
        var subject = globalizationService.getLocalizedString(i18nCANCEL_EMAIL_SUBJECT);
        var body = globalizationService.getLocalizedString(i18nCANCEL_EMAIL_BODY);
        subject = subject.replace("<BOOKING_DAY>", bookingCancelled.day)
            .replace("<BOOKING_SCHEDULE_START>", scheduleStart)
            .replace("<BOOKING_SCHEDULE_END>", scheduleEnd);

        body = body.replace("<BOOKING_DAY>", bookingCancelled.day)
            .replace("<BOOKING_SCHEDULE_START>", scheduleStart)
            .replace("<BOOKING_SCHEDULE_END>", scheduleEnd);

        emailService.sendEmail(from, to, cc, subject, body, authToken);
    }

    var service = {};
    service.validateBooking = validateBooking;
    service.getBookingsSharingSlot = getBookingsSharingSlot;
    service.sendEmails = sendEmails;
    service.sendConfirmationEmail = sendConfirmationEmail;
    service.sendCancelationEmails = sendCancelationEmails;
    service.sendCancelationEmail = sendCancelationEmail;
    service.cancelConflictedBookings = cancelConflictedBookings;

    return service;
}


angular.module('calendarApp').factory('commonService', CommonService);

CommonService.$inject = ['databaseService', 'emailService', 'globalizationService', 'sharedService'];  