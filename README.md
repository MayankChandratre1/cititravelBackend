# CitiTravel Backend

A Node.js backend service for the CitiTravel booking platform.

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- SMTP server access

### Installation
1. Clone the repository
```bash
git clone <repository-url>
cd cititravel_backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret

# Sabre API Configuration
SABRE_CLIENT_ID=your_sabre_client_id
SABRE_CLIENT_SECRET=your_sabre_client_secret
SABRE_API_URL=https://api-crt.cert.havail.sabre.com
SABRE_PCC=your_sabre_pcc

# Email Configuration
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

# Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Development
Run the development server:
```bash
npm run dev
```

### Testing
Run the test suite:
```bash
npm test
```

## Deployment

### Production Setup
1. Update environment variables for production
2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Configure project:
- Create a `vercel.json` file in the project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

4. Deploy:
```bash
vercel
```

5. Set up environment variables in Vercel:
   - Go to your project settings in Vercel dashboard
   - Navigate to Environment Variables section
   - Add all variables from your `.env` file



