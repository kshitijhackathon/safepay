# Use Node.js base image
FROM node:20-slim AS node_base

# Install Python and necessary system packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY requirements.txt ./
COPY requirements_qr.txt ./

# Install Node.js dependencies
RUN npm ci

# Install Python dependencies (excluding torch-related ones from requirements_qr.txt)
RUN pip3 install -r requirements.txt
RUN pip3 install -r requirements_qr.txt

# Install PyTorch separately (CPU version with extra index)
RUN pip3 install torch==2.2.0+cpu torchvision==0.17.0+cpu torchaudio==2.2.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the full application code
COPY . .

# Build the frontend (React/Node)
RUN npm run build

# Create models directory if needed
RUN mkdir -p models

# Expose required ports
EXPOSE 5000 8081 8082 8083

# Start the application
CMD ["npm", "run", "start:prod"]
