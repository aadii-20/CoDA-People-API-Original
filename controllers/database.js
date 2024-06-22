const student = require("../models/database");

const getStudents = async (req, res) => {
    const pipeline = [
        {
            $group: {
                _id: "$enrolledCourse",
                students: {
                    $push: {
                        studentId: "$_id",
                        name: "$name",
                        specialisation: "$specialisation",
                        enrollmentYear: "$enrollmentYear",
                        areaOfInterest: "$areaOfInterest",
                        currentStatus: "$currentStatus",
                        ...(req.query.enrolledCourse === 'B.Tech' ? {} : {
                            urlToImage: "$urlToImage",
                            overview: "$overview",
                            researches: "$researches",
                            contactInformation: {
                                email: "$contactInformation.email",
                                googleScholarLink: "$contactInformation.googleScholarLink",
                                orcidLink: "$contactInformation.orcidLink",
                                linkedLink: "$contactInformation.linkedLink",
                                clickForMore: "$contactInformation.clickForMore"
                            }
                        })
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                enrolledCourse: "$_id",
                students: 1
            }
        }
    ];

    try {
        const students = await student.aggregate(pipeline).exec();
        // Reshape the data into the desired format
        const result = students.reduce((acc, { enrolledCourse, students }) => {
            //console.log(students,"asdf")
            acc[enrolledCourse] = students;
            return acc;
        }, {});

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createStudent = async (req, res) => {
    const {
        name,
        enrolledCourse,
        specialisation,
        enrollmentYear,
        areaOfInterest,
        currentStatus,
        urlToImage,
        overview,
        researches,
        contactInformation
    } = req.body;

    const newstudent = new student({
        name,
        enrolledCourse,
        specialisation,
        enrollmentYear,
        areaOfInterest,
        currentStatus: enrolledCourse == 'B.Tech' ? currentStatus : undefined,
        urlToImage: enrolledCourse !== 'B.Tech' ? urlToImage : undefined,
        overview: enrolledCourse !== 'B.Tech' ? overview : undefined,
        researches: enrolledCourse !== 'B.Tech' ? researches : undefined,
        contactInformation: enrolledCourse !== 'B.Tech' ? contactInformation : undefined
    });

    try {
        await newstudent.save();
        res.status(201).json(newstudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        enrolledCourse,
        specialisation,
        enrollmentYear,
        areaOfInterest,
        currentStatus,
        urlToImage,
        overview,
        researches,
        contactInformation
    } = req.body;

    try {
        const Student = await student.findById(id);
        if (!Student) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fieldS
        Student.name = name || Student.name;
        Student.enrolledCourse = enrolledCourse || Student.enrolledCourse;
        Student.specialisation = specialisation || Student.specialisation;
        Student.enrollmentYear = enrollmentYear || Student.enrollmentYear;
        Student.areaOfInterest = areaOfInterest || Student.areaOfInterest;
        Student.currentStatus = currentStatus || Student.currentStatus;
        Student.urlToImage = enrolledCourse !== 'B.Tech' ? (urlToImage || Student.urlToImage) : undefined;
        Student.overview = enrolledCourse !== 'B.Tech' ? (overview || Student.overview) : undefined;
        Student.researches = enrolledCourse !== 'B.Tech' ? (researches || Student.researches) : undefined;

        // Update contactInformation based on the enrolledCourse
        if (enrolledCourse !== 'B.Tech') {
            if (contactInformation) {
                Student.contactInformation = {
                    ...Student.contactInformation.toObject(), // Preserve existing subfields
                    ...contactInformation // Overwrite with new subfields
                };
            }
        } else {
            Student.contactInformation = undefined;
        }

        // Save the updated student document
        await Student.save();
        res.status(200).json(Student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        const Student = await student.findById(id);
        if (!Student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await Student.deleteOne();
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {getStudents, createStudent, updateStudent, deleteStudent};