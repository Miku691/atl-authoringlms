CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `ims-reports-db`.`v_student_attendance_summary` AS
select
    `ar`.`tenant_id` AS `tenant_id`,
    `ar`.`student_id` AS `student_id`,
    count(`ar`.`id`) AS `total_attendance_recorded`,
    sum((case when (`ar`.`status` = 'PRESENT') then 1 else 0 end)) AS `present_count`,
    sum((case when (`ar`.`status` = 'ABSENT') then 1 else 0 end)) AS `absent_count`,
    sum((case when (`ar`.`status` = 'LATE') then 1 else 0 end)) AS `late_count`,
    round(((sum((case when (`ar`.`status` = 'PRESENT') then 1 else 0 end)) / count(`ar`.`id`)) * 100), 2) AS `attendance_percentage`
from
    `ims-academic-db`.`ims_attendance_records` `ar`
where
    (`ar`.`person_type` = 'STUDENT')
group by
    `ar`.`tenant_id`,
    `ar`.`student_id`;