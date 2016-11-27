'use strict';

function CommonService(databaseService, emailService, globalizationService, sharedService, moment) {
    function validateBooking(bookingToValidate, authToken, calendar, caller, handleErrorDBCallback) {
        if (bookingToValidate !== undefined && bookingToValidate.id !== undefined) {
            databaseService.validateBookingDB(bookingToValidate.id, authToken).then(function() {
                bookingToValidate.isValidated = true;
                sharedService.prepForBookingValidatedBroadcast(calendar, bookingToValidate, caller);
            }, handleErrorDBCallback);
        } else {
            var response = { 'data': { 'error': 'Undefined booking or booking id' }, 'status': 404 };
            handleErrorDBCallback(response);
        }
    }

    function cancelConflictedBookings(authToken, bookingToValidateID, bookingsSharingSlotToBeCancelled, refreshCalendarAfterDeletionFunction, handleErrorDBCallback) {
        if (bookingsSharingSlotToBeCancelled !== []) {
            var bookingToRemoveIds = [];
            for (var i = 0; i < bookingsSharingSlotToBeCancelled.length; i++) {
                var bookingsSharingSlotID = bookingsSharingSlotToBeCancelled[i].id;
                if (bookingToValidateID !== bookingsSharingSlotID) {
                    bookingToRemoveIds.push(bookingsSharingSlotToBeCancelled[i].id);
                }
            }
            console.log(bookingToRemoveIds);
            databaseService.deleteBookingsDB(bookingToRemoveIds, authToken)
                .then(refreshCalendarAfterDeletionFunction, handleErrorDBCallback);
        }
    }

    function getBookingsSharingSlot(booking, calendar, bookingsSharingSlot) {
        if (calendar !== undefined && booking !== undefined) {
            var start = parseFloat(booking.scheduleStart);
            var bookingID = parseInt(booking.id);
            var end = parseFloat(booking.scheduleEnd);
            for (var i = 0; i < calendar.length; i++) {
                var detail = calendar[i];
                var dStart = detail.scheduleStart;
                var dEnd = parseFloat(detail.scheduleEnd);
                if (bookingID !== parseInt(detail.id) &&
                    booking.day === detail.day &&
                    parseInt(booking.year) === parseInt(detail.year) &&
                    dStart < end && start < dEnd) {
                    bookingsSharingSlot.push(angular.copy(detail));
                }
            }
        }
    }


    function sendEmails(bookingValidated, bookingsCancelled, authToken, I18N_VALIDATION_EMAIL_SUBJECT, I18N_VALIDATION_EMAIL_BODY, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY, handleErrorDBCallback) {
        sendConfirmationEmail(bookingValidated, authToken, I18N_VALIDATION_EMAIL_SUBJECT, I18N_VALIDATION_EMAIL_BODY, handleErrorDBCallback);
        sendCancelationEmails(bookingValidated.id, authToken, bookingsCancelled, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY, handleErrorDBCallback);
    }

    function sendConfirmationEmail(booking, authToken, I18N_VALIDATION_EMAIL_SUBJECT, I18N_VALIDATION_EMAIL_BODY, handleErrorDBCallback) {
        databaseService.getBookerEmailDB(booking.bookedBy, authToken).
        then(function(response) {
            var to = response.data.email;
            var from = 'admin@admin.fr';
            var cc = '';
            var scheduleStart = (booking.scheduleStart + 'h').replace('.5h', 'h30');
            var scheduleEnd = (booking.scheduleEnd + 'h').replace('.5h', 'h30');
            var room = booking.room;
            var subject = globalizationService.getLocalizedString(I18N_VALIDATION_EMAIL_SUBJECT);
            var body = globalizationService.getLocalizedString(I18N_VALIDATION_EMAIL_BODY);
            subject = subject.replace('<BOOKING_DAY>', booking.day)
                .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
                .replace('<BOOKING_SCHEDULE_END>', scheduleEnd)
                .replace('<BOOKING_ROOM>', room);

            body = body.replace('<BOOKING_DAY>', booking.day)
                .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
                .replace('<BOOKING_SCHEDULE_END>', scheduleEnd)
                .replace('<BOOKING_ROOM>', room);

            emailService.sendEmail(from, to, cc, subject, body, authToken);

        }, handleErrorDBCallback);
    }

    function sendCancelationEmails(bookingValidatedID, authToken, bookingsCancelled, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY, handleErrorDBCallback) {
        if (bookingsCancelled !== undefined) {
            for (var i = 0; i < bookingsCancelled.length; i++) {
                var bookingCancelled = bookingsCancelled[i];
                if (bookingCancelled.id !== bookingValidatedID) {
                    databaseService.getBookerEmailDB(bookingCancelled.bookedBy, authToken).
                    then(cancellationEmailsCallback(bookingCancelled, authToken, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY),
                        handleErrorDBCallback);
                }
            }
        }

    }

    function cancellationEmailsCallback(bookingCancelled, authToken, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY) {
        return (function(response) {
            sendCancelationEmail(response, bookingCancelled, authToken,
                I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY);
        });
    }

    function sendCancelationEmail(response, bookingCancelled, authToken, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY) {
        var to = response.data.email;
        var from = 'admin@admin.fr';
        var cc = '';
        var scheduleStart = (bookingCancelled.scheduleStart + 'h').replace('.5h', 'h30');
        var scheduleEnd = (bookingCancelled.scheduleEnd + 'h').replace('.5h', 'h30');
        var room = bookingCancelled.room;
        var subject = globalizationService.getLocalizedString(I18N_CANCEL_EMAIL_SUBJECT);
        var body = globalizationService.getLocalizedString(I18N_CANCEL_EMAIL_BODY);
        subject = subject.replace('<BOOKING_DAY>', bookingCancelled.day)
            .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
            .replace('<BOOKING_SCHEDULE_END>', scheduleEnd)
            .replace('<BOOKING_ROOM>', room);

        body = body.replace('<BOOKING_DAY>', bookingCancelled.day)
            .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
            .replace('<BOOKING_SCHEDULE_END>', scheduleEnd)
            .replace('<BOOKING_ROOM>', room);

        emailService.sendEmail(from, to, cc, subject, body, authToken);
    }

    function initMonthData(caller, newMonth, newYear, isPeriodic, isStartingDate) {

        var date = moment().year(newYear).month(newMonth).startOf('month');
        var firstMonthWeek = date.subtract(1, 'M').endOf('month').isoWeekday(1).isoWeek();
        var year = firstMonthWeek === 52 ? newYear - 1 : newYear;
        var iterWeek = moment().year(year).isoWeek(firstMonthWeek).startOf('week');
        var monthWeeksIndex;

        if (isPeriodic) {
            if (isStartingDate) {
                monthWeeksIndex = 0;
                caller.dateStart = moment().year(newYear).month(newMonth).startOf('month');
                caller.dateDisplayStart = caller.dateDisplayStart.year(newYear).month(newMonth);
            } else {
                monthWeeksIndex = 1;
                caller.dateEnd = moment().year(newYear).month(newMonth).startOf('month');
                caller.dateDisplayEnd = caller.dateDisplayEnd.year(newYear).month(newMonth);
            }
            caller.monthWeeks[monthWeeksIndex] = [];
        } else {
            caller.monthWeeks = [];
            caller.dateDisplay = caller.dateDisplay.year(newYear).month(newMonth);
            caller.date = moment().year(newYear).month(newMonth).startOf('month');
        }
        //create the week before the month, the 4 weeks of the month and the week after the month
        for (var i = 0; i < 6; i++) {
            var monthDays = [];
            //var iterWeek = week.add(1, 'weeks');
            var weekNumber = iterWeek.isoWeek();
            var weekyear = iterWeek.year();
            //create the days of the week
            for (var j = 0; j < 7; j++) {
                var day = iterWeek.date();
                var month = iterWeek.month();
                iterWeek = iterWeek.add(1, 'd');
                monthDays.push({ 'day': day, 'month': month });
            }
            var monthWeek = {
                'week': weekNumber,
                'monthDays': monthDays,
                'year': weekyear
            };
            if (isPeriodic) {
                caller.monthWeeks[monthWeeksIndex].push(monthWeek);
            } else {
                caller.monthWeeks.push(monthWeek);
            }

            if (caller.todayWeek === weekNumber && caller.todayYear === date.year()) {
                caller.currIndexOfWeeksArray = i;
            }
        }
    }


    var service = {};
    service.validateBooking = validateBooking;
    service.getBookingsSharingSlot = getBookingsSharingSlot;
    service.sendEmails = sendEmails;
    service.sendConfirmationEmail = sendConfirmationEmail;
    service.sendCancelationEmails = sendCancelationEmails;
    service.sendCancelationEmail = sendCancelationEmail;
    service.cancelConflictedBookings = cancelConflictedBookings;
    service.initMonthData = initMonthData;

    return service;
}


angular.module('calendarApp').factory('commonService', CommonService);

CommonService.$inject = ['databaseService', 'emailService', 'globalizationService', 'sharedService', 'moment'];