# Use the official Node.js Alpine image for a small, secure footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) first
# This optimizes Docker's layer caching so dependencies aren't re-installed unless package.json changes
COPY package*.json ./

# Install dependencies (production only to keep image size small)
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Expose the port the app runs on (Render assigns process.env.PORT, but 5000 is our fallback)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
