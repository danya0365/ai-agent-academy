import type { Course } from "@/lib/courses";
import type { CourseBookingView } from "@/lib/queries";
import { BookingPicker } from "@/components/booking-picker";

/** กล่องจองเวลาเรียน (ทุกคอร์สเป็นการจองสด 1:1) */
export function CourseEnroll({
  course,
  booking,
}: {
  course: Course;
  booking: CourseBookingView | null;
}) {
  if (!booking) {
    return (
      <div className="card p-5">
        <h3 className="mb-2 font-extrabold text-foreground">จองเวลาเรียน</h3>
        <p className="text-sm text-muted">
          ยังไม่มีเวลาว่างให้จองในตอนนี้ กรุณากลับมาใหม่ภายหลัง
        </p>
      </div>
    );
  }
  return (
    <BookingPicker
      courseSlug={course.slug}
      durationMin={booking.durationMin}
      days={booking.days}
    />
  );
}
