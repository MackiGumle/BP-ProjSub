-- Drop Foreign Key Constraints
ALTER TABLE Assignment DROP CONSTRAINT Assignment_Subject_FK;
ALTER TABLE Assignment DROP CONSTRAINT Assignment_Teacher_FK;

ALTER TABLE Rating DROP CONSTRAINT Rating_Submission_FK;
ALTER TABLE Rating DROP CONSTRAINT Rating_Teacher_FK;

ALTER TABLE SubjectStudent DROP CONSTRAINT Relation_13_Student_FK;
ALTER TABLE SubjectStudent DROP CONSTRAINT Relation_13_Subject_FK;

ALTER TABLE Teaches DROP CONSTRAINT Relation_6_Subject_FK;
ALTER TABLE Teaches DROP CONSTRAINT Relation_6_Teacher_FK;

ALTER TABLE Student DROP CONSTRAINT Student_Person_FK;

ALTER TABLE Submission DROP CONSTRAINT Submission_Assignment_FK;
ALTER TABLE Submission DROP CONSTRAINT Submission_Student_FK;

ALTER TABLE Teacher DROP CONSTRAINT Teacher_Person_FK;

-- Drop Primary Key Constraints
ALTER TABLE Assignment DROP CONSTRAINT Assignment_PK;
ALTER TABLE Person DROP CONSTRAINT Person_PK;
ALTER TABLE Rating DROP CONSTRAINT Rating_PK;
ALTER TABLE Student DROP CONSTRAINT Student_PK;
ALTER TABLE Subject DROP CONSTRAINT Subject_PK;
ALTER TABLE SubjectStudent DROP CONSTRAINT Relation_13_PK;
ALTER TABLE Submission DROP CONSTRAINT Submission_PK;
ALTER TABLE Teacher DROP CONSTRAINT Teacher_PK;
ALTER TABLE Teaches DROP CONSTRAINT Relation_6_PK;

-- Drop Tables
DROP TABLE Assignment;
DROP TABLE Rating;
DROP TABLE Submission;
DROP TABLE SubjectStudent;
DROP TABLE Teaches;
DROP TABLE Student;
DROP TABLE Teacher;
DROP TABLE Subject;
DROP TABLE Person;
