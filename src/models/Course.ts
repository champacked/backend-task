import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  course_name: string;
  instructor_name: string;
  start_date: string;
  min_employees: number;
  max_employees: number;
  course_id: string;
  is_allotted?: boolean;
}

const CourseSchema: Schema = new Schema({
  course_name: { type: String, required: true },
  instructor_name: { type: String, required: true },
  start_date: { type: String, required: true },
  min_employees: { type: Number, required: true },
  max_employees: { type: Number, required: true },
  course_id: { type: String, required: true, unique: true },
  is_allotted: { type: Boolean, default: false },
});

export default mongoose.model<ICourse>("Course", CourseSchema);
