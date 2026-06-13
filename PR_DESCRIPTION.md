## Description

This PR introduces the ability to add and view file attachments (such as PDFs, DOCX, and images) within the notes/comments section for leads.

### Key Changes

- **Document Upload Support**: Configured the Cloudinary upload middleware to support uploading raw files (PDF, DOCX) and automatically appending the correct file extension so they can be viewed directly in the browser.
- **Unique File Naming**: Added unique IDs to uploaded files to prevent naming collisions and accidental overwrites in Cloudinary.
- **Note Component Refactoring**: Extracted the note rendering logic into a reusable `<NoteItem />` component to DRY up the codebase.
- **Enhanced Note UI**: Applied the updated note UI (which includes author profile initials and dynamic attachment previews) consistently across `LeadDetail`, `MyLeads`, and `Dashboard` pages.
- **Clickable Attachments**: Instead of a generic "View Attached Document" link, notes now dynamically display the actual filename of the uploaded document, and clicking it opens the document safely in a new tab.

### How to Test
1. Ensure your local backend is running (`npm start`) so the updated Cloudinary middleware is loaded.
2. Open any lead and navigate to the comments/notes section.
3. Upload a document (e.g., a `.pdf` or `.docx` file) along with a comment.
4. Verify that the file name is correctly displayed in the comment.
5. Click the file name and verify that the document opens successfully in a new tab without returning a "Site cannot be reached" or 401 error.
