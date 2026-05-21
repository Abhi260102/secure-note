const express = require('express');
const {
  createNote,
  getNotes,
  deleteNote,
} = require('../controllers/notes.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateNote } = require('../middleware/validators');

const router = express.Router();


router.use(protect);

router.route('/')
  .get(getNotes)
  .post(validateNote, createNote);

router.route('/:id')
  .delete(deleteNote);

module.exports = router;
