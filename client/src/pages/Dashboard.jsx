import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Search,
  Plus,
  Trash2,
  Lock,
  Sun,
  Moon,
  Loader2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { fetchNotes, addNote, deleteNote } from '../features/notes/notesSlice';
import { logout, localLogout } from '../features/auth/authSlice';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';

const Dashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState(null);


  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger',
    confirmText: 'Confirm',
  });


  const [selectedNote, setSelectedNote] = useState(null);


  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const noteCreatorRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { notes, pagination, isLoading, isError, errorMessage } = useSelector(
    (state) => state.notes
  );


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);


  useEffect(() => {
    if (user) {
      dispatch(fetchNotes({ page: currentPage, search: debouncedSearch, limit: itemsPerPage }));
    }
  }, [dispatch, currentPage, debouncedSearch, itemsPerPage, user]);


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);


  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(localLogout());
      setToast({ message: 'Session expired. Please log in again.', type: 'error' });
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [dispatch, navigate]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noteCreatorRef.current && !noteCreatorRef.current.contains(event.target)) {
        if (!title && !content) {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, content]);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sign Out',
      message: 'Are you sure you want to log out? You will need to enter your credentials again to access your secure decrypted notes.',
      confirmText: 'Log Out',
      type: 'warning',
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        dispatch(logout()).then(() => {
          navigate('/auth');
        });
      },
    });
  };


  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'title') {
      if (!value.trim()) {
        errorMsg = 'Title is required';
      } else if (value.length > 100) {
        errorMsg = 'Title cannot exceed 100 characters';
      }
    } else if (name === 'content') {
      if (!value.trim()) {
        errorMsg = 'Content is required';
      }
    }

    setValidationErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[name] = errorMsg;
      } else {
        delete next[name];
      }
      return next;
    });

    return !errorMsg;
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (val.length <= 120) {
      setTitle(val);
      if (isExpanded) {
        validateField('title', val);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    if (isExpanded) {
      validateField('content', val);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();

    const isTitleValid = validateField('title', title);
    const isContentValid = validateField('content', content);

    if (!isTitleValid || !isContentValid) {
      setToast({ message: 'Please correct the validation errors first.', type: 'error' });
      return;
    }

    setIsSaving(true);
    dispatch(addNote({
      title: title.trim(),
      content: content.trim(),
    })).then((action) => {
      setIsSaving(false);
      if (addNote.fulfilled.match(action)) {
        setTitle('');
        setContent('');
        setValidationErrors({});
        setIsExpanded(false);
        setToast({ message: 'Note saved securely!', type: 'success' });

        dispatch(fetchNotes({ page: currentPage, search: debouncedSearch, limit: itemsPerPage }));
      } else {
        setToast({ message: action.payload || 'Failed to save note', type: 'error' });
      }
    });
  };

  const handleDeleteNote = (noteId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Secure Note',
      message: 'Are you sure you want to delete this note? This action is permanent and the encrypted content cannot be recovered.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        dispatch(deleteNote(noteId)).then((action) => {
          if (deleteNote.fulfilled.match(action)) {
            setToast({ message: 'Note deleted successfully', type: 'info' });

            if (notes.length === 1 && currentPage > 1) {
              setCurrentPage(currentPage - 1);
            } else {
              dispatch(fetchNotes({ page: currentPage, search: debouncedSearch, limit: itemsPerPage }));
            }
          } else {
            setToast({ message: action.payload || 'Failed to delete note', type: 'error' });
          }
        });
      },
    });
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">

      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">


          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-500/25">
              <ShieldCheck className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
              SecureNotes
            </span>
          </div>


          <div className="flex-1 max-w-xl relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-800 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-primary-500/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>


          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/50 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>


            <div className="hidden md:flex flex-col items-end pr-2 text-right">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user?.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Encrypted Session</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="text-sm font-semibold hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">


        <section className="flex flex-col items-center gap-4" ref={noteCreatorRef}>
          <form
            onSubmit={handleAddNote}
            className={`w-full max-w-xl rounded-2xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 note-creator-glow transition-all duration-300 ${isExpanded ? 'p-5' : 'px-4 py-2 flex items-center gap-3'
              }`}
          >
            {isExpanded ? (
              <div className="space-y-4 w-full">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={handleTitleChange}
                      className="w-full font-bold text-base bg-transparent border-none outline-none placeholder-slate-400 text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full select-none ${title.length > 100
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                        : title.length > 80
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                    >
                      {title.length}/100
                    </span>
                  </div>
                  {validationErrors.title && (
                    <p className="text-[11px] text-rose-500 font-semibold">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <textarea
                    placeholder="Take a note securely..."
                    value={content}
                    onChange={handleContentChange}
                    rows={4}
                    className="w-full text-sm bg-transparent border-none outline-none resize-none placeholder-slate-400 text-slate-800 dark:text-slate-200"
                  />
                  {validationErrors.content && (
                    <p className="text-[11px] text-rose-500 font-semibold">{validationErrors.content}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-primary-500" /> End-to-End Encrypted
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTitle('');
                        setContent('');
                        setValidationErrors({});
                        setIsExpanded(false);
                      }}
                      className="px-4 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:hover:bg-primary-600 text-white text-xs font-semibold shadow-md shadow-primary-500/10 active:scale-[0.98] transition-all"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Take a note securely..."
                  onClick={() => setIsExpanded(true)}
                  className="w-full py-1 text-sm bg-transparent border-none outline-none placeholder-slate-400 cursor-pointer text-slate-900 dark:text-white"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-550 hover:text-primary-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </section>


        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3 gap-3">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary-500" />
              Your Notes
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400 font-semibold font-mono">
                {pagination.total}
              </span>
            </h2>


            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-450">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 outline-none text-slate-850 dark:text-slate-200 focus:ring-1 focus:ring-primary-500"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>
          </div>


          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(itemsPerPage || 6)].map((_, idx) => (
                <div key={idx} className="glass-card h-48 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/50 animate-pulse flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                    <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
                <FolderOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notes found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                {debouncedSearch
                  ? "We couldn't find any note matching that title. Try searching for something else."
                  : 'Start by writing your first secure note using the creator panel above.'}
              </p>
            </div>
          ) : (
            <>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {notes.map((note) => (
                  <article
                    key={note._id}
                    className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/60 hover:border-primary-400/50 dark:hover:border-primary-800/50 group flex flex-col justify-between h-48 relative overflow-hidden transition-all duration-300"
                  >
                    {(() => {
                      const isLengthy = note.content.length > 150;
                      // Replace duplicate whitespaces and linebreaks for note card preview layout
                      const previewText = note.content.replace(/\s+/g, ' ');
                      const truncatedText = isLengthy ? previewText.substring(0, 147) : previewText;
                      return (
                        <div
                          className="space-y-2 flex-1 cursor-pointer group/content select-none"
                          onClick={() => setSelectedNote(note)}
                          title={isLengthy ? 'Click to view full note' : 'Click to view'}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 break-words group-hover/content:text-primary-600 dark:group-hover/content:text-primary-400 transition-colors">
                              {note.title}
                            </h3>
                            <div className="text-slate-400 dark:text-slate-500 group-hover/content:text-primary-500 transition-colors flex-shrink-0" title="AES-256 Encrypted">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 break-words leading-relaxed font-sans font-light line-clamp-4">
                            {isLengthy ? (
                              <>
                                {truncatedText}
                                <span className="text-primary-600 dark:text-primary-400 font-bold ml-0.5 hover:underline">...</span>
                              </>
                            ) : (
                              truncatedText
                            )}
                          </p>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/50 dark:border-slate-800/50 mt-3">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-1.5 rounded-lg text-slate-450 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-slate-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>


              {pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-850 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>


                    {[...Array(pagination.pages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${currentPage === pageNum
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-850'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages || isLoading}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-850 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Showing notes {Math.min((currentPage - 1) * itemsPerPage + 1, pagination.total)} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total}
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </main>


      <Modal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={selectedNote?.title || ''}
        content={selectedNote?.content || ''}
        date={selectedNote?.createdAt}
      />


      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />


      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
