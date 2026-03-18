# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads/photos uploads/documents uploads/attachments

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
