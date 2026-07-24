import type { ComponentProps } from "react";
import type { courses } from "@/db/schema";
import type { CourseBookingView } from "@/lib/queries";
import { EnrollForm } from "@/components/enroll-form";
import { BookingPicker } from "@/components/booking-picker";

type Course = typeof courses.$inferSelect;

/** เลือกกล่องสมัคร/จองตามประเภทคอร์ส — live → BookingPicker, self_paced → EnrollForm */
export function CourseEnroll({
  course,
  booking,
}: {
  course: Course;
  booking: CourseBookingView | null;
}) {
  if (course.type === "live" && booking) {
    return (
      <BookingPicker
        courseId={course.id}
        durationMin={booking.durationMin}
        days={booking.days}
      />
    );
  }
  return <EnrollForm courseId={course.id} />;
}
