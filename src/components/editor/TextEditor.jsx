import React, { useCallback, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Save, Loader2 } from "lucide-react";

const TextEditor = ({
  content,
  onContentChange,
  onSave,
  saving = false,
  lastSaved,
  title,
  onTitleChange,
}) => {
  const quillRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Auto-save functionality
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [onSave]);

  const handleContentChange = (value, delta, source, editor) => {
    // Only update if the change came from user input, not programmatic changes
    if (source === "user") {
      onContentChange(value);
      debouncedSave();
    }
  };

  const handleTitleChange = (e) => {
    onTitleChange(e.target.value);
    debouncedSave();
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onSave();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const formatLastSaved = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      // Less than 1 minute
      return "Just now";
    } else if (diff < 3600000) {
      // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link"],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "align",
    "blockquote",
    "code-block",
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header with title and save status */}
      <div className="border-b bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 flex-1 mr-4"
          />

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {saving ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Saving...
                </div>
              ) : lastSaved ? (
                `Saved ${formatLastSaved(lastSaved)}`
              ) : (
                "Not saved"
              )}
            </div>

            <button
              onClick={handleManualSave}
              disabled={saving}
              className="flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          style={{ height: "calc(100% - 42px)" }}
          placeholder="Start writing your document..."
        />
      </div>
    </div>
  );
};

export default TextEditor;
