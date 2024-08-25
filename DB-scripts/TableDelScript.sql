ALTER TABLE Assignment DROP CONSTRAINT Assignment_Person_FK;
ALTER TABLE Assignment DROP CONSTRAINT Assignment_Subject_FK;

ALTER TABLE PersonSubject DROP CONSTRAINT PersonSubject_Person_FK;
ALTER TABLE PersonSubject DROP CONSTRAINT PersonSubject_Subject_FK;

ALTER TABLE Rating DROP CONSTRAINT Rating_Person_FK;
ALTER TABLE Rating DROP CONSTRAINT Rating_Submission_FK;

ALTER TABLE Submission DROP CONSTRAINT Submission_Assignment_FK;
ALTER TABLE Submission DROP CONSTRAINT Submission_Person_FK;



DROP TABLE Rating;
DROP TABLE Submission;
DROP TABLE Assignment;
DROP TABLE PersonSubject;
DROP TABLE Subject;
DROP TABLE Person;