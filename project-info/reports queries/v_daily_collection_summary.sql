CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_daily_collection_summary` AS
select
    `t`.`id` AS `transaction_id`,
    `t`.`tenant_id` AS `tenant_id`,
    `t`.`academic_year` AS `academic_year`,
    `t`.`offering_id` AS `offering_id`,
    `t`.`student_id` AS `student_id`,
    `s`.`first_name` AS `first_name`,
    `s`.`last_name` AS `last_name`,
    `s`.`admission_no` AS `admission_no`,
    `t`.`amount` AS `amount`,
    `t`.`payment_mode` AS `payment_mode`,
    `t`.`reference_number` AS `reference_number`,
    `t`.`transaction_date` AS `transaction_date`,
    `t`.`collected_by` AS `collected_by`,
    cast(`t`.`transaction_date` as date) AS `payment_date`
from
    (`ims-finance-db`.`transactions` `t`
left join `ims-student-db`.`ims_students` `s` on
    (((`t`.`student_id` = `s`.`id`) and (`t`.`tenant_id` = `s`.`tenant_id`))));