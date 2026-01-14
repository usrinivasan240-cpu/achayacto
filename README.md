# Achayapathra - AI-Powered Food Waste Reduction & Safety Verification Platform

![Achayapathra Logo](https://img.shields.io/badge/Achayapathra-Food%20Waste%20Reduction-green)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-14%2B-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)

Achayapathra is a comprehensive web application that connects surplus food donors with NGOs and volunteers while ensuring food safety through AI-powered analysis. The platform helps reduce food waste by enabling safe food donation and distribution.

## 🌟 Features

### Core Functionality
- **Multi-role System**: Support for Food Donors, NGOs/Volunteers, and Admins
- **AI Food Safety Scanner**: Computer vision-based food safety analysis
- **Location-based Matching**: Find nearby food donations
- **Real-time Notifications**: Live updates on new donations and claims
- **Image Upload & Analysis**: Photo-based food quality assessment

### AI Safety Scanner
- **Visual Analysis**: Detects discoloration, mold, moisture, texture degradation
- **Time-based Validation**: Cross-checks preparation time with food safety rules
- **Food Type Specific Rules**: Different safety standards for veg/non-veg items
- **Safety Scoring**: 0-100 safety score with confidence percentage
- **Status Categories**:
  - ✅ Safe to Consume
  - ⚠️ Consume Immediately  
  - ❌ Not Safe to Consume

### User Roles

#### 🍽️ Food Donors
- Register and manage profile
- Upload food donation details
- Capture/upload food photos
- Enter food metadata (type, quantity, preparation time)
- Complete hygiene checklist
- Track donation status
- View AI safety analysis results

#### 🏢 NGOs/Volunteers
- View nearby available donations
- Filter by distance and food type
- Claim donations for pickup
- Track collection status
- Provide feedback on food quality
- Access pickup location details

#### 👨‍💼 Admins
- Monitor all platform activity
- View comprehensive analytics
- Manual override of AI decisions
- Track platform performance
- Manage user accounts
- Review safety statistics

## 🚀 Technology Stack

### Backend
- **Node.js & Express**: RESTful API server
- **SQLite**: Lightweight database
- **Socket.IO**: Real-time communication
- **Multer**: File upload handling
- **Sharp**: Image processing
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Frontend
- **React 18**: Modern UI framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Socket.IO Client**: Real-time updates
- **Tailwind CSS**: Utility-first styling
- **Heroicons**: Beautiful icons
- **Moment.js**: Date/time handling

### Additional Tools
- **Geolib**: Distance calculations
- **Sharp**: Image optimization
- **Moment**: Time-based calculations

## 📦 Installation

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd achayapathra-food-waste-reduction
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```
   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000/api`
   - API Health Check: `http://localhost:5000/api/health`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Database Configuration
The application uses SQLite by default. The database file `database.sqlite` will be created automatically in the root directory.

### File Upload Configuration
- Maximum file size: 10MB
- Supported formats: JPEG, JPG, PNG, GIF
- Files are stored in `/uploads` directory
- Images are automatically resized and optimized

## 🎯 Usage Guide

### For Food Donors

1. **Registration**
   - Sign up as a "Food Donor"
   - Provide organization details
   - Set up location coordinates

2. **Creating a Donation**
   - Click "Donate Food" button
   - Fill in food details (title, description, type)
   - Upload food photo
   - Set preparation time and storage conditions
   - Complete hygiene checklist
   - Submit for AI analysis

3. **AI Analysis Process**
   - System analyzes the uploaded image
   - Checks against time-based safety rules
   - Generates safety score and status
   - Notifies nearby NGOs if approved

### For NGOs/Volunteers

1. **Finding Donations**
   - Enable location services
   - Set search radius (5-50km)
   - Browse available donations
   - Filter by food type and safety status

2. **Claiming Donations**
   - Click "Claim Donation" on desired item
   - Contact donor to arrange pickup
   - Track claim status

3. **Quality Verification**
   - Re-scan food at pickup time (optional)
   - Provide feedback on actual food quality
   - Mark donation as completed

### For Admins

1. **Platform Monitoring**
   - View real-time analytics
   - Monitor AI scanner performance
   - Track user activity

2. **Safety Oversight**
   - Review borderline AI decisions
   - Manually approve/reject donations
   - Analyze safety patterns

## 🤖 AI Safety Scanner Details

### Analysis Components

#### Image Analysis
- **Quality Assessment**: Overall image clarity and resolution
- **Color Analysis**: Detects unusual discoloration
- **Texture Evaluation**: Identifies degradation patterns
- **Moisture Detection**: Spots excessive moisture indicators

#### Rule-Based Validation
```javascript
// Food safety time limits
const safetyRules = {
  veg: { maxHours: 8, immediateThreshold: 6 },
  'non-veg': { maxHours: 4, immediateThreshold: 2 }
};
```

#### Safety Score Calculation
- Combines image analysis (60%) and time validation (40%)
- Applies storage condition multipliers
- Factors in food type specifications

### Safety Status Explanations
The AI provides detailed explanations for its decisions:
- "Visible discoloration detected"
- "Time exceeded for non-veg food (6 hours)"
- "Texture degradation observed"
- "No visible spoilage indicators"

## 📊 Analytics & Reporting

### Key Metrics
- **Total Donations**: Number of food items donated
- **Safe Donations**: Percentage of AI-approved donations
- **Meals Saved**: Total quantity of food rescued
- **Claim Rate**: Percentage of donations claimed by NGOs
- **User Growth**: New registrations over time

### AI Performance Tracking
- **Confidence Levels**: Distribution of AI confidence scores
- **Common Issues**: Most frequent safety violations
- **Accuracy Metrics**: Comparison with human feedback

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Input Validation**: Server-side data validation
- **File Upload Security**: Type and size restrictions
- **CORS Protection**: Cross-origin request handling

## 🌐 Real-time Features

- **Live Notifications**: Instant alerts for new donations
- **Status Updates**: Real-time donation status changes
- **Location Updates**: Live location-based matching
- **Claim Notifications**: Immediate donor notifications

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Donations
- `POST /api/donations` - Create new donation
- `GET /api/donations/my` - Get user's donations
- `GET /api/donations/nearby` - Get nearby donations (NGOs)
- `POST /api/donations/:id/claim` - Claim donation

### Analytics
- `GET /api/analytics` - Get platform statistics (Admin only)

### Health
- `GET /api/health` - Server health check

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Automatic theme detection
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant components
- **Progressive Web App**: Offline capability

## 📱 Mobile Optimization

- Touch-friendly interface
- Optimized image uploads
- GPS location integration
- Push notifications ready
- Offline mode support

## 🔄 Future Enhancements

### Planned Features
- **Machine Learning Training**: Continuous AI model improvement
- **Blockchain Tracking**: Immutable donation records
- **Multi-language Support**: Localization for broader reach
- **Advanced Analytics**: Predictive insights
- **Integration APIs**: Connect with other platforms
- **Mobile Apps**: Native iOS/Android applications

### Scalability Considerations
- **Database Migration**: PostgreSQL for production
- **Cloud Storage**: AWS S3 for image hosting
- **CDN Integration**: Global content delivery
- **Microservices**: Service-oriented architecture
- **Containerization**: Docker deployment

## 🧪 Testing

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Unit tests for core functions
- Integration tests for API endpoints
- End-to-end user workflows
- AI scanner accuracy tests

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow existing code style
- Write tests for new features
- Update documentation
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Food Safety Organizations**: For safety rule guidelines
- **Open Source Community**: For excellent tools and libraries
- **Environmental Groups**: For inspiration on sustainability
- **NGOs**: For feedback on real-world requirements

## 📞 Support

For support, email support@achayapathra.org or create an issue in the repository.

## 🌍 Social Impact

Achayapathra addresses critical global challenges:

### Food Waste Statistics
- **1.3 billion tons** of food wasted annually
- **$940 billion** in economic losses
- **8-10%** of global greenhouse gas emissions

### Our Solution
- **Connects** surplus food with those in need
- **Ensures safety** through AI verification
- **Reduces waste** through efficient matching
- **Builds community** through volunteer networks

### Expected Impact
- 30% reduction in food waste from participating establishments
- 50,000+ meals saved annually per participating city
- Enhanced food security for vulnerable populations
- Reduced environmental footprint

---

**Made with ❤️ for a sustainable future**

*Achayapathra - Where Technology Meets Social Impact*