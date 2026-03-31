CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_expense_summary` AS
select
    `e`.`tenant_id` AS `tenant_id`,
    `e`.`academic_year` AS `academic_year`,
    `c`.`name` AS `category_name`,
    date_format(`e`.`expense_date`, '%Y-%m') AS `yearly_month`,
    count(`e`.`id`) AS `expense_count`,
    sum(`e`.`amount`) AS `total_amount`
from
    (`ims-finance-db`.`expenses` `e`
left join `ims-finance-db`.`expense_categories` `c` on
    ((`e`.`category_id` = `c`.`id`)))
group by
    `e`.`tenant_id`,
    `e`.`academic_year`,
    `c`.`name`,
    date_format(`e`.`expense_date`, '%Y-%m');