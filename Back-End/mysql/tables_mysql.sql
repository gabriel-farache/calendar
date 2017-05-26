CREATE DATABASE calendar_pechbusque;

CREATE TABLE Room (
    roomID int(11) NOT NULL AUTO_INCREMENT,
    building VARCHAR(255) NOT NULL,
    room VARCHAR(255) NOT NULL,
    PRIMARY KEY(roomID)
);

CREATE TABLE User (
    bookerID int(11) NOT NULL AUTO_INCREMENT,
    booker VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN NOT NULL DEFAULT 0, 
    color VARCHAR(8) NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY(bookerID)
);

CREATE TABLE PeriodicBooking (
    periodicBookingID int(11) NOT NULL AUTO_INCREMENT,
    periodicBookingScheduleStart FLOAT(3,1) NOT NULL,
    periodicBookingScheduleEnd FLOAT(3,1) NOT NULL,
    periodicBookingWeeksDuration int NOT NULL, 
    periodicBookingStartingDay VARCHAR(15) NOT NULL,
    periodicBookingStartingMonth int NOT NULL,
    periodicBookingStartingYear int NOT NULL,
    room int(11) NOT NULL,
    isValidated BOOLEAN NOT NULL DEFAULT 0,
    bookedBy int(11) NOT NULL,
    PRIMARY KEY(periodicBookingID),
    FOREIGN KEY (room) REFERENCES Room (roomID) ON DELETE CASCADE,
    FOREIGN KEY (bookedBy) REFERENCES User (bookerID) ON DELETE CASCADE
);

CREATE TABLE Booking (
    bookingID int(11) NOT NULL AUTO_INCREMENT,
    scheduleStart FLOAT(3,1) NOT NULL,
    scheduleEnd FLOAT(3,1) NOT NULL,
    day VARCHAR(15) NOT NULL,
    week int NOT NULL,
    year int NOT NULL,
    room int(11) NOT NULL,
    isValidated BOOLEAN NOT NULL DEFAULT 0,
    bookedBy int(11) NOT NULL,
    isPeriodic BOOLEAN NOT NULL DEFAULT 0,
    periodicBookingID int(11),
    PRIMARY KEY(bookingID),
    FOREIGN KEY (room) REFERENCES Room (roomID) ON DELETE CASCADE,
    FOREIGN KEY (bookedBy) REFERENCES User (bookerID) ON DELETE CASCADE,
    FOREIGN KEY (periodicBookingID) REFERENCES PeriodicBooking (periodicBookingID) ON DELETE CASCADE
);

CREATE TABLE UserToken (
    token VARCHAR(255) NOT NULL,
    endAvailability TIMESTAMP NOT NULL,
    isAdmin BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY(token)
);

CREATE TABLE AdminToken (
    adminTokenID int(11) NOT NULL AUTO_INCREMENT,
    adminToken VARCHAR(255) NOT NULL,
    adminTokenEndTime TIMESTAMP NOT NULL,
    PRIMARY KEY(adminTokenID)
);