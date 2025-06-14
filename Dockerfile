# Use an official Node.js image as a parent image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies defined in package.json
RUN npm install
RUN yarn install

# Copy the rest of your application code
COPY . .

# Expose port 3000 (or your application's port)
EXPOSE 3000

# Define the command to run the application
CMD ["node", "index.js"]
