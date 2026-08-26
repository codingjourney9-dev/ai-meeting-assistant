# ==========================================
# STAGE 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client

# Copy client package files and install dependencies
COPY client/package*.json ./
RUN npm ci || npm install

# Copy the rest of the client code and build the React app
COPY client/ ./
# We need to build the frontend. Vite will output to /app/client/dist
RUN npm run build

# ==========================================
# STAGE 2: Build the Node Backend & Serve
# ==========================================
FROM node:20-alpine
WORKDIR /app/server

# Copy server package files and install production dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy backend source code
COPY server/ ./

# Copy the built React app from Stage 1 into the server's public directory
COPY --from=frontend-builder /app/client/dist ./public

# Expose the port (Render will override this, but 5000 is our default)
EXPOSE 5000

# Start the Express server
CMD ["npm", "start"]
