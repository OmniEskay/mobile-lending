# Mobile Lending App

A peer-to-peer mobile lending platform that connects lenders with borrowers, featuring automated loan processing and smart credit scoring.

## Features

- User Authentication & Profile Management
- Loan Application & Approval System
- Automated Loan Disbursement & Repayments
- Data-Driven Credit Scoring Model
- Email Notifications & Reminders
- Secure Payment Integration
- Real-time Chat Support

## Tech Stack

- **Frontend**: React Native
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Processing**: Stripe
- **Email Service**: SendGrid
- **Credit Scoring**: Custom ML Model

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- React Native CLI
- Android Studio / Xcode

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend .env
cp .env.example .env

# Frontend .env
cp .env.example .env
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start React Native app
cd ../frontend
npx react-native start
```

## Project Structure

```
mobile-lending/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── .env
└── README.md
```

## Security

- End-to-end encryption for sensitive data
- JWT-based authentication
- Input validation and sanitization
- Rate limiting
- CORS protection

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details 