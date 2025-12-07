# 1. Use official Node.js LTS image
FROM node:18-alpine AS build

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install deps
COPY package*.json ./
RUN npm install

# 4. Copy rest of the code
COPY . .

# 5. Build the NestJS app
RUN npm run build

# 6. Stage 2: lightweight runtime image
FROM node:18-alpine

WORKDIR /app

# Copy only built files and minimal dependencies
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./.env

# Expose app port
EXPOSE 4000

# Run the built app
CMD ["node", "dist/main.js"]
