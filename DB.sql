SET SEARCH_PATH TO foodjournal, PUBLIC;

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
CREATE DOMAIN satisfactionDomain AS VARCHAR(8) 
DEFAULT 'Okay' CHECK (VALUE IN ('Loved', 
								'Liked', 
								'Okay', 
								'Disliked', 
								'Hated'));
CREATE TABLE foodData (
	foodID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
	description			VARCHAR(512),
	satisfaction		satisfactionDomain,
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
CREATE TABLE eatenFood(
	eatenID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	foodID				INTEGER NOT NULL,
	timeEaten			TIME NOT NULL,
	FOREIGN KEY (userID) REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (foodID) REFERENCES foodData ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

/* For modifications made to foods that were eaten */
CREATE TABLE modification (
	modificationID		SERIAL PRIMARY KEY,
	eatenID 			INTEGER NOT NULL,
	alteredIngredientID	INTEGER NOT NULL,
	newIngredient		VARCHAR(128) NOT NULL,
	FOREIGN KEY (eatenID) REFERENCES eatenFood ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (alteredIngredientID) REFERENCES ingredient ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */



/* FEELINGS */

/* Stores the moods felt by the user */
CREATE TABLE mood (
	moodID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	mood				VARCHAR(128) NOT NULL,
	description			VARCHAR(512),
	FOREIGN KEY (userID) REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE
); /* TESTED */

/* Stores the sicknesses felt by the user */
CREATE TABLE sickness (
	sicknessID			SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
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