import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { documentService } from "../appwrite/config";
import TextEditor from "../components/editor/TextEditor";
import VersionHistory from "../components/editor/VersionHistory";
import { ArrowLeft, Users, Loader2, AlertCircle } from "lucide-react";

const DocumentPage = () => {
  const { documentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Document state
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState("");

  // Version history state
  const [viewingVersion, setViewingVersion] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState(true);

  // Real-time subscription
  const [realtimeUnsubscribe, setRealtimeUnsubscribe] = useState(null);

  // Load document on mount
  useEffect(() => {
    if (documentId && user) {
      loadDocument();
    }
  }, [documentId, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (documentId && user && !viewingVersion) {
      const unsubscribe = documentService.subscribeToDocument(
        documentId,
        handleRealtimeUpdate
      );
      setRealtimeUnsubscribe(() => unsubscribe);

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [documentId, user, viewingVersion]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError("");
      const doc = await documentService.getDocument(documentId);
      setDocument(doc);
      setTitle(doc.title || "");
      setContent(doc.content || "");
      setLastSaved(doc.updatedAt);
    } catch (error) {
      console.error("Error loading document:", error);
      if (error.code === 404) {
        setError("Document not found");
      } else if (error.code === 401) {
        setError("You do not have permission to access this document");
      } else {
        setError("Failed to load document");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = (response) => {
    // Only update if we're not viewing a version
    if (!viewingVersion && response.payload) {
      const updatedDoc = response.payload;

      // Update document state
      setDocument(updatedDoc);
      setTitle(updatedDoc.title || "");
      setContent(updatedDoc.content || "");
      setLastSaved(updatedDoc.updatedAt);
    }
  };

  const handleSave = useCallback(async () => {
    if (!document || saving || viewingVersion) return;

    try {
      setSaving(true);
      const updatedDoc = await documentService.updateDocument(document.$id, {
        title: title || "Untitled Document",
        content,
      });

      setDocument(updatedDoc);
      setLastSaved(updatedDoc.updatedAt);
    } catch (error) {
      console.error("Error saving document:", error);
      setError("Failed to save document");
    } finally {
      setSaving(false);
    }
  }, [document, title, content, saving, viewingVersion]);

  const handleContentChange = (newContent) => {
    if (!viewingVersion) {
      setContent(newContent);
    }
  };

  const handleTitleChange = (newTitle) => {
    if (!viewingVersion) {
      setTitle(newTitle);
    }
  };

  const handleViewVersion = (version) => {
    setViewingVersion(version);
    setTitle(version.title || "");
    setContent(version.content || "");
  };

  const handleBackToCurrentVersion = () => {
    setViewingVersion(null);
    if (document) {
      setTitle(document.title || "");
      setContent(document.content || "");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </button>

            {viewingVersion && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-orange-600 font-medium">
                  Viewing Version from{" "}
                  {new Date(viewingVersion.timestamp).toLocaleString()}
                </span>
                <button
                  onClick={handleBackToCurrentVersion}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  Back to Current
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>1 collaborator online</span>
            </div>

            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {showVersionHistory ? "Hide" : "Show"} History
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex h-screen pt-16">
        {" "}
        {/* pt-16 to account for the top nav */}
        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          <TextEditor
            title={title}
            content={content}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
            onSave={handleSave}
            saving={saving}
            lastSaved={lastSaved}
          />
        </div>
        {/* Version History Sidebar */}
        {showVersionHistory && (
          <VersionHistory
            documentId={documentId}
            onViewVersion={handleViewVersion}
            currentVersion={document}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentPage;
