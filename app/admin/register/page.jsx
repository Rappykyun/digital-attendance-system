"use client";
import StudentRegistration from "@/components/StudentRegistration";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Register Student
          </h2>
          <p className="text-muted-foreground">
            Register a new student with face recognition
          </p>
        </div>
      </div>
      <StudentRegistration />
    </div>
  );
}
