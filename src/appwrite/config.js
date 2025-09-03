import {
  Client,
  Account,
  Databases,
  ID,
  Permission,
  Role,
  Query,
} from "appwrite";

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(
    import.meta.env.VITE_APPWRITE_URL || "https://cloud.appwrite.io/v1"
  )
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "your-project-id");

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

// Configuration constants
export const appwriteConfig = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "quickdoc-db",
  documentsCollectionId:
    import.meta.env.VITE_APPWRITE_DOCUMENTS_COLLECTION_ID || "documents",
  versionsCollectionId:
    import.meta.env.VITE_APPWRITE_VERSIONS_COLLECTION_ID || "document_versions",
};

// Document operations
export const documentService = {
  // Create new document
  async createDocument(title, content, userId) {
    try {
      const document = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.documentsCollectionId,
        ID.unique(),
        {
          title,
          content,
          owner: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      return document;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  },

  // Get user documents
  async getUserDocuments(userId) {
    try {
      const documents = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.documentsCollectionId,
        [
          Query.equal("owner", userId),
          Query.orderDesc("updatedAt"),
          Query.limit(100),
        ]
      );
      return documents.documents;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  // Get single document
  async getDocument(documentId) {
    try {
      const document = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.documentsCollectionId,
        documentId
      );
      return document;
    } catch (error) {
      console.error("Error fetching document:", error);
      throw error;
    }
  },

  // Update document
  async updateDocument(documentId, updates) {
    try {
      const document = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.documentsCollectionId,
        documentId,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      );
      return document;
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(documentId) {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.documentsCollectionId,
        documentId
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  // Subscribe to document changes
  subscribeToDocument(documentId, callback) {
    return client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.documentsCollectionId}.documents.${documentId}`,
      callback
    );
  },
};

// Version operations
export const versionService = {
  // Get document versions
  async getDocumentVersions(documentId) {
    try {
      const versions = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.versionsCollectionId,
        [
          Query.equal("documentId", documentId),
          Query.orderDesc("timestamp"),
          Query.limit(50),
        ]
      );
      return versions.documents;
    } catch (error) {
      console.error("Error fetching versions:", error);
      throw error;
    }
  },

  // Create version manually (for testing)
  async createVersion(documentId, title, content, authorId) {
    try {
      const version = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.versionsCollectionId,
        ID.unique(),
        {
          documentId,
          title,
          content,
          timestamp: new Date().toISOString(),
          authorId,
        }
      );
      return version;
    } catch (error) {
      console.error("Error creating version:", error);
      throw error;
    }
  },
};

// Auth operations
export const authService = {
  // Sign up
  async signUp(email, password, name) {
    try {
      const newUser = await account.create(ID.unique(), email, password, name);

      // Auto sign in after registration
      await this.signIn(email, password);
      return newUser;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  // Sign in
  async signIn(email, password) {
    try {
      const session = await account.createEmailSession(email, password);
      return session;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      return null;
    }
  },
};

export { ID, Query, Permission, Role };
export default client;
