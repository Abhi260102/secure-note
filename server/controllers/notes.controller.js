const notesService = require('../services/notes.service');
const { sendSuccess } = require('../helpers/response.helper');

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = await notesService.createNote({
      userId: req.user.id,
      title,
      content,
    });
    return sendSuccess(res, 201, 'Note created successfully', note);
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const search = req.query.search || '';

    const result = await notesService.getNotes({
      userId: req.user.id,
      page,
      limit,
      search,
    });
    return sendSuccess(res, 200, null, result);
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    await notesService.deleteNote({
      noteId,
      userId: req.user.id,
    });
    return sendSuccess(res, 200, 'Note deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
};
