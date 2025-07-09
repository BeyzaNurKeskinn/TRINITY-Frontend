To see the latest developments: https://github.com/BeyzaNurKeskinn/Trinity-Password_Manager


Trinity Frontend

Trinity Frontend is a modern, responsive web application built with React, TypeScript, and TailwindCSS.
It provides a secure and user-friendly interface for managing user accounts, passwords, and categories, with role-based access for admins and regular users.
The application integrates with a backend API to handle authentication, user profile updates, category management, and dashboard functionalities. 
It is served using Nginx and containerized with Docker for easy deployment.

Features

    User Authentication: Login and forgot password functionality with JWT-based authentication.
    Account Management: Update user profile details (username, email, phone, password) and upload profile pictures.
    Category Management: Admins can create, update, and delete categories with a search feature.
    Dashboard: Role-based dashboards displaying key metrics (e.g., password count, user count) for admins and featured/most-viewed passwords for users.
    Responsive Design: Built with TailwindCSS for a mobile-friendly, modern UI.
    Secure API Integration: Communicates with a backend API using Axios, with proper error handling and validation.
    ...

Tech Stack

Frontend: React 19, TypeScript, TailwindCSS
Build Tool: Vite
Server: Nginx (for serving the production build)
Containerization: Docker
Linting: ESLint with TypeScript and React plugins
Dependencies:
Axios for API requests
React Router for navigation
Heroicons and React Icons for UI components
React Modal, React Paginate, and Recharts for enhanced functionality


Backend API: Assumes a backend running at http://backend:8080 (not included in this repository)

Prerequisites
To run the project locally, ensure you have the following installed:

Node.js: Version 18 or higher

Docker: For containerized deployment (optional)

npm: Version 8 or higher (comes with Node.js)

Git: For cloning the repository


Installation

Clone the Repository:

    git clone https://github.com/your-username/trinity-frontend.git
    cd trinity-frontend


Install Dependencies:

    npm install


Set Up Environment Variables:Create a .env file in the project root and add the following:

    VITE_API_URL=http://localhost:8080

Replace http://localhost:8080 with the URL of your backend API.

Run the Development Server:

    npm run dev

The application will be available at http://localhost:5173 (or another port if specified by Vite).

Build for Production:

    npm run build

The production-ready files will be generated in the dist folder.

Run with Docker:

Build the Docker image:

    docker build -t trinity-frontend .


Run the container:

    docker run -p 80:80 trinity-frontend

The application will be available at http://localhost.



Project Structure

        trinity-frontend/

    ├── src/

    │   ├── assets/                  # Static assets (e.g., images)

    │   ├── components/

    │   │   ├── Account.tsx          # User account management component

    │   │   ├── CategoryManagement.tsx # Admin category management component

    │   │   ├── Dashboard.tsx        # Role-based dashboard component

    │   │   ├── ForgotPassword.tsx   # Password reset request component
    
    │   │   ├── Login.tsx            # User login component

    │   │   ├── Navbar.tsx           # Navigation bar component

    │   │   ├── Sidebar.tsx          # Sidebar navigation component

        .
        .
        .
    │   ├── services/

    │   │   ├── api.ts               # API service functions (e.g., login, getUserInfo)

    │   ├── App.tsx                  # Main application component

    │   ├── main.tsx                 # Entry point for React
    
    ├── public/                      # Public assets

    ├── nginx.conf                   # Nginx configuration for serving the SPA

    ├── vite.config.ts               # Vite configuration

    ├── tsconfig.json                # TypeScript configuration

    ├── tsconfig.node.json           # TypeScript configuration for Node.js files

    ├── postcss.config.js            # PostCSS configuration (TailwindCSS, Autoprefixer)

    ├── .eslintrc.js                 # ESLint configuration

    ├── .gitignore                   # Git ignore file

    ├── Dockerfile                   # Docker configuration for building and serving

    ├── package.json                 # Project metadata and dependencies


    ├── README.md                    # This file


Usage

Login:

Navigate to /login to sign in with a username and password.
Admins are redirected to /admin/dashboard, and users to /user/dashboard.


Account Management:

Access /account to update profile details or upload a profile picture.
Use the "Hesabı Dondur" (Freeze Account) option to temporarily deactivate your account.


Category Management (Admin Only):

Access /admin/categories to manage categories.
Add, update, or delete categories using the provided modals.


Dashboard:

Admins see metrics like total passwords, users, and recent actions.
Users see their categories, featured passwords, and most-viewed passwords.


Forgot Password:

Use /forgot-password to request a password reset code via email or phone.



API Endpoints
The frontend interacts with the following backend API endpoints (assumed to be running at http://localhost:8080):

    POST /api/user/login: Authenticates a user and returns JWT tokens.
    GET /api/user/me: Retrieves the current user’s information.
    POST /api/user/upload-profile-picture: Uploads a user’s profile picture.
    PUT /api/user/update: Updates user profile details.
    POST /api/user/freeze-account: Freezes a user’s account.
    POST /api/user/forgot-password: Sends a password reset code.
    GET /api/admin/dashboard: Fetches admin dashboard data.
    GET /api/admin/categories: Lists all categories (admin).
    POST /api/admin/categories: Creates a new category (admin).
    PUT /api/admin/categories/:id: Updates a category (admin).
    DELETE /api/admin/categories/:id: Deletes a category (admin).
    GET /api/admin/users: Lists all users (admin).
    GET /api/user/categories: Lists user-accessible categories.
    GET /api/user/passwords: Lists all user passwords.
    GET /api/user/most-viewed-passwords: Lists most-viewed passwords.
    GET /api/user/featured-passwords: Lists featured passwords.
    .
    .
    .

Ensure the backend API is running and accessible at the configured URL.
Development

Linting:

    npm run lint

Runs ESLint to check for code quality issues.

Preview Production Build:

    npm run preview

Serves the production build locally for testing.


Contributing

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

Please ensure your code follows the ESLint rules and includes appropriate tests.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For questions or support, contact the project maintainer at beyzanurhorasan89@gmail.com.
