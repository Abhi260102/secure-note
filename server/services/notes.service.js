const Note = require('../models/note.model');

const createNote = async ({ userId, title, content }) => {
  const note = await Note.create({
    userId,
    title,
    content,
  });
  return note;
};

const getNotes = async ({ userId, page, limit, search }) => {
  const skip = (page - 1) * limit;

  const query = { userId };
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const totalNotes = await Note.countDocuments(query);
  const totalPages = Math.ceil(totalNotes / limit);

  const notes = await Note.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    notes,
    pagination: {
      total: totalNotes,
      page,
      limit,
      pages: totalPages || 1,
    },
  };
};

const deleteNote = async ({ noteId, userId }) => {
  const note = await Note.findById(noteId);

  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }

  if (note.userId.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this note');
    error.statusCode = 403;
    throw error;
  }

  await note.deleteOne();
  return true;
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
};
