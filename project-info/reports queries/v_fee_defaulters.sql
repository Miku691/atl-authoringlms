CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_fee_defaulters` AS
select
    `fr`.`id` AS `fee_record_id`,
    `fr`.`tenant_id` AS `tenant_id`,
    `fr`.`academic_year` AS `academic_year`,
    `fr`.`offering_id` AS `offering_id`,
    `o`.`name` AS `offering_name`,
    `s`.`id` AS `student_id`,
    `s`.`admission_no` AS `admission_no`,
    `s`.`first_name` AS `first_name`,
    `s`.`last_name` AS `last_name`,
    `s`.`phone` AS `student_phone`,
    `fr`.`due_date` AS `due_date`,
    `fr`.`amount_due` AS `amount_due`,
    `fr`.`amount_paid` AS `amount_paid`,
    `fr`.`balance` AS `balance`,
    `fr`.`status` AS `fee_status`,
    `fr`.`late_fee_amount` AS `late_fee_amount`
from
    ((`ims-finance-db`.`student_fee_records` `fr`
join `ims-student-db`.`ims_students` `s` on
    (((`fr`.`student_id` = `s`.`id`) and (`fr`.`tenant_id` = `s`.`tenant_id`))))
join `ims-academic-db`.`ims_offerings` `o` on
    (((`fr`.`offering_id` = `o`.`id`) and (`fr`.`tenant_id` = `o`.`tenant_id`))))
where
    ((`fr`.`status` in ('UNPAID', 'PARTIAL'))
        and (`fr`.`due_date` < curdate()));