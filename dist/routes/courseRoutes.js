"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Course_1 = __importDefault(require("../models/Course"));
const Registration_1 = __importDefault(require("../models/Registration"));
const router = express_1.default.Router();
// Add course offering
router.post("/add/courseOffering", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { course_name, instructor_name, start_date, min_employees, max_employees, } = req.body;
        const course_id = `OFFERING-${course_name}-${instructor_name}`;
        const course = new Course_1.default({
            course_name,
            instructor_name,
            start_date,
            min_employees,
            max_employees,
            course_id,
        });
        yield course.save();
        res.json({
            status: 200,
            message: "course added successfully",
            data: {
                success: {
                    course_id,
                },
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: 500, message: "Error adding course", error });
    }
}));
// Register for course
router.post("/add/register/:course_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { course_id } = req.params;
        const { employee_name, email } = req.body;
        const registration_id = `${employee_name}-${course_id}`;
        const registration = new Registration_1.default({
            employee_name,
            email,
            course_id,
            registration_id,
            status: "ACCEPTED",
        });
        yield registration.save();
        res.json({
            status: 200,
            message: `successfully registered for ${course_id}`,
            data: {
                success: {
                    registration_id,
                    status: "ACCEPTED",
                },
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: 500, message: "Error registering for course", error });
    }
}));
// Cancel registration
router.delete("/cancel/:registration_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { registration_id } = req.params;
        const registration = yield Registration_1.default.findOne({ registration_id });
        if (!registration) {
            res
                .status(404)
                .json({ status: 404, message: "Registration not found" });
            return;
        }
        registration.status = "CANCEL_REJECTED";
        yield registration.save();
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
    catch (error) {
        res
            .status(500)
            .json({ status: 500, message: "Error canceling registration", error });
    }
}));
// Course allotment
router.get("/allot/:course_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { course_id } = req.params;
        const registrations = yield Registration_1.default.find({
            course_id,
            status: "ACCEPTED",
        });
        const course = yield Course_1.default.findOne({ course_id });
        if (!course) {
            res.status(404).json({ status: 404, message: "Course not found" });
        }
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
    }
    catch (error) {
        res
            .status(500)
            .json({ status: 500, message: "Error allotting course", error });
    }
}));
exports.default = router;
