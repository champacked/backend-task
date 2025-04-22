import mongoose, { Schema, Document } from "mongoose";

export interface IRegistration extends Document {
  employee_name: string;
  email: string;
  course_id: string;
  registration_id: string;
  status: string;
  is_allotted?: boolean;
}

const RegistrationSchema: Schema = new Schema({
  employee_name: { type: String, required: true },
  email: { type: String, required: true },
  course_id: { type: String, required: true },
  registration_id: { type: String, required: true, unique: true },
  status: { type: String, default: "ACCEPTED" },
  is_allotted: { type: Boolean, default: false },
});

export default mongoose.model<IRegistration>(
  "Registration",
  RegistrationSchema
);
