import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Trash2, Lock, FolderOpen } from 'lucide-react';
import { fetchNotes, deleteNote } from '../features/notes/notesSlice';
import { logout, localLogout } from '../features/auth/authSlice';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Header from '../components/Header';
import AddNote from '../components/AddNote';
import { andHelper, orHelper, ternaryHelper } from '../utils/helpers';
import { useSearch } from '../hooks/useSearch';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { search, setSearch, debouncedSearch } = useSearch('', 400, () => {
    setCurrentPage(1);
  });
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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { notes, pagination, isLoading } = useSelector(
    (state) => state.notes
  );

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
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
      <Header
        search={search}
        setSearch={setSearch}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <AddNote
          onSuccess={() => {
            dispatch(fetchNotes({ page: currentPage, search: debouncedSearch, limit: itemsPerPage }));
          }}
          setToast={setToast}
        />

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
                {ternaryHelper(
                  debouncedSearch,
                  "We couldn't find any note matching that title. Try searching for something else.",
                  'Start by writing your first secure note using the creator panel above.'
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {notes.map((note) => (
                  <article
                    key={note?._id}
                    className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/60 hover:border-primary-400/50 dark:hover:border-primary-800/50 group flex flex-col justify-between h-48 relative overflow-hidden transition-all duration-300"
                  >
                    {(() => {
                      const isLengthy = note?.content?.length > 150;
                      const previewText = note?.content?.replace(/\s+/g, ' ');
                      const truncatedText = isLengthy ? previewText.substring(0, 147) : previewText;
                      return (
                        <div
                          className="space-y-2 flex-1 cursor-pointer group/content select-none"
                          onClick={() => setSelectedNote(note)}
                          title={isLengthy ? 'Click to view full note' : 'Click to view'}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 break-words group-hover/content:text-primary-600 dark:group-hover/content:text-primary-400 transition-colors">
                              {note?.title}
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
                        {new Date(note?.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <button
                        onClick={() => handleDeleteNote(note?._id)}
                        className="p-1.5 rounded-lg text-slate-450 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-slate-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <Pagination
                pages={pagination?.pages}
                currentPage={currentPage}
                total={pagination?.total}
                limit={itemsPerPage}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </>
          )}
        </section>
      </main>

      <Modal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        title={orHelper(selectedNote?.title, '')}
        content={orHelper(selectedNote?.content, '')}
        date={selectedNote?.createdAt}
      />

      <ConfirmationModal
        isOpen={confirmModal?.isOpen}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        confirmText={confirmModal?.confirmText}
        type={confirmModal?.type}
      />

      {andHelper(toast, (
        <Toast
          message={toast?.message}
          type={toast?.type}
          onClose={() => setToast(null)}
        />
      ))}
    </div>
  );
};

export default Dashboard;
