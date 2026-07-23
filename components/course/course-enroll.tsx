import type { ComponentProps } from "react";
import type { courses } from "@/db/schema";
import type { CourseBookingView } from "@/lib/queries";
import { EnrollForm } from "@/components/enroll-form";
import { BookingPicker } from "@/components/booking-picker";

type Course = typeof courses.$inferSelect;

/** เลือกกล่องสมัคร/จองตามประเภทคอร์ส — booking → BookingPicker, อื่น → EnrollForm */
export function CourseEnroll({
  course,
  sessions,
  booking,
}: {
  course: Course;
  sessions: ComponentProps<typeof EnrollForm>["sessions"];
  booking: CourseBookingView | null;
}) {
  if (course.type === "booking" && booking) {
    return (
      <BookingPicker
        courseId={course.id}
        durationMin={booking.durationMin}
        days={booking.days}
      />
    );
  }
  return <EnrollForm courseId={course.id} type={course.type} sessions={sessions} />;
}
