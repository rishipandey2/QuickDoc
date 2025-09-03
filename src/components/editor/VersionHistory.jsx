import React, { useState, useEffect } from "react";
import { versionService } from "../../appwrite/config";
import { Clock, User, Eye, Loader2, RefreshCw } from "lucide-react";

const VersionHistory = ({ documentId, onViewVersion, currentVersion }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (documentId) {
      loadVersions();
    }
  }, [documentId]);

  const loadVersions = async () => {
    try {
      setError("");
      setLoading(true);
      const documentVersions = await versionService.getDocumentVersions(
        documentId
      );
      setVersions(documentVersions);
    } catch (error) {
      console.error("Error loading versions:", error);
      setError("Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  const handleVersionClick = (version) => {
    setSelectedVersion(version.$id);
    onViewVersion(version);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreviewText = (content) => {
    // Strip HTML tags and get first 50 characters
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > 50
      ? plainText.substring(0, 50) + "..."
      : plainText;
  };

  const refreshVersions = () => {
    loadVersions();
  };

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Version History
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Version History
          </h3>
          <button
            onClick={refreshVersions}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh versions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {versions.length} version{versions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Current Version Banner */}
      <div className="p-4 bg-primary-50 border-b border-primary-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-primary-800">
            Current Version
          </span>
        </div>
        <p className="text-xs text-primary-600 mt-1">
          You're viewing the latest version
        </p>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto version-history">
        {versions.length === 0 ? (
          <div className="p-6 text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">No versions yet</p>
            <p className="text-xs text-gray-400">
              Versions will appear here as you edit the document
            </p>
          </div>
        ) : (
          <div className="p-2">
            {versions.map((version, index) => (
              <div
                key={version.$id}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all ${
                  selectedVersion === version.$id
                    ? "border-primary-300 bg-primary-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => handleVersionClick(version)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-900">
                        Version {versions.length - index}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(version.timestamp)}
                    </p>

                    {version.title && (
                      <p className="text-xs font-medium text-gray-700 mt-1 truncate">
                        "{version.title}"
                      </p>
                    )}

                    {version.content && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {getPreviewText(version.content)}
                      </p>
                    )}

                    {version.authorId && (
                      <div className="flex items-center space-x-1 mt-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Author ID: {version.authorId.substring(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>

                  <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 text-center">
          Versions are automatically saved every few minutes
        </p>
      </div>
    </div>
  );
};

export default VersionHistory;
