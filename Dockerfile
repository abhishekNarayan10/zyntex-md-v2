# Use an official Node.js image as a parent image
FROM node:22

# Install Python (required for youtube-dl-exec)
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY yarn*.lock

# Install dependencies defined in package.json
RUN npm install
RUN yarn add

# Copy the rest of your application code
COPY . .

# Expose port 3000 (or your application's port)
EXPOSE 3000

# Define the command to run the application
CMD ["node", "index.js"]
