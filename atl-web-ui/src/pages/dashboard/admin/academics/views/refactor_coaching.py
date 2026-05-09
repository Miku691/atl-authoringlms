import re

with open("d:\\ATL\\atl-web-ui\\src\\pages\\dashboard\\admin\\academics\\views\\CoachingStructureView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace components and names
content = content.replace("SchoolStructureView", "CoachingStructureView")
content = content.replace("Class Name", "Course Name")
content = content.replace("Class Capacity", "Batch Cap")
content = content.replace("Add Class", "Add Course")
content = content.replace("Edit Class", "Edit Course")
content = content.replace("Delete Class", "Delete Course")
content = content.replace("Manage your classes and sections.", "Manage your courses and batches.")
content = content.replace("Sections", "Batches")
content = content.replace("Section Name", "Batch Name")
content = content.replace("Add Section", "Add Batch")
content = content.replace("Edit Section", "Edit Batch")
content = content.replace("Delete Section", "Delete Batch")
content = content.replace("Section Cap", "Batch Cap")
content = content.replace("No classes found", "No courses found")

# Replace variable names and endpoints
content = content.replace("classes,", "courses,")
content = content.replace("setClasses", "setCourses")
content = content.replace("classRes", "courseRes")
content = content.replace("classes.", "courses.")
content = content.replace("classes ", "courses ")
content = content.replace("classId", "courseId")
content = content.replace("className", "courseName")

content = content.replace("sections,", "")
content = content.replace("setSections", "")
content = content.replace("secRes", "")
content = content.replace("sections.", "offerings.")

content = content.replace("ImsClass", "ImsCourse")
content = content.replace("ImsSection", "ImsBatch") # we won't use ImsSection but just rename to avoid issues
content = content.replace("SCHOOL_CLASS", "COACHING_BATCH")

content = content.replace("api.get(`/ims-academic-service/classes", "api.get(`/ims-academic-service/courses")
content = content.replace("api.post('/ims-academic-service/classes", "api.post('/ims-academic-service/courses")
content = content.replace("api.patch(`/ims-academic-service/classes", "api.patch(`/ims-academic-service/courses")
content = content.replace("api.delete(`/ims-academic-service/classes", "api.delete(`/ims-academic-service/courses")

with open("d:\\ATL\\atl-web-ui\\src\\pages\\dashboard\\admin\\academics\\views\\CoachingStructureView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Coaching view refactored")
