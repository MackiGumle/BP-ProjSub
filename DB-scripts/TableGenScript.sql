CREATE TABLE Assignment 
    (
     Id INTEGER NOT NULL IDENTITY(1,1) , 
     Type VARCHAR (25) , 
     Title VARCHAR (25) NOT NULL , 
     Description VARCHAR (500) , 
     DateAssigned DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
     DueDate DATETIME , 
     MaxPoints BIGINT , 
     Subject_Id INTEGER NOT NULL , 
     Person_Id INTEGER NOT NULL 
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
     Name VARCHAR (25) NOT NULL , 
     Surname VARCHAR (25) NOT NULL , 
     Email VARCHAR (254) NOT NULL , 
     Password VARCHAR (64) NOT NULL 
    )
GO

ALTER TABLE Person ADD CONSTRAINT Person_PK PRIMARY KEY CLUSTERED (Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE PersonSubject 
    (
     Person_Id INTEGER NOT NULL , 
     Subject_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE PersonSubject ADD CONSTRAINT PersonSubject_PK PRIMARY KEY CLUSTERED (Person_Id, Subject_Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Rating 
    (
     Time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
     Rating NUMERIC (28) NOT NULL , 
     Note VARCHAR (500) , 
     Submission_Id INTEGER NOT NULL , 
     Person_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Rating ADD CONSTRAINT Rating_PK PRIMARY KEY CLUSTERED (Time)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Subject 
    (
     Id INTEGER NOT NULL IDENTITY(1,1) , 
     Name VARCHAR (25) NOT NULL , 
     Description VARCHAR (25) , 
     Language VARCHAR (25) 
    )
GO

ALTER TABLE Subject ADD CONSTRAINT Subject_PK PRIMARY KEY CLUSTERED (Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

CREATE TABLE Submission 
    (
     Id INTEGER NOT NULL IDENTITY(1,1) , 
     SubmissionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
     FileName VARCHAR (25) NOT NULL , 
     FileData VARBINARY NOT NULL , 
     Assignment_Id INTEGER NOT NULL , 
     Person_Id INTEGER NOT NULL 
    )
GO

ALTER TABLE Submission ADD CONSTRAINT Submission_PK PRIMARY KEY CLUSTERED (Id)
     WITH (
     ALLOW_PAGE_LOCKS = ON , 
     ALLOW_ROW_LOCKS = ON )
GO

ALTER TABLE Assignment 
    ADD CONSTRAINT Assignment_Person_FK FOREIGN KEY 
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

ALTER TABLE PersonSubject 
    ADD CONSTRAINT PersonSubject_Person_FK FOREIGN KEY 
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

ALTER TABLE PersonSubject 
    ADD CONSTRAINT PersonSubject_Subject_FK FOREIGN KEY 
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

ALTER TABLE Rating 
    ADD CONSTRAINT Rating_Person_FK FOREIGN KEY 
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
    ADD CONSTRAINT Submission_Person_FK FOREIGN KEY 
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
