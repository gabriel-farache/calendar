CREATE TABLE Booking (
	id INT NOT NULL AUTO_INCREMENT,
	room VARCHAR(255) NOT NULL,
	scheduleStart DECIMAL NOT NULL,
	scheduleEnd DECIMAL NOT NULL,
	day VARCHAR(15) NOT NULL,
	week INT NOT NULL,
	year INT NOT NULL,
	bookedBy VARCHAR(255) NOT NULL,
	isValidated BOOL NOT NULL DEFAULT FALSE,
	PRIMARY KEY(id)
);

CREATE TABLE Booker (
	booker VARCHAR(255) NOT NULL,
	color VARCHAR(255) NOT NULL,
	PRIMARY KEY(booker)
);

CREATE TABLE Room (
	room VARCHAR(255) NOT NULL,
	PRIMARY KEY (room)
);


CREATE TABLE User (
	username VARCHAR(255) NOT NULL,
	encodedPassword VARCHAR(255) NOT NULL,
	isAdmin BOOL NOT NULL DEFAULT FALSE,
	PRIMARY KEY(username)
);

CREATE TABLE UserToken (
	token VARCHAR(255) NOT NULL,
	endAvailability DATETIME NOT NULL,
	isAdmin BOOL NOT NULL DEFAULT FALSE,
	PRIMARY KEY(token)
);
CREATE TABLE AdminToken (
	adminToken VARCHAR(255) NOT NULL,
	adminTokenEndTime DATETIME NOT NULL,
	PRIMARY KEY(adminToken)
);

INSERT INTO Booker values ("Asso 01", "#F44336");
INSERT INTO Booker values ("Asso 02", "#FBC02D");
INSERT INTO Booker values ("Asso 03", "#CDDC39");
INSERT INTO Booker values ("Asso 04", "#00BCD4");
INSERT INTO Booker values ("","#ace1fd");

INSERT INTO Room VALUES ("Room 01");
INSERT INTO Room VALUES ("Room 02");
INSERT INTO Room VALUES ("Room 03");
INSERT INTO Room VALUES ("Room 04");