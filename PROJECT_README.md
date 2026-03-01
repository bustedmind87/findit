# FindIt - Lost and Found Application

A full-stack web application for reporting lost and found items with image uploads, claims management, and admin dashboard.

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on **http://localhost:8080**

### 2. Start Frontend (in new terminal)
```bash
npm start
```
Frontend runs on **http://localhost:4200**

### 3. Open Browser
Visit **http://localhost:4200** and start using the app!

---

## 📋 Complete Documentation

For detailed setup, startup, and deployment information, see:

| File | Purpose |
|------|---------|
| **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)** | Complete startup instructions, troubleshooting, and development workflow |
| **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** | Quick reference for deployment scenarios and cloud platforms |
| **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)** | Comprehensive guide for hosting on Netlify with backend integration |

---

## 🗂️ Project Structure

```
findit/
├── src/                          # Angular Frontend
│   ├── app/
│   │   ├── core/                # Services (API, Auth, etc.)
│   │   ├── pages/               # Page components
│   │   ├── shared/              # Reusable components
│   │   └── models/              # TypeScript interfaces
│   └── environments/            # Environment configs
├── backend/                      # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/example/
│   │       ├── model/           # JPA entities
│   │       ├── service/         # Business logic
│   │       ├── repository/      # Data access
│   │       ├── controller/      # REST endpoints
│   │       └── config/          # Configuration
│   └── pom.xml                  # Maven config
├── angular.json                 # Angular build config
├── package.json                 # Frontend dependencies
├── netlify.toml                 # Netlify deployment config
└── STARTUP_GUIDE.md             # Detailed startup guide
```

---

## 💻 Technology Stack

### Frontend
- **Angular 19.2** - Modern web framework
- **TypeScript 5.7** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming
- **Bootstrap 5.3** - UI components
- **Chart.js 4.5** - Dashboard charts

### Backend
- **Spring Boot 3.1.4** - Java web framework
- **Spring Data JPA** - Database ORM
- **Maven 3.6+** - Build tool
- **Java 17+** - Runtime
- **H2 Database** - In-memory database (development)

---

## 🎯 Core Features

### 1. Report Lost/Found Items
- Upload item photos/images
- Describe item details
- Categorize items by type
- Track item status (Lost/Found/Returning)

### 2. Claim Items
- View items reported by others
- Submit claims for items
- Track claim status (Pending/Approved/Rejected)
- Message item owners

### 3. Admin Dashboard
- View all items and claims
- Review statistics
- Manage user Q&A
- System overview

### 4. Image Management
- Upload multiple images per item
- Image storage (local or cloud)
- Image retrieval and caching
- Support for various formats

### 5. User Authentication
- Register new accounts
- Login/logout
- Session management
- Role-based access control

---

## 🔧 Prerequisites

### Required
- **Node.js 18+** - Download from https://nodejs.org/
- **npm 9+** - Included with Node.js
- **Java 17+** - Download from https://www.oracle.com/java/
- **Maven 3.6+** - Download from https://maven.apache.org/

### Optional
- **Git** - For version control
- **VS Code** - Recommended editor
- **Postman** - For API testing

### Verify Installation
```bash
node --version      # Should be v18+
npm --version       # Should be 9+
java -version       # Should be Java 17+
mvn --version       # Should be 3.6+
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd findit
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Backend dependencies are downloaded automatically by Maven
```

### 3. Verify Backend Compilation
```bash
cd backend
mvn clean compile
cd ..
```

### 4. Start Development Services
```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend (after backend starts)
npm start
```

For detailed startup instructions, see [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)

---

## 🌐 API Endpoints

### Items
```
GET    /api/items                    # Get all items
POST   /api/items                    # Create item (multipart/form-data)
GET    /api/items/:id                # Get item details
PUT    /api/items/:id                # Update item
DELETE /api/items/:id                # Delete item
GET    /api/items/status/:status     # Filter by status
```

### Claims
```
GET    /api/claims                   # Get all claims
POST   /api/claims                   # Create claim
GET    /api/claims/:id               # Get claim details
PUT    /api/claims/:id/status        # Update claim status
DELETE /api/claims/:id               # Delete claim
```

### Files
```
GET    /api/files/items/:itemId/:filename    # Get image
```

### Statistics
```
GET    /api/stats/summary            # Dashboard stats
```

### Q&A
```
GET    /api/qa                       # Get all Q&A
POST   /api/qa                       # Create Q&A
PUT    /api/qa/:id                   # Update Q&A
DELETE /api/qa/:id                   # Delete Q&A
```

