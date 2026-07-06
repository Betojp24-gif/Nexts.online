# Firestore Security Specification - Next.ar

## Data Invariants
1. **Enrollments**: A user can only create an enrollment for themselves. An enrollment must reference a valid course.
2. **Users**: Users can only create their own profiles. Only admins can change roles to 'admin' or 'instructor'.
3. **Courses**: Only admins or instructors can create/edit courses.
4. **Q&A**: Any signed-in user can ask a question. Only admins or instructors can answer.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Theft (Enrollment)**: Attempt to create an enrollment for `userB` while logged in as `userA`.
   - Expected: `PERMISSION_DENIED`
2. **Price Manipulation**: Attempt to create an enrollment with a negative `amount`.
   - Expected: `PERMISSION_DENIED`
3. **Ghost Field Injection**: Adding `isVerified: true` to a student profile.
   - Expected: `PERMISSION_DENIED`
4. **Role Escalation**: Student attempting to update their role to `admin`.
   - Expected: `PERMISSION_DENIED`
5. **Orphaned Enrollment**: Creating enrollment for a non-existent `courseId`.
   - Expected: `PERMISSION_DENIED` (via `exists()`)
6. **Path Poisoning**: Enrollment with document ID `../../../etc/passwd`.
   - Expected: `PERMISSION_DENIED`
7. **Resource Exhaustion**: Sending a 1MB string in `userName`.
   - Expected: `PERMISSION_DENIED`
8. **Unauthorized Answer**: Student attempting to answer a question.
   - Expected: `PERMISSION_DENIED`
9. **Blanket Read (PII)**: Unauthorized user attempting to list all user profiles.
   - Expected: `PERMISSION_DENIED`
10. **Terminal State Leap**: Direct update of enrollment status to `completed` by a student without finishing requirements (if logic enforced).
    - Expected: `PERMISSION_DENIED`
11. **Spoofed Email**: Using an unverified email to access admin-only data.
    - Expected: `PERMISSION_DENIED`
12. **Shadow Field (Course)**: Adding `featured: true` to a course if not in schema.
    - Expected: `PERMISSION_DENIED`
