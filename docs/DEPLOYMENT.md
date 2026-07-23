# AquaNexus Deployment Guide

## Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [AWS Deployment](#aws-deployment)
3. [Google Cloud Platform](#google-cloud-platform)
4. [DigitalOcean](#digitalocean)
5. [Environment Variables](#environment-variables)
6. [Database Migration](#database-migration)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [CI/CD Pipeline](#cicd-pipeline)

---

## Docker Deployment

### Production Dockerfile

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S aquanexus && \
    adduser -S aquanexus -u 1001

# Copy built application
COPY --from=builder --chown=aquanexus:aqunexus /app/dist ./dist
COPY --from=builder --chown=aquanexus:aqunexus /app/node_modules ./node_modules
COPY --from=builder --chown=aquanexus:aqunexus /app/package.json ./

# Switch to non-root user
USER aquanexus

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start application
CMD ["node", "dist/server.js"]
```

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: aquanexus-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://aquanexus:${DB_PASSWORD}@db:5432/aquanexus_prod
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - aquanexus-network
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:15-alpine
    container_name: aquanexus-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: aquanexus_prod
      POSTGRES_USER: aquanexus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    networks:
      - aquanexus-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aquanexus"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: aquanexus-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    networks:
      - aquanexus-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: aquanexus-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - aquanexus-network

volumes:
  postgres_data:
  redis_data:

networks:
  aquanexus-network:
    driver: bridge
```

### Deploy with Docker

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec api npm run db:migrate

# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## AWS Deployment

### Architecture Overview

```
Internet
    │
    ▼
┌─────────┐
│   ALB   │ (Application Load Balancer)
└────┬────┘
     │
┌────▼────┐
│   ECS   │ (Elastic Container Service)
│ Fargate │
└────┬────┘
     │
┌────▼────┐
│  ElastiCache  │ (Redis)
└─────────┘
┌────▼────┐
│   RDS   │ (PostgreSQL)
└─────────┘
```

### Step 1: Create RDS PostgreSQL

```bash
# Using AWS CLI
aws rds create-db-instance \
    --db-instance-identifier aquanexus-prod \
    --db-instance-class db.t3.medium \
    --engine postgres \
    --engine-version 15 \
    --master-username aquanexus \
    --master-user-password <SECURE_PASSWORD> \
    --allocated-storage 50 \
    --storage-type gp3 \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-subnet-group-name aquanexus-subnet \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --enable-cloudwatch-logs-exports '["postgresql"]'
```

### Step 2: Create ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id aquanexus-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --engine-version 7.0 \
    --num-cache-nodes 1 \
    --security-group-ids sg-xxxxxxxx \
    --subnet-group-name aquanexus-cache-subnet
```

### Step 3: Create ECR Repository

```bash
# Create repository
aws ecr create-repository \
    --repository-name aquanexus-api \
    --image-scanning-configuration scanOnPush=true

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push image
docker build -t aquanexus-api -f docker/Dockerfile .
docker tag aquanexus-api:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aquanexus-api:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aquanexus-api:latest
```

### Step 4: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster \
    --cluster-name aquanexus-prod \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1

# Create task definition
aws ecs register-task-definition \
    --cli-input-json file://docker/ecs/task-definition.json
```

**Task Definition:**

```json
{
  "family": "aquanexus-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/aquanexus-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:us-east-1:<ACCOUNT_ID>:parameter/aquanexus/DATABASE_URL"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:us-east-1:<ACCOUNT_ID>:parameter/aquanexus/JWT_SECRET"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/aquanexus-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "node healthcheck.js || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Step 5: Create ECS Service

```bash
aws ecs create-service \
    --cluster aquanexus-prod \
    --service-name aquanexus-api-service \
    --task-definition aquanexus-api \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:xxx,targetGroup/aquanexus-tg,containerName=api,containerPort=3000"
```

---

## Google Cloud Platform

### Architecture

```
Internet
    │
    ▼
┌─────────────┐
│ Cloud Load  │
│  Balancer   │
└──────┬──────┘
       │
┌──────▼──────┐
│ Cloud Run   │
└──────┬──────┘
       │
┌──────▼──────┐   ┌─────────────┐
│ Cloud SQL   │   │ Memorystore │
│ (PostgreSQL)│   │   (Redis)   │
└─────────────┘   └─────────────┘
```

### Deploy to Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/aquanexus-project/aquanexus-api

gcloud run deploy aquanexus-api \
    --image gcr.io/aquanexus-project/aquanexus-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production \
    --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest
```

### Cloud SQL Setup

```bash
# Create Cloud SQL instance
gcloud sql instances create aquanexus-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-size=10GB \
    --storage-auto-increase

# Create database
gcloud sql databases create aquanexus_prod --instance=aquanexus-db

# Connect to migrate
gcloud sql connect aquanexus-db --user=aquanexus
```

---

## DigitalOcean

### App Platform Deployment

```yaml
# .do/app.yaml
name: aquanexus
region: nyc

services:
  - name: api
    dockerfile_path: docker/Dockerfile
    http_port: 3000
    instance_count: 2
    instance_size_slug: professional-xs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${DB.DATABASE_URL}
        type: SECRET
      - key: REDIS_URL
        value: ${REDIS.DATABASE_URL}
        type: SECRET
      - key: JWT_SECRET
        type: SECRET

databases:
  - name: db
    engine: PG
    version: "15"
    size: db-s-dev-database
    num_nodes: 1

  - name: redis
    engine: REDIS
    version: "7"
    size: db-s-dev-redis
    num_nodes: 1
```

```bash
# Deploy
doctl apps create --spec .do/app.yaml
```

### Droplet Deployment (Manual)

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/your-org/aquanexus.git
cd aquanexus

# Configure environment
cp .env.example .env
nano .env

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Setup Nginx reverse proxy
apt install nginx
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection | `redis://host:6379` |
| `JWT_SECRET` | JWT signing key | Random 256-bit string |

### Service Variables

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number |
| `OPENAI_API_KEY` | OpenAI API key |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_S3_BUCKET` | S3 bucket name |
| `DISEASE_DETECTION_API_URL` | ML service URL |
| `DISEASE_DETECTION_API_KEY` | ML service API key |

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

---

## Database Migration

### Production Migration Strategy

```bash
# 1. Backup database first
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
npm run db:migrate

# 3. Verify migration status
npm run db:migrate:status
```

### Zero-Downtime Migration

For production deployments, use these strategies:

1. **Backward Compatible Migrations**
   - Add new columns as nullable
   - Deploy code that handles both old and new schema
   - Run migration to populate data
   - Add NOT NULL constraint in separate migration

2. **Migration Checklist**
   - [ ] Test migration on staging
   - [ ] Verify rollback procedure
   - [ ] Check for data loss
   - [ ] Monitor performance impact
   - [ ] Schedule during low-traffic window

---

## SSL/TLS Configuration

### Nginx Configuration

```nginx
# docker/nginx/nginx.conf
upstream api {
    server api:3000;
}

server {
    listen 80;
    server_name api.aquanexus.dev;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.aquanexus.dev;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Let's Encrypt SSL

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d api.aquanexus.dev -d www.aquanexus.dev

# Auto-renewal (add to crontab)
0 0,12 * * * python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew
```

---

## Monitoring & Logging

### Health Check Endpoint

```javascript
// src/healthcheck.js
const { pool } = require('./config/database');
const redis = require('./config/redis');

async function healthCheck() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Database check
  try {
    await pool.query('SELECT 1');
    checks.services.database = { status: 'healthy' };
  } catch (error) {
    checks.services.database = { status: 'unhealthy', error: error.message };
    checks.status = 'unhealthy';
  }

  // Redis check
  try {
    await redis.ping();
    checks.services.redis = { status: 'healthy' };
  } catch (error) {
    checks.services.redis = { status: 'unhealthy', error: error.message };
    checks.status = 'unhealthy';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  process.exit(checks.status === 'healthy' ? 0 : 1);
}

healthCheck();
```

### Prometheus Metrics

```javascript
// Add to package.json
// "prom-client": "^14.0.0"

const client = require('prom-client');

// Collect default metrics
client.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

module.exports = { httpRequestDuration };
```

### Logging (Winston)

```javascript
// src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'aquanexus-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Grafana Dashboard

Import dashboard JSON for monitoring:

- Request rate
- Response time percentiles
- Error rate
- Database connection pool
- Redis memory usage

---

## Backup Strategy

### Database Backup

```bash
# Manual backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Automated backup script (add to crontab)
# Daily backup at 2 AM
0 2 * * * /scripts/backup.sh
```

**Backup Script:**

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/aquanexus_$DATE.sql.gz"

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://aquanexus-backups/database/

# Keep only last 30 days locally
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

### Restore Database

```bash
# From backup file
gunzip < backup_20240115_020000.sql.gz | psql $DATABASE_URL

# From S3
aws s3 cp s3://aquanexus-backups/database/backup.sql.gz .
gunzip < backup.sql.gz | psql $DATABASE_URL
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: aquanexus-api

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: aquanexus_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/aquanexus_test
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/aquanexus_test
      
      - name: Run linting
        run: npm run lint
      
      - name: Run typecheck
        run: npm run typecheck

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build, tag, and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -f docker/Dockerfile .
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest -f docker/Dockerfile .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster aquanexus-prod \
            --service aquanexus-api-service \
            --force-new-deployment
```

---

## Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Check health endpoints return 200
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Check Redis connectivity
- [ ] Monitor error logs for 15 minutes
- [ ] Run smoke tests
- [ ] Verify SSL certificate
- [ ] Check backup job is scheduled
- [ ] Update monitoring dashboards