---

## 🚀 Deployment

### Development
See [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) for local development setup.

### Production on Netlify
See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for comprehensive deployment guide.

### Quick Deployment Reference
See [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) for platform-specific guides.

### Frontend Build
```bash
npm run build
# Produces: dist/lostfound-frontend/
```

### Backend Build
```bash
cd backend
mvn clean package
# Produces: target/findit-0.0.1-SNAPSHOT.jar
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
ng test
```

### Backend Build Verification
```bash
cd backend
mvn clean compile -X   # with debug output
```

### Frontend Build Verification
```bash
npm run build
ls dist/lostfound-frontend/  # Check build output
```

---

## 🔒 Security

### Development
- ✅ CORS configured for localhost
- ✅ H2 console disabled in production
- ✅ Multipart upload validation
- ⚠️ Authentication needs hardening for production

### Production Recommendations
- [ ] Enable HTTPS only
- [ ] Use environment variables for secrets
- [ ] Implement password hashing (BCrypt)
- [ ] Use cloud storage for images (S3/Cloudinary)
- [ ] Enable database authentication
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Enable audit logging

See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for production security recommendations.

---

## 📝 Environment Configuration

### Frontend Configuration
**src/environments/environment.ts** - Development
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api'
};
```

**src/environments/environment.prod.ts** - Production
```typescript
export const environment = {
  production: true,
  apiBaseUrl: '/api'  // or 'https://api.example.com/api'
};
```

### Backend Configuration
**backend/src/main/resources/application.properties**
```properties
spring.application.name=findit
server.port=8080
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

---

## 🐛 Troubleshooting

### Backend Issues
- **Port in use:** See [STARTUP_GUIDE.md](./STARTUP_GUIDE.md#backend-wont-start)
- **Compilation error:** Run `mvn clean compile`
- **Database error:** Check H2 connection string

### Frontend Issues
- **Port in use:** See [STARTUP_GUIDE.md](./STARTUP_GUIDE.md#frontend-wont-start)
- **Module not found:** Run `npm install`
- **CORS error:** Check backend CORS configuration

### Not Communicating
- **Check backend:** `curl http://localhost:8080/api/items`
- **Check frontend:** Open http://localhost:4200
- **Check Network tab:** F12 → Network → Look for API requests

Full troubleshooting guide in [STARTUP_GUIDE.md](./STARTUP_GUIDE.md#troubleshooting)

---

## 📚 Additional Resources

- **Angular Documentation:** https://angular.io/docs
- **Spring Boot Documentation:** https://spring.io/projects/spring-boot
- **Netlify Documentation:** https://docs.netlify.com/
- **Maven Documentation:** https://maven.apache.org/guides/
- **TypeScript Documentation:** https://www.typescriptlang.org/docs/

---

## 🗺️ Development Workflow

1. **Start Services** → See [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
2. **Make Changes** → Edit code in your IDE
3. **Test Locally** → Services auto-reload changes
4. **Commit Changes** → `git add . && git commit -m "description"`
5. **Push to GitHub** → `git push`
6. **Deploy to Netlify** → See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/description`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m "Add description"`
5. Push: `git push origin feature/description`
6. Create Pull Request

---

## 📄 License

[Add your license here]

---

## 📞 Support

For issues or questions:
1. Check the [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) troubleshooting section
2. Review [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for deployment issues
3. Check [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) for quick answers
4. Review browser console (F12) for error messages
5. Check backend logs for server errors

---

## 📊 Project Status

- ✅ Core features implemented
- ✅ Frontend and backend integrated
- ✅ File upload support
- ✅ Claims system
- ✅ Admin dashboard
- ✅ Development deployment ready
- ⏳ Production deployment (see NETLIFY_DEPLOYMENT.md)
- ⏳ Cloud image storage (documented, pending implementation)
- ⏳ Password hashing and advanced auth (documented, pending implementation)

---

**Last Updated:** 2024
**Version:** 1.0.0
**Maintainer:** [Your Name]

---

## 🎯 Quick Links

| What do you want to do? | See |
|------------------------|-----|
| Start development | [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) |
| Deploy to Netlify | [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) |
| Quick deployment reference | [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) |
| Understand the code | This README and code comments |
| Report an issue | GitHub Issues |
| Contribute | Follow Contributing section above |

**Start here:** [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) → [DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md) → [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
