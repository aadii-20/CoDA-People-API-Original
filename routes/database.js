// routes/StudentRoutes.js
const express = require('express');
const { getStudents, createStudent, updateStudent, deleteStudent} = require('../controllers/database');

const router = express.Router();


router.route('/students')
    .get(getStudents)
    .post(createStudent);

router.route('/students/:id')
    .put(updateStudent)
    .delete(deleteStudent)

module.exports = router;
