CREATE TABLE Assignment 
    (
     Id INTEGER NOT NULL IDENTITY(1,1) , 
     Type VARCHAR (25) , 
     Title VARCHAR (25) , 
     Description VARCHAR (500) , 
     DateAssigned DATETIME DEFAULT CURRENT_TIMESTAMP , 
     DueDate DATETIME , 
     MaxPoints BIGINT , 
     Teacher_Person_Id INTEGER NOT NULL , 
     Subject_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Assignment ADD CONSTRAINT Assignment_PK PRIMARY KEY CLUSTERED (Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Person 
    (
     Id INTEGER NOT NULL IDENTITY(1,1) , 
     Name VARCHAR (25) , 
     Surname VARCHAR (25) , 
     Email VARCHAR (254) NOT NULL , 
     Password VARCHAR (64) NOT NULL
    )
GO

ALTER TABLE Person ADD CONSTRAINT Person_PK PRIMARY KEY CLUSTERED (Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Rating 
    (
     Time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
     Rating NUMERIC (28) , 
     Note VARCHAR (500) , 
     Teacher_Person_Id INTEGER NOT NULL , 
     Submission_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Rating ADD CONSTRAINT Rating_PK PRIMARY KEY CLUSTERED (Time)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Student 
    (
     Semester INTEGER , 
     Study_form VARCHAR (25) , 
     Study_type VARCHAR (25) , 
     Faculty VARCHAR (40) , 
     Person_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Student ADD CONSTRAINT Student_PK PRIMARY KEY CLUSTERED (Person_Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Subject 
    (
     Id INTEGER NOT NULL IDENTITY(1,1) , 
     Name VARCHAR (25) , 
     Description VARCHAR (25) , 
     Language VARCHAR (25) 
    )
GO

ALTER TABLE Subject ADD CONSTRAINT Subject_PK PRIMARY KEY CLUSTERED (Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE SubjectStudent 
    (
     Subject_Id INTEGER NOT NULL , 
     Student_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE SubjectStudent ADD CONSTRAINT Relation_13_PK PRIMARY KEY CLUSTERED (Subject_Id, Student_Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Submission 
    (
     Id INTEGER NOT NULL IDENTITY(1,1) , 
     SubmissionDate DATETIME DEFAULT CURRENT_TIMESTAMP , 
     FileName VARCHAR (25) , 
     FileData VARBINARY , 
     Student_Person_Id INTEGER NOT NULL , 
     Assignment_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Submission ADD CONSTRAINT Submission_PK PRIMARY KEY CLUSTERED (Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Teacher 
    (
     Office VARCHAR (25) , 
     Person_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Teacher ADD CONSTRAINT Teacher_PK PRIMARY KEY CLUSTERED (Person_Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Teaches 
    (
     Teacher_Person_Id INTEGER NOT NULL , 
     Subject_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Teaches ADD CONSTRAINT Relation_6_PK PRIMARY KEY CLUSTERED (Teacher_Person_Id, Subject_Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

ALTER TABLE Assignment 
    ADD CONSTRAINT Assignment_Subject_FK FOREIGN KEY 
    ( 
     Subject_Id
    ) 
    REFERENCES Subject 
    ( 
     Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Assignment 
    ADD CONSTRAINT Assignment_Teacher_FK FOREIGN KEY 
    ( 
     Teacher_Person_Id
    ) 
    REFERENCES Teacher 
    ( 
     Person_Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Rating 
    ADD CONSTRAINT Rating_Submission_FK FOREIGN KEY 
    ( 
     Submission_Id
    ) 
    REFERENCES Submission 
    ( 
     Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Rating 
    ADD CONSTRAINT Rating_Teacher_FK FOREIGN KEY 
    ( 
     Teacher_Person_Id
    ) 
    REFERENCES Teacher 
    ( 
     Person_Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE SubjectStudent 
    ADD CONSTRAINT Relation_13_Student_FK FOREIGN KEY 
    ( 
     Student_Id
    ) 
    REFERENCES Student 
    ( 
     Person_Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE SubjectStudent 
    ADD CONSTRAINT Relation_13_Subject_FK FOREIGN KEY 
    ( 
     Subject_Id
    ) 
    REFERENCES Subject 
    ( 
     Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Teaches 
    ADD CONSTRAINT Relation_6_Subject_FK FOREIGN KEY 
    ( 
     Subject_Id
    ) 
    REFERENCES Subject 
    ( 
     Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Teaches 
    ADD CONSTRAINT Relation_6_Teacher_FK FOREIGN KEY 
    ( 
     Teacher_Person_Id
    ) 
    REFERENCES Teacher 
    ( 
     Person_Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Student 
    ADD CONSTRAINT Student_Person_FK FOREIGN KEY 
    ( 
     Person_Id
    ) 
    REFERENCES Person 
    ( 
     Id 
    ) 
    ON DELETE CASCADE 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Submission 
    ADD CONSTRAINT Submission_Assignment_FK FOREIGN KEY 
    ( 
     Assignment_Id
    ) 
    REFERENCES Assignment 
    ( 
     Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Submission 
    ADD CONSTRAINT Submission_Student_FK FOREIGN KEY 
    ( 
     Student_Person_Id
    ) 
    REFERENCES Student 
    ( 
     Person_Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO

ALTER TABLE Teacher 
    ADD CONSTRAINT Teacher_Person_FK FOREIGN KEY 
    ( 
     Person_Id
    ) 
    REFERENCES Person 
    ( 
     Id 
    ) 
    ON DELETE NO ACTION 
    ON UPDATE NO ACTION 
GO
