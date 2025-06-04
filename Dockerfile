# Use Node.js base image
FROM node:20-slim AS node_base

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set up app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements*.txt ./

# Install dependencies
RUN npm ci
# RUN pip3 install -r requirements.txt
RUN pip3 install -r requirements_qr.txt
RUN python -m pip install fastapi uvicorn pandas numpy scikit-learn joblib torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Create models directory
RUN mkdir -p models

# Expose ports
EXPOSE 5000 8081 8082 8083

# Start the application
CMD ["npm", "run", "start:prod"]
