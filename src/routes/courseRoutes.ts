import express from "express";
import { Request, Response } from "express";

import Course from "../models/Course";
import Registration from "../models/Registration";

const router = express.Router();

// Add course offering
router.post(
  "/add/courseOffering",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        course_name,
        instructor_name,
        start_date,
        min_employees,
        max_employees,
      } = req.body;

      //validating the min and max employees
      if (min_employees > max_employees) {
        return res.status(400).json({
          message:
            "Minimum number of employees cannot be more than the maximum number of employees",
        });
      }
      //date format in DDMMYYYY
      const dateRegex = /^\d{2}\d{2}\d{4}$/;
      if (!dateRegex.test(start_date)) {
        return res.status(400).json({
          message: "Invalid date format. Please use 'ddmmyyyy'.",
        });
      }

      const course_id = `OFFERING-${course_name}-${instructor_name}`;
      const existingCourse = await Course.findOne({ course_id });
      if (existingCourse) {
        return res.status(400).json({
          message: "Course already exists",
        });
      }

      const course = new Course({
        course_name,
        instructor_name,
        start_date,
        min_employees,
        max_employees,
        course_id,
      });

      await course.save();

      res.json({
        status: 200,
        message: "course added successfully",
        data: {
          success: {
            course_id,
          },
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: 500, message: "Error adding course", error });
    }
  }
);

//registration for the course
router.post(
  "/add/register/:course_id",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { course_id } = req.params;
      const { employee_name, email } = req.body;
      const registration_id = `${employee_name}-${course_id}`;

      // ✅ Check if the email format is valid
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format.",
        });
      }

      // ✅ Check if the employee is already registered for the same course
      const existingRegistration = await Registration.findOne({
        employee_name,
        course_id,
      });
      if (existingRegistration) {
        return res.status(400).json({
          message: `Employee ${employee_name} is already registered for the course ${course_id}`,
        });
      }

      // ✅ Get course details to check if it has space for more employees
      const course = await Course.findOne({ course_id });
      if (!course) {
        return res.status(404).json({
          message: `Course ${course_id} not found.`,
        });
      }

      // Check the number of current registrations for the course
      const currentRegistrations = await Registration.countDocuments({
        course_id,
      });

      // ✅ Check if the course is full
      if (currentRegistrations >= course.max_employees) {
        return res.status(400).json({
          message: `The course ${course_id} is full. No more registrations allowed.`,
        });
      }

      // Proceed with registration if space is available
      const registration = new Registration({
        employee_name,
        email,
        course_id,
        registration_id,
        status: "ACCEPTED",
      });

      await registration.save();

      res.json({
        status: 200,
        message: `Successfully registered for ${course_id}`,
        data: {
          success: {
            registration_id,
            status: "ACCEPTED",
          },
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: 500, message: "Error registering for course", error });
    }
  }
);

// Cancel registration
router.delete(
  "/cancel/:registration_id",
  async (req: Request, res: Response) => {
    try {
      const { registration_id } = req.params;
      const registration = await Registration.findOne({ registration_id });

      if (!registration) {
        res
          .status(404)
          .json({ status: 404, message: "Registration not found" });
        return;
      }

      if (!registration.is_allotted) {
        registration.status = "CANCEL_ACCEPTED";
        await registration.save();

        res.json({
          status: 200,
          message: "Cancel registration successful",
          data: {
            success: {
              registration_id,
              course_id: registration.course_id,
              status: "CANCEL_ACCEPTED",
            },
          },
        });
      } else {
        registration.status = "CANCEL_REJECTED";
        await registration.save();

        res.json({
          status: 200,
          message: "Cancel registration unsuccessful",
          data: {
            success: {
              registration_id,
              course_id: registration.course_id,
              status: "CANCEL_REJECTED",
            },
          },
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ status: 500, message: "Error canceling registration", error });
    }
  }
);

// Course allotment
router.post("/allot/:course_id", async (req: Request, res: Response) => {
  try {
    const { course_id } = req.params;

    const course = await Course.findOne({ course_id });
    if (!course) {
      res.status(404).json({ status: 404, message: "Course not found" });
      return;
    }

    const registrations = await Registration.find({
      course_id,
      status: "ACCEPTED",
    });

    course.is_allotted = true;
    await course.save();

    const allottedRegistrations = registrations.map((reg) => ({
      registration_id: reg.registration_id,
      email: reg.email,
      course_name: course.course_name,
      course_id: reg.course_id,
      status: reg.status,
    }));

    res.json({
      status: 200,
      message: "successfully allotted course to registered employees",
      data: {
        success: allottedRegistrations,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error allotting course",
      error,
    });
  }
});

export default router;
