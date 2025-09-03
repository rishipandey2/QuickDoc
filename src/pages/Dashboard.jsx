import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { documentService } from "../appwrite/config";
import { Plus, FileText, Calendar, Trash2, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      setError("");
      const userDocs = await documentService.getUserDocuments(user.$id);
      setDocuments(userDocs);
    } catch (error) {
      console.error("Error loading documents:", error);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const createNewDocument = async () => {
    setCreating(true);
    try {
      const newDoc = await documentService.createDocument(
        "Untitled Document",
        "",
        user.$id
      );
      navigate(`/document/${newDoc.$id}`);
    } catch (error) {
      console.error("Error creating document:", error);
      setError("Failed to create document");
    } finally {
      setCreating(false);
    }
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      setDocuments((docs) => docs.filter((doc) => doc.$id !== documentId));
    } catch (error) {
      console.error("Error deleting document:", error);
      setError("Failed to delete document");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Documents
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={createNewDocument}
              disabled={creating}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Document
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Documents Grid */}
        <div className="mt-8">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No documents
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first document.
              </p>
              <div className="mt-6">
                <button
                  onClick={createNewDocument}
                  disabled={creating}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  New Document
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div
                  key={doc.$id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 text-primary-600 flex-shrink-0" />
                        <div className="ml-3 flex-1 min-w-0">
                          <Link
                            to={`/document/${doc.$id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors truncate block"
                          >
                            {doc.title || "Untitled Document"}
                          </Link>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDocument(doc.$id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {doc.content
                          ? doc.content
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 100) + "..."
                          : "No content yet..."}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Updated {formatDate(doc.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
