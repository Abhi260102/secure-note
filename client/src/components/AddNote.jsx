import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Lock, Loader2, Plus } from 'lucide-react';
import { addNote } from '../features/notes/notesSlice';
import { ternaryHelper, andHelper } from '../utils/helpers';

const AddNote = ({ onSuccess, setToast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch();
  const noteCreatorRef = useRef(null);

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

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
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
      } else if (getWordCount(value) > 1000) {
        errorMsg = 'Content cannot exceed 1000 words';
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
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setToast({ message: action.payload || 'Failed to save note', type: 'error' });
      }
    });
  };

  return (
    <section className="flex flex-col items-center gap-4" ref={noteCreatorRef}>
      <form
        onSubmit={handleAddNote}
        className={`w-full max-w-xl rounded-2xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 note-creator-glow transition-all duration-300 ${ternaryHelper(isExpanded, 'p-5', 'px-4 py-2 flex items-center gap-3')}`}
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
              {andHelper(validationErrors?.title, (
                <p className="text-[11px] text-rose-500 font-semibold">{validationErrors?.title}</p>
              ))}
            </div>

            <div>
              <textarea
                placeholder="Take a note securely..."
                value={content}
                onChange={handleContentChange}
                rows={4}
                className="w-full text-sm bg-transparent border-none outline-none resize-none placeholder-slate-400 text-slate-800 dark:text-slate-200"
              />
              {andHelper(validationErrors?.content, (
                <p className="text-[11px] text-rose-500 font-semibold">{validationErrors?.content}</p>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-primary-500" /> End-to-End Encrypted
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full select-none ${getWordCount(content) > 1000
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                    : getWordCount(content) > 850
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                >
                  {getWordCount(content)}/1000 words
                </span>
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
  );
};

export default AddNote;
