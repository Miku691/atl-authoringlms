CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_student_guardian_contact` AS
select
    `s`.`id` AS `student_id`,
    `s`.`tenant_id` AS `tenant_id`,
    `s`.`admission_no` AS `admission_no`,
    `s`.`first_name` AS `first_name`,
    `s`.`last_name` AS `last_name`,
    `g`.`id` AS `guardian_id`,
    `g`.`name` AS `guardian_name`,
    `g`.`phone` AS `guardian_phone`,
    `g`.`email` AS `guardian_email`,
    `m`.`relation` AS `relation`,
    `m`.`is_primary` AS `is_primary`
from
    ((`ims-student-db`.`ims_students` `s`
join `ims-student-db`.`ims_student_guardian_mapping` `m` on
    (((`s`.`id` = `m`.`student_id`) and (`s`.`tenant_id` = `m`.`tenant_id`))))
join `ims-student-db`.`ims_guardians` `g` on
    (((`m`.`guardian_id` = `g`.`id`) and (`m`.`tenant_id` = `g`.`tenant_id`))))
where
    (`s`.`is_deleted` = false);