# Port Configuration Documentation

This document outlines the standardized port configuration for the SafePay UPI Scam Detection application. Consistent port configuration across all services is essential for proper communication between components.

## Port Assignments

| Service                | Port | Environment Variable       |
|------------------------|------|----------------------------|
| Main Express Server    | 8080 | PORT                       |
| ML QR Service          | 8081 | ML_QR_SERVICE_PORT         |
| ML Voice/Text Service  | 8082 | ML_VOICE_TEXT_SERVICE_PORT |
| ML Video Service       | 8083 | ML_VIDEO_SERVICE_PORT      |

## Implementation Details

### Environment Files

#### .env.example
```
# Server Configuration
PORT=8080
NODE_ENV="development"

# ML Service Ports - must be different from main PORT
ML_QR_SERVICE_PORT=8081
ML_VOICE_TEXT_SERVICE_PORT=8082
ML_VIDEO_SERVICE_PORT=8083
```

#### .env
Updated with consistent port configurations matching .env.example.

### Server Files

#### server/index.ts
Updated to use the PORT environment variable with a default of 8080:
```javascript
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
server.listen(PORT, "0.0.0.0", () => {
  log(`[express] Server running on port ${PORT}`);
});
```

### Route Handlers

#### server/routes/optimized-qr-scan.ts
```javascript
const QR_ML_SERVICE_PORT = process.env.ML_QR_SERVICE_PORT || 8081;
const QR_ML_SERVICE_URL = `http://localhost:${QR_ML_SERVICE_PORT}`;
```

#### server/routes/ml-qr-scan.ts
```javascript
const QR_ML_SERVICE_PORT = process.env.ML_QR_SERVICE_PORT || 8081;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || `http://localhost:${QR_ML_SERVICE_PORT}`;
```

#### server/routes/voice-text-ml.ts
```javascript
const VOICE_TEXT_ML_SERVICE_PORT = process.env.ML_VOICE_TEXT_SERVICE_PORT || 8082;
const ML_SERVICE_URL = `http://localhost:${VOICE_TEXT_ML_SERVICE_PORT}`;
```

#### server/routes/advanced-qr-scan.ts
```javascript
const QR_ML_SERVICE_PORT = process.env.ML_QR_SERVICE_PORT || 8081;
const QR_ML_SERVICE_URL = `http://localhost:${QR_ML_SERVICE_PORT}`;
```

### Python Services

#### voice_text_scam_service.py
```python
port = int(os.getenv("ML_VOICE_TEXT_SERVICE_PORT", 8082))
```

#### qr_scam_service.py
```python
port = int(os.environ.get("ML_QR_SERVICE_PORT", 8081))
app.run(host='0.0.0.0', port=port, debug=False)
```

#### qr_scan_ml_service.py
```python
port = int(os.environ.get("ML_QR_SERVICE_PORT", 8081))
uvicorn.run(app, host="0.0.0.0", port=port)
```

#### optimized_qr_risk_service.py
```python
port = int(os.environ.get("ML_QR_SERVICE_PORT", 8081))
uvicorn.run(app, host="0.0.0.0", port=port)
```

### Deployment Configuration

#### .replit.deploy
```
[env]
PORT = "8080"
NODE_ENV = "production"
ML_QR_SERVICE_PORT = "8081"
ML_VOICE_TEXT_SERVICE_PORT = "8082"
ML_VIDEO_SERVICE_PORT = "8083"

[workflow]
defaultPort = 8080
```

## Troubleshooting

If services cannot communicate:
1. Verify that the correct ports are being used in both the client and server components
2. Check that environment variables are properly set
3. Ensure no port conflicts with other services
4. Verify the server is listening on 0.0.0.0 to accept connections from all interfaces

## Best Practices

1. Use environment variables for ports, never hardcode them
2. Always provide sensible defaults that match the standardized configuration
3. When adding new services, use ports in the 8084+ range to avoid conflicts
4. Document any port changes in this file