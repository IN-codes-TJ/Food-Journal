/* 
 *TO DO: 
 * > CREATE TRIGGER SO causeTypeID is checked to be present in illness or mood tables 
 * > Decide on the moods that can be chosen
 */

SET SEARCH_PATH TO foodjournal, PUBLIC;

/* ACCOUNT */

/* User account information */
CREATE TABLE account (
	userID				SERIAL PRIMARY KEY,
	username			VARCHAR(128) NOT NULL UNIQUE,
	email				VARCHAR(128) NOT NULL UNIQUE CHECK email LIKE '_%@_%._%',
	password			VARCHAR(256) NOT NULL UNIQUE /* Hashed */
);



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
	desc				VARCHAR(512),
	satisfaction		satisfactionDomain,
	FOREIGN KEY userID REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE
);

/* Used to store ingredients of a food */
CREATE TABLE ingredients (
	ingredientID		SERIAL PRIMARY KEY,
	foodID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
	FOREIGN KEY foodID REFERENCES foodData ON UPDATE CASCADE ON DELETE CASCADE
);

/* For foods the user has eaten, and when (foods can have slight modifications) */
/* The user can eat a saved food multiple times, including any possible modifications
 * made to the food 
 */
CREATE TABLE eatenFood(
	eatenID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	foodID				INTEGER NOT NULL,
	timeEaten			TIME NOT NULL,
	FOREIGN KEY userID REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY foodID REFERENCES foodData ON UPDATE CASCADE ON DELETE CASCADE
);

/* For modifications made to foods that were eaten */
CREATE TABLE modifications (
	modificationID		SERIAL PRIMARY KEY,
	eatenID 			INTEGER NOT NULL,
	alteredIngredientID	INTEGER NOT NULL,
	newIngredient		VARCHAR(128) NOT NULL,
	FOREIGN KEY eatenID REFERENCES eatenFood ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY alteredIngredientID REFERENCES ingredient ON UPDATE CASCADE ON DELETE CASCADE
);



/* FEELINGS */

/* Stores the moods felt by the user */
/* TO DO: Think more about the moods to be available */
CREATE DOMAIN mood AS VARCHAR(128) 
DEFAULT 'Okay' CHECK (VALUE IN ('Great', 
								'Okay', 
								'Sad', 
								'Angry', 
								'Relaxed', 
								'Foggy', 
								'Tired', 
								'Dizzy',
								'Energetic'));
CREATE TABLE mood (
	moodID				SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	mood				moodDomain,
	desc				VARCHAR(512),
	FOREIGN KEY userID REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE
);

/* Stores the sicknesses felt by the user */
CREATE TABLE sickness (
	sicknessID			SERIAL PRIMARY KEY,
	userID				INTEGER NOT NULL,
	name				VARCHAR(128) NOT NULL,
	desc				VARCHAR(512),
	FOREIGN KEY userID REFERENCES account ON UPDATE CASCADE ON DELETE CASCADE
);

/* Stores symptoms associated with sicknesses */
CREATE TABLE symptom (
	symptomID			SERIAL PRIMARY KEY,
	sicknessID			INTEGER NOT NULL,
	symptom				VARCHAR(128) NOT NULL,
	FOREIGN KEY sicknessID REFERENCES sickness ON UPDATE CASCADE ON DELETE CASCADE
);



/* EFFECTS/ASSOCIATIONS */

/* Used to store the effects created by an eaten food (foods associated with moods/sicknesses) */
/* createTypeID is either a sicknessID or moodID, as determined by causeType */
CREATE DOMAIN causeTypeDomain AS CHAR DEFAULT 'S' CHECK (VALUE IN ('S', 'M'));
CREATE TABLE effect (
	effectID			SERIAL PRIMARY KEY,
	eatenID 			INTEGER NOT NULL,
	causeTypeID			INTEGER NOT NULL,
	causeType			causeTypeDomain,
	FOREIGN KEY eatenID REFERENCES eatenFood ON UPDATE CASCADE ON DELETE CASCADE
);
/* TO DO: CREATE TRIGGER SO causeTypeID is checked to be present in illness or mood tables */
