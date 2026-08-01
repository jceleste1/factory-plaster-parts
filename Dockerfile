# Use Node.js 20 LTS
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --prefer-offline --no-audit

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Set environment
ENV VITE_API_BASE_URL=http://localhost:3000/api

# Start dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
