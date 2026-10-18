# AWS Deployment Guide

This app is structured for a standard AWS deployment pattern:

- Backend: Rails API on EC2, ECS, or Elastic Beanstalk
- Frontend: Vite static build served by S3 + CloudFront or a Node host
- Database: Amazon RDS PostgreSQL

## 1) Required environment variables

### Backend
Create a real `.env` file or AWS environment variables with values like:

```bash
POSTGRES_HOST=your-rds-host.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
RAILS_ENV=production
RAILS_MASTER_KEY=your_master_key
CORS_ORIGINS=https://your-frontend-domain.com
```

### Frontend
Set the frontend API URL when building for production:

```bash
VITE_API_URL=https://your-api-domain.com
```

## 2) Production build

### Backend
```bash
cd backend
bundle install
bundle exec rails db:prepare
bundle exec rails server -b 0.0.0.0 -p 3000
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

The generated production files are in:

```text
frontend/dist
```

## 3) AWS deployment options

### Option A: EC2
- Launch a Linux EC2 instance
- Install Ruby, Node, PostgreSQL client if needed
- Clone the repo
- Set environment variables
- Start the backend and serve the frontend build 

### Option B: ECS / Docker
- Build backend and frontend images
- Use Amazon RDS for PostgreSQL
- Expose the API behind a load balancer
- Serve the frontend via a static bucket or container

### Option C: S3 + CloudFront
- Use `npm run build`
- Upload the `frontend/dist` folder to S3
- Set CloudFront to serve the site
- Point the API URL to the Rails backend domain

## 4) Security checklist

- Do not commit `.env` files
- Use AWS Secrets Manager or Parameter Store for database credentials
- Keep `CORS_ORIGINS` restricted to your actual frontend domain
- Use HTTPS only in production
- Set strong database credentials and a Rails master key

## 5) Recommended next step

The app is now close to deployment-ready because:

- the API is environment-based
- the frontend API URL is configurable
- the backend CORS allows real deployment origins
- the local startup script is separate from production deployment logic

For a real AWS deploy, the next step is usually: choose EC2 or ECS, set environment variables, and connect the app to Amazon RDS PostgreSQL.
