/* WUSOOL — وصول
   Read-only queries for the existing SQL Server database.
   Open in SQL Server Management Studio (SSMS), connect to DESKTOP-D59CRII,
   and run the desired section. No schema or business data is modified.
*/
USE [Wusool_Dev];
GO

-- 1. Database and physical schema counts (views are counted separately).
SELECT DB_NAME() AS DatabaseName,
       (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) AS PhysicalTables,
       (SELECT COUNT(*) FROM sys.columns c JOIN sys.tables t ON t.object_id = c.object_id
        WHERE t.is_ms_shipped = 0) AS PhysicalTableColumns,
       (SELECT COUNT(*) FROM sys.foreign_keys) AS ForeignKeyRelationships,
       (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped = 0) AS Views;
GO

-- 2. All physical tables and their column counts.
SELECT s.name AS SchemaName, t.name AS TableName, COUNT(c.column_id) AS ColumnCount
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.columns c ON c.object_id = t.object_id
WHERE t.is_ms_shipped = 0
GROUP BY s.name, t.name
ORDER BY s.name, t.name;
GO

-- 3. Change this name to inspect one table; use NULL to inspect all tables.
DECLARE @TableName sysname = N'Bookings';
SELECT s.name AS SchemaName, t.name AS TableName, c.column_id AS ColumnPosition,
       c.name AS ColumnName,
       ty.name + CASE
         WHEN ty.name IN ('nvarchar','nchar') THEN '(' + CASE WHEN c.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), c.max_length / 2) END + ')'
         WHEN ty.name IN ('varchar','char','varbinary','binary') THEN '(' + CASE WHEN c.max_length = -1 THEN 'max' ELSE CONVERT(varchar(10), c.max_length) END + ')'
         WHEN ty.name IN ('decimal','numeric') THEN '(' + CONVERT(varchar(10),c.precision) + ',' + CONVERT(varchar(10),c.scale) + ')'
         WHEN ty.name IN ('datetime2','datetimeoffset','time') THEN '(' + CONVERT(varchar(10),c.scale) + ')'
         ELSE '' END AS DataType,
       c.is_nullable AS AllowsNull, c.is_identity AS IsIdentity,
       CONVERT(bit, CASE WHEN EXISTS (
         SELECT 1 FROM sys.indexes i JOIN sys.index_columns ic
           ON ic.object_id = i.object_id AND ic.index_id = i.index_id
         WHERE i.object_id = t.object_id AND i.is_primary_key = 1 AND ic.column_id = c.column_id
       ) THEN 1 ELSE 0 END) AS IsPrimaryKeyColumn,
       CONVERT(bit, CASE WHEN EXISTS (
         SELECT 1 FROM sys.foreign_key_columns fkc
         WHERE fkc.parent_object_id = t.object_id AND fkc.parent_column_id = c.column_id
       ) THEN 1 ELSE 0 END) AS IsForeignKeyColumn,
       dc.definition AS DefaultDefinition, cc.definition AS ComputedDefinition
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.columns c ON c.object_id = t.object_id
JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.object_id = c.default_object_id
LEFT JOIN sys.computed_columns cc ON cc.object_id = c.object_id AND cc.column_id = c.column_id
WHERE t.is_ms_shipped = 0 AND (@TableName IS NULL OR t.name = @TableName)
ORDER BY s.name, t.name, c.column_id;
GO

-- 4. All foreign-key column mappings. A composite FK has multiple rows.
SELECT fk.name AS ForeignKeyName,
       OBJECT_SCHEMA_NAME(fk.parent_object_id) AS ChildSchema,
       OBJECT_NAME(fk.parent_object_id) AS ChildTable, child.name AS ChildColumn,
       OBJECT_SCHEMA_NAME(fk.referenced_object_id) AS ParentSchema,
       OBJECT_NAME(fk.referenced_object_id) AS ParentTable, parent.name AS ParentColumn,
       fkc.constraint_column_id AS MappingPosition,
       fk.delete_referential_action_desc AS OnDelete,
       fk.update_referential_action_desc AS OnUpdate,
       fk.is_disabled AS IsDisabled, fk.is_not_trusted AS IsNotTrusted
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns child ON child.object_id = fkc.parent_object_id AND child.column_id = fkc.parent_column_id
JOIN sys.columns parent ON parent.object_id = fkc.referenced_object_id AND parent.column_id = fkc.referenced_column_id
ORDER BY ChildSchema, ChildTable, ForeignKeyName, MappingPosition;
GO

-- 5. Primary keys, unique constraints and indexes, with full column order.
SELECT s.name AS SchemaName, t.name AS TableName, i.name AS IndexName,
       i.type_desc AS IndexType, i.is_primary_key AS IsPrimaryKey,
       i.is_unique AS IsUnique, i.is_unique_constraint AS IsUniqueConstraint,
       c.name AS ColumnName, ic.key_ordinal AS KeyPosition,
       ic.is_descending_key AS IsDescending, ic.is_included_column AS IsIncluded,
       i.filter_definition AS FilterDefinition
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.indexes i ON i.object_id = t.object_id AND i.index_id > 0
JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE t.is_ms_shipped = 0
ORDER BY s.name, t.name, i.name, ic.is_included_column, ic.key_ordinal, ic.index_column_id;
GO

-- 6. Actual CHECK constraints and their trust/enabled state.
SELECT OBJECT_SCHEMA_NAME(parent_object_id) AS SchemaName,
       OBJECT_NAME(parent_object_id) AS TableName,
       name AS ConstraintName, definition, is_disabled, is_not_trusted
FROM sys.check_constraints
ORDER BY SchemaName, TableName, ConstraintName;
GO

-- 7. Compatibility views: these are NOT physical tables.
SELECT s.name AS SchemaName, v.name AS ViewName, m.definition AS ViewDefinition
FROM sys.views v
JOIN sys.schemas s ON s.schema_id = v.schema_id
JOIN sys.sql_modules m ON m.object_id = v.object_id
WHERE v.is_ms_shipped = 0
ORDER BY s.name, v.name;
GO

-- 8. Applied EF Core migrations.
SELECT MigrationId, ProductVersion
FROM dbo.__EFMigrationsHistory
ORDER BY MigrationId;
GO
