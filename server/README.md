# Achariya Internal Portal - Backend Server

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the server directory with:
   ```
   MONGODB_URI=mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/
   PORT=8000
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Student Upload Endpoints

- `POST /api/v1/admin/students/upload` - Upload Excel file
  - Body: `multipart/form-data` with `file` field
  - Returns: Parsed student data and file ID

- `POST /api/v1/admin/students/save` - Save students to database
  - Body: `{ students: [...], fileId: "..." }`
  - Returns: Number of saved students

- `GET /api/v1/admin/students` - Get all students
  - Returns: List of all students

## Database

The server connects to MongoDB and creates a new database: `achariya_students_db`

## File Uploads

Uploaded Excel files are stored in: `server/uploads/studentdata/documents/`

Files are automatically deleted after successful processing.

