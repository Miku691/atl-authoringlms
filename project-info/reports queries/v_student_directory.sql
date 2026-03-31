CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_student_directory` AS
select
    `s`.`id` AS `student_id`,
    `s`.`tenant_id` AS `tenant_id`,
    `s`.`admission_no` AS `admission_no`,
    `s`.`first_name` AS `first_name`,
    `s`.`last_name` AS `last_name`,
    `s`.`email` AS `email`,
    `s`.`phone` AS `phone`,
    `s`.`gender` AS `gender`,
    `s`.`status` AS `student_status`,
    `e`.`id` AS `enrollment_id`,
    `e`.`roll_no` AS `roll_no`,
    `e`.`academic_year` AS `academic_year`,
    `o`.`id` AS `offering_id`,
    `o`.`name` AS `offering_name`,
    `o`.`type` AS `offering_type`
from
    ((`ims-student-db`.`ims_students` `s`
join `ims-student-db`.`ims_student_enrollments` `e` on
    (((`s`.`id` = `e`.`student_id`) and (`s`.`tenant_id` = `e`.`tenant_id`))))
join `ims-academic-db`.`ims_offerings` `o` on
    (((`e`.`offering_id` = `o`.`id`) and (`e`.`tenant_id` = `o`.`tenant_id`))))
where
    ((`s`.`is_deleted` = false)
        and (`e`.`is_deleted` = false));