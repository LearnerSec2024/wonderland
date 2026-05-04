USE master;
GO

/*
  Copy this file to create-app-login.sql or create-app-login.local.sql
  and replace the placeholder password for your own local machine.

  Do not commit real local passwords to GitHub.
*/

IF NOT EXISTS (
    SELECT 1 FROM sys.sql_logins WHERE name = 'wonderland_app_user'
)
BEGIN
    CREATE LOGIN wonderland_app_user 
    WITH PASSWORD = 'REPLACE_WITH_LOCAL_PASSWORD',
    CHECK_POLICY = OFF;
END
GO

USE WonderlandDB;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.database_principals WHERE name = 'wonderland_app_user'
)
BEGIN
    CREATE USER wonderland_app_user FOR LOGIN wonderland_app_user;
END
GO

ALTER ROLE db_datareader ADD MEMBER wonderland_app_user;
ALTER ROLE db_datawriter ADD MEMBER wonderland_app_user;
GO

SELECT 'Wonderland app database login created successfully' AS Message;
GO
