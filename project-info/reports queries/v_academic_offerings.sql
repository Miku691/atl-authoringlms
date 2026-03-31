CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_academic_offerings` AS
select
    `o`.`id` AS `offering_id`,
    `o`.`tenant_id` AS `tenant_id`,
    `o`.`name` AS `offering_name`,
    `o`.`type` AS `offering_type`,
    `o`.`capacity` AS `capacity`,
    `o`.`start_date` AS `start_date`,
    `o`.`end_date` AS `end_date`,
    `p`.`id` AS `program_id`,
    `p`.`code` AS `program_code`,
    `p`.`title` AS `program_title`,
    `p`.`level` AS `program_level`
from
    ((`ims-academic-db`.`ims_offerings` `o`
left join `ims-academic-db`.`ims_academic_sessions` `s` on
    ((`o`.`session_id` = `s`.`id`)))
left join `ims-academic-db`.`ims_programs` `p` on
    ((`s`.`program_id` = `p`.`id`)));