const Note = require('../models/note.model');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const note = await Note.create({
      userId: req.user.id,
      title,
      content, // stores encrypted string from frontend
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes of logged-in user (with pagination and title search)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Search query on title (since content is encrypted, server can't search it)
    const query = { userId: req.user.id };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const totalNotes = await Note.countDocuments(query);
    const totalPages = Math.ceil(totalNotes / limit);

    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          total: totalNotes,
          page,
          limit,
          pages: totalPages || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;

    // Find note
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Verify ownership
    if (note.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note',
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
};
