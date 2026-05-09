const fs = require('fs');

let content = fs.readFileSync('d:\\ATL\\atl-web-ui\\src\\pages\\dashboard\\admin\\academics\\views\\CoachingStructureView.tsx', 'utf-8');

// Replace components and names
content = content.replace(/SchoolStructureView/g, 'CoachingStructureView');
content = content.replace(/Class Name/g, 'Course Name');
content = content.replace(/Class Capacity/g, 'Batch Cap');
content = content.replace(/Add Class/g, 'Add Course');
content = content.replace(/Edit Class/g, 'Edit Course');
content = content.replace(/Delete Class/g, 'Delete Course');
content = content.replace(/Manage your classes and sections\./g, 'Manage your courses and batches.');
content = content.replace(/Sections/g, 'Batches');
content = content.replace(/Section Name/g, 'Batch Name');
content = content.replace(/Add Section/g, 'Add Batch');
content = content.replace(/Edit Section/g, 'Edit Batch');
content = content.replace(/Delete Section/g, 'Delete Batch');
content = content.replace(/Section Cap/g, 'Batch Cap');
content = content.replace(/No classes found/g, 'No courses found');

// Replace variable names and endpoints
content = content.replace(/classes,/g, 'courses,');
content = content.replace(/setClasses/g, 'setCourses');
content = content.replace(/classRes/g, 'courseRes');
content = content.replace(/classes\./g, 'courses.');
content = content.replace(/classes /g, 'courses ');
content = content.replace(/classId/g, 'courseId');
content = content.replace(/className/g, 'courseName');

content = content.replace(/sections,/g, '');
content = content.replace(/setSections/g, '');
content = content.replace(/secRes/g, '');
content = content.replace(/sections\./g, 'offerings.');

content = content.replace(/ImsClass/g, 'ImsCourse');
content = content.replace(/ImsSection/g, 'ImsBatch');
content = content.replace(/SCHOOL_CLASS/g, 'COACHING_BATCH');

content = content.replace(/\/ims-academic-service\/classes/g, '/ims-academic-service/courses');

fs.writeFileSync('d:\\ATL\\atl-web-ui\\src\\pages\\dashboard\\admin\\academics\\views\\CoachingStructureView.tsx', content);

console.log('Coaching view refactored');
