import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRequest, postRequest, deleteRequest } from '../../api/api';
import { encryptNoteContent, decryptNoteContent } from '../../utils/crypto';

const initialState = {
  notes: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  },
  isLoading: false,
  isError: false,
  errorMessage: '',
};




export const fetchNotes = createAsyncThunk(
  'notes/fetchAll',
  async ({ page = 1, search = '', limit = 12 }, thunkAPI) => {
    try {
      const data = await getRequest(`/notes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      
      if (data.success) {
        
        const decryptedNotes = data.data.notes.map((note) => ({
          ...note,
          content: decryptNoteContent(note.content),
        }));

        return {
          notes: decryptedNotes,
          pagination: data.data.pagination,
        };
      }
      return thunkAPI.rejectWithValue(data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notes';
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const addNote = createAsyncThunk(
  'notes/add',
  async ({ title, content }, thunkAPI) => {
    try {
      
      const encryptedContent = encryptNoteContent(content);

      const data = await postRequest('/notes', {
        title,
        content: encryptedContent,
      });

      if (data.success) {
        
        const decryptedNote = {
          ...data.data,
          content: decryptNoteContent(data.data.content),
        };
        return decryptedNote;
      }
      return thunkAPI.rejectWithValue(data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add note';
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (noteId, thunkAPI) => {
    try {
      const data = await deleteRequest(`/notes/${noteId}`);
      
      if (data.success) {
        return noteId;
      }
      return thunkAPI.rejectWithValue(data.message);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete note';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNotesError: (state) => {
      state.isError = false;
      state.errorMessage = '';
    },
    clearNotesState: (state) => {
      state.notes = [];
      state.pagination = { total: 0, page: 1, limit: 12, pages: 1 };
      state.isLoading = false;
      state.isError = false;
      state.errorMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload.notes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      
      .addCase(addNote.pending, (state) => {
        
        state.isError = false;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        
        state.notes = [action.payload, ...state.notes];
        state.pagination.total += 1;
      })
      .addCase(addNote.rejected, (state, action) => {
        state.isError = true;
        state.errorMessage = action.payload;
      })
      
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note._id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const { clearNotesError, clearNotesState } = notesSlice.actions;
export default notesSlice.reducer;
