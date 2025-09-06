# QuickDoc - Collaborative Document Editor

A real-time collaborative document editor built with React and Appwrite, featuring automatic version history tracking.

## Features

- 🔐 **User Authentication** - Secure email/password authentication
- 📝 **Rich Text Editor** - Full-featured document editing with ReactQuill  
- 🔄 **Real-time Collaboration** - Live synchronization across multiple users
- 📊 **Version History** - Automatic snapshots with timeline view
- 💾 **Auto-save** - Automatic document saving every 2 seconds
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (BaaS)
- **Editor**: ReactQuill
- **Routing**: React Router v6
- **Icons**: Lucide React

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd quickdoc-app
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
VITE_APPWRITE_URL=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id-here
VITE_APPWRITE_DATABASE_ID=your-database-id-here
VITE_APPWRITE_DOCUMENTS_COLLECTION_ID=documents
VITE_APPWRITE_VERSIONS_COLLECTION_ID=document_versions
```

### 3. Appwrite Setup

#### Create Project
1. Sign up at [Appwrite Cloud](https://cloud.appwrite.io)
2. Create a new project
3. Copy the Project ID to your `.env` file

#### Database Configuration

Create a database called `quickdoc-db` with these collections:

**Collection 1: `documents`**
```
Attributes:
- title (string, size: 255, required: false)
- content (string, size: 65535, required: false) 
- owner (string, size: 255, required: true)
- createdAt (datetime, required: true)
- updatedAt (datetime, required: true)

Permissions:
- Create: Users
- Read: Document Owner
- Update: Document Owner  
- Delete: Document Owner
```

**Collection 2: `document_versions`**
```
Attributes:
- documentId (string, size: 255, required: true)
- title (string, size: 255, required: false)
- content (string, size: 65535, required: false)
- timestamp (datetime, required: true)
- authorId (string, size: 255, required: true)

Permissions:
- Create: Any authenticated user
- Read: Any authenticated user
- Update: None
- Delete: None
```

#### Authentication Setup
1. Go to Auth → Settings
2. Enable Email/Password provider
3. Configure session limits as needed

#### Function Setup (Version History)

1. Go to Functions → Create Function
2. Name: `document-version-creator`
3. Runtime: Node.js 18
4. Copy the Appwrite Function code provided
5. Add environment variables:
   - `APPWRITE_FUNCTION_ENDPOINT`: https://cloud.appwrite.io/v1
   - `APPWRITE_FUNCTION_PROJECT_ID`: your-project-id
   - `APPWRITE_FUNCTION_API_KEY`: (create API key with database permissions)
   - `DATABASE_ID`: quickdoc-db
   - `DOCUMENTS_COLLECTION_ID`: documents
   - `VERSIONS_COLLECTION_ID`: document_versions
6. Deploy the function

#### Webhook Setup
1. Go to Database → documents collection → Settings → Webhooks
2. Create webhook:
   - Name: `version-creator-webhook`
   - Events: `databases.*.collections.*.documents.*.update`
   - URL: Your function's execution URL
   - HTTP Method: POST

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## Project Structure

```
quickdoc-app/
├── public/
├── src/
│   ├── appwrite/
│   │   └── config.js              # Appwrite client & services
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx          # Login form component
│   │   │   └── Signup.jsx         # Registration form
│   │   ├── editor/
│   │   │   ├── TextEditor.jsx     # ReactQuill wrapper with auto-save
│   │   │   └── VersionHistory.jsx # Version history sidebar
│   │   └── Layout.jsx             # Main app layout
│   ├── contexts/
│   │   └── AuthContext.jsx        # Global authentication state
│   ├── pages/
│   │   ├── Dashboard.jsx          # Document list page
│   │   ├── DocumentPage.jsx       # Main editor page
│   │   └── Home.jsx               # Landing page
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Tailwind imports & custom styles
├── .env.example                   # Environment variables template
├── package.json
├── tailwind.config.js
├── vite.config.js
└── index.html
```

## Key Features Implementation

### Real-time Collaboration
- Uses Appwrite Realtime to subscribe to document changes
- Updates are automatically synced across all connected clients
- Prevents update conflicts with proper state management

### Version History
- Automatic snapshots created via Appwrite Functions + Webhooks
- Timeline view showing all document versions
- Click any version to view historical content (read-only)
- Automatic cleanup of old versions (keeps last 50)

### Auto-save
- Debounced saving every 2 seconds after content changes
- Manual save button for immediate saving
- Visual feedback showing save status
- Prevents data loss during editing

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- Uses functional components with hooks
- TypeScript-ready (though using JavaScript for simplicity)
- Tailwind CSS for styling
- ESLint configuration included

## Production Deployment

### Frontend Deployment
1. Build the app: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service
3. Configure environment variables on your hosting platform

### Appwrite Production Setup
1. Set up production Appwrite instance
2. Configure proper security rules
3. Set up monitoring and backups
4. Update CORS settings for your domain

## Troubleshooting

### Common Issues

**Authentication not working:**
- Check Appwrite project ID and endpoint
- Verify auth provider is enabled
- Check browser network tab for CORS errors

**Real-time not syncing:**
- Verify Appwrite Realtime is enabled
- Check document permissions
- Look for WebSocket connection errors in browser console

**Version history not creating:**
- Check webhook is properly configured
- Verify function has correct permissions
- Check function logs in Appwrite console

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility
- Verify all environment variables are set

### Performance Optimization

For production use, consider:
- Implementing pagination for document lists
- Adding lazy loading for version history
- Optimizing bundle size with code splitting
- Setting up CDN for static assets
- Implementing proper caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## Support

For questions and support:
- Check the [Appwrite Documentation](https://appwrite.io/docs)
- Join the [Appwrite Discord](https://appwrite.io/discord)
- Open an issue in this repository

---

**Built for the hackathon with ❤️ using React and Appwrite**
