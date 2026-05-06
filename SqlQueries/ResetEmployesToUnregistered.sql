-- Script resets seeded employees back to unregistered
UPDATE dbo.Employees
SET 
    IsRegistered = 0,
    RegisteredUserId = NULL,
    RegisteredAt = NULL,
    UpdatedAt = SYSDATETIME()
WHERE Email IN (
    'ava.admin@wonderland.local',
    'mila.manager@wonderland.local'
);