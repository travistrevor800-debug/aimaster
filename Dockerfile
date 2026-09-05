# Simple production image for the AI Master backend.
# Build:  docker build -t ai-master-backend .
# Run:    docker run -p 4000:4000 --env-file .env ai-master-backend

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]
