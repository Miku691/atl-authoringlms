CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_budget_vs_actual` AS
select
    `b`.`tenant_id` AS `tenant_id`,
    `b`.`academic_year` AS `academic_year`,
    `c`.`name` AS `category_name`,
    `b`.`allocated_amount` AS `allocated_amount`,
    coalesce(sum(`e`.`amount`), 0) AS `spent_amount`,
    (`b`.`allocated_amount` - coalesce(sum(`e`.`amount`), 0)) AS `remaining_amount`,
    round(((coalesce(sum(`e`.`amount`), 0) / `b`.`allocated_amount`) * 100), 2) AS `utilization_percentage`
from
    ((`ims-finance-db`.`budgets` `b`
join `ims-finance-db`.`expense_categories` `c` on
    ((`b`.`category_id` = `c`.`id`)))
left join `ims-finance-db`.`expenses` `e` on
    (((`b`.`tenant_id` = `e`.`tenant_id`) and (`b`.`academic_year` = `e`.`academic_year`) and (`b`.`category_id` = `e`.`category_id`))))
group by
    `b`.`tenant_id`,
    `b`.`academic_year`,
    `c`.`name`,
    `b`.`allocated_amount`;