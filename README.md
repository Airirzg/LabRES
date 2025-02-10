# Reservation System

A modern web application built with Next.js for managing reservations. The system includes user authentication, reservation management, and an admin dashboard.

## Features

- User authentication (login/register)
- Create, view, update, and delete reservations
- Admin dashboard for managing all reservations
- Responsive design using Bootstrap with SASS customization
- Redux for state management
- TypeScript for type safety

## Prerequisites

- Node.js 14.x or later
- npm or yarn

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd reservation-system
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
reservation-system/
├── components/          # Reusable React components
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── admin/         # Admin dashboard pages
│   └── auth/          # Authentication pages
├── store/             # Redux store configuration
│   └── slices/        # Redux slices
├── styles/            # SASS styles
│   ├── globals.scss   # Global styles
│   └── variables.scss # SASS variables
└── utils/             # Utility functions
```

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint for code linting

## Demo Accounts

For testing purposes, you can use these demo accounts:

- Admin User:
  - Email: admin@example.com
  - Password: user123

- Regular User:
  - Email: jhon@example.com
  - Password: user123

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
