DROP SCHEMA foodjournal CASCADE;
CREATE SCHEMA foodjournal;
SET SEARCH_PATH TO foodjournal, PUBLIC;
/*SET TIME ZONE 'Europe/London';*/
/* ACCOUNT */

/* User account information */
CREATE TABLE account (
	userID				SERIAL PRIMARY KEY,
	username			VARCHAR(128) NOT NULL UNIQUE,
	email				VARCHAR(128) NOT NULL UNIQUE CHECK (email LIKE '_%@_%._%'),
	password			VARCHAR(256) NOT NULL /* Hashed */
); /* TESTED */



/* FOOD */

/* Food information except it's ingredients and possible effects on this user */
CREATE TABLE foodData (
	foodID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
	description			VARCHAR(512),
	FOREIGN KEY (userID) REFERENCES account ON DELETE CASCADE ON UPDATE CASCADE
); /* TESTED */

/* Used to store ingredients of a food */
CREATE TABLE ingredient (
	ingredientID		SERIAL PRIMARY KEY,
	foodID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
	FOREIGN KEY (foodID) REFERENCES foodData ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

/* For foods the user has eaten, and when (foods can have slight modifications) */
/* The user can eat a saved food multiple times, including any possible modifications
 * made to the food 
 */
CREATE DOMAIN satisfactionDomain AS VARCHAR(8) 
DEFAULT 'Okay' CHECK (VALUE IN ('Loved', 
								'Liked', 
								'Okay', 
								'Disliked', 
								'Hated'));
CREATE TABLE eatenFood(
	eatenID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	foodID				INTEGER NOT NULL,
	time				TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	satisfaction		satisfactionDomain,
	FOREIGN KEY (userID) REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (foodID) REFERENCES foodData ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

/* For modifications made to foods that were eaten */
CREATE DOMAIN modificationType AS VARCHAR(6)
DEFAULT 'Add' CHECK (VALUE IN ('Add', 'Remove'));
CREATE TABLE modification (
	modificationID		SERIAL PRIMARY KEY,
	eatenID 			INTEGER NOT NULL,
	modificationType	modificationType,
	ingredientName		VARCHAR(128) NOT NULL,
	FOREIGN KEY (eatenID) REFERENCES eatenFood ON UPDATE CASCADE ON DELETE CASCADE,
); /* TESTED */



/* FEELINGS */

/* Stores the moods felt by the user */
CREATE TABLE mood (
	moodID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
	time				TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	description			VARCHAR(512),
	FOREIGN KEY (userID) REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

/* Stores the sicknesses felt by the user */
CREATE TABLE sickness (
	sicknessID			SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
	time				TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	description			VARCHAR(512),
	FOREIGN KEY (userID) REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

/* Stores symptoms associated with sicknesses */
CREATE TABLE symptom (
	symptomID			SERIAL PRIMARY KEY,
	sicknessID			INTEGER NOT NULL,
	symptom				VARCHAR(128) NOT NULL,
	FOREIGN KEY (sicknessID) REFERENCES sickness ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

/* EFFECTS/ASSOCIATIONS */

/* Used to store the effects created by an eaten food (foods associated with moods/sicknesses) */
/* createTypeID is either a sicknessID or moodID, as determined by causeType */
CREATE DOMAIN causeTypeDomain AS CHAR DEFAULT 'S' CHECK (VALUE IN ('S', 'M'));
CREATE TABLE effect (
	effectID			SERIAL PRIMARY KEY,
	eatenID 			INTEGER NOT NULL,
	causeTypeID			INTEGER NOT NULL,
	causeType			causeTypeDomain,
	FOREIGN KEY (eatenID) REFERENCES eatenFood ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

CREATE OR REPLACE FUNCTION checkEffect()
RETURNS TRIGGER AS $$
BEGIN
	IF (NEW.causeType = 'S') THEN
		IF (SELECT COUNT (sicknessID) FROM sickness WHERE sicknessID = NEW.causeTypeID) = 0 THEN
			RAISE EXCEPTION 'Invalid sicknessID - not in sickness table';
			RETURN NULL;
		END IF;
	ELSIF(NEW.causeType = 'M') THEN
		IF (SELECT COUNT (moodID) FROM mood WHERE moodID = NEW.causeTypeID) = 0 THEN
			RAISE EXCEPTION 'Invalid moodID - not in mood table';
			RETURN NULL;
		END IF;
	ELSE
		RAISE EXCEPTION 'Must be of type sickness or mood';
		RETURN NULL;
	END IF;

	RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER checkEffect
BEFORE INSERT 
ON effect
FOR EACH ROW
EXECUTE FUNCTION checkEffect();

CREATE OR REPLACE FUNCTION deleteSicknessEffect()
RETURNS TRIGGER AS $$
BEGIN
	DELETE FROM effect WHERE causeType = 'S' AND causeTypeID = OLD.sicknessID;
	RETURN OLD;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER deleteSicknessEffect
AFTER DELETE 
ON sickness
FOR EACH ROW
EXECUTE FUNCTION deleteSicknessEffect();

CREATE OR REPLACE FUNCTION deleteMoodEffect()
RETURNS TRIGGER AS $$
BEGIN
	DELETE FROM effect WHERE causeType = 'M' AND causeTypeID = OLD.moodID;
	RETURN OLD;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER deleteMoodEffect
AFTER DELETE 
ON mood
FOR EACH ROW
EXECUTE FUNCTION deleteMoodEffect();

/* VIEWS */

CREATE OR REPLACE VIEW eatenData AS
SELECT foodData.foodID, foodData.userID, foodData.name, foodData.description, eatenFood.satisfaction, 
eatenFood.eatenID, eatenFood.time FROM foodData INNER JOIN eatenFood ON foodData.foodID = eatenFood.foodID;
SELECT * FROM eatenData;

CREATE OR REPLACE VIEW itemsList AS
SELECT eatenID as ID, userID, name, description, time, 'Food' as type FROM eatenData UNION
SELECT moodID as ID, userID, name, description, time, 'Mood' as type FROM mood UNION
SELECT sicknessID as ID, userID, name, description, time, 'Sickness' as type FROM sickness
ORDER BY time;

/* Test Data */

INSERT INTO account VALUES (1, 'Test', 'Test@gmail.com', 'testpw');
INSERT INTO foodData VALUES (1, 1, 'Sandwich', 'Tasty stuff');
INSERT INTO eatenFood VALUES (4, 1, 1); 
INSERT INTO foodData VALUES (2, 1, 'Onigiri', 'This is the absolute best thing you will every try. The best snack one can ever eat. The description for this has to be long so I can test things, so here I am trying to make it reallyreallyreallysosososoterriblymassivelylongbecause I am testing yay!!!! :D');
INSERT INTO eatenFood VALUES (6, 1, 2);
INSERT INTO ingredient VALUES (1, 1, 'Bread');
INSERT INTO ingredient VALUES (2, 1, 'Butter');
INSERT INTO ingredient VALUES (3, 1, 'Cheese');
INSERT INTO ingredient VALUES (3, 1, 'Cheese');
INSERT INTO modification VALUES(2, 4, 3, 'Ham');
SELECT * FROM sickness;
SELECT * FROM effect;
INSERT INTO mood (moodID, userID, name, description) VALUES (1, 1, 'Unhappy', 'Feeling unhappy desc');
INSERT INTO sickness (sicknessID, userID, name, description) VALUES (1, 1, 'Stomach ache', 'Not good');
INSERT INTO effect (eatenID, causeTypeID, causeType) VALUES (4, 1, 'S');
DELETE FROM mood;
SELECT * FROM mood;
INSERT INTO effect (eatenID, causeTypeID, causeType) VALUES (4, 1, 'M');