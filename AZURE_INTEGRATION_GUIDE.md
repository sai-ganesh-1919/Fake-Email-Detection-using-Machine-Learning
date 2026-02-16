# Azure Integration Guide for Fake Email Detector

## Overview

This React frontend is designed to connect to a **Microsoft Azure-hosted Python backend** for fake email detection. The app uses Azure Machine Learning models to analyze emails and detect phishing attempts.

---

## 🏗️ Architecture

```
┌─────────────────────┐
│  React Frontend     │
│  (This App)         │
└──────────┬──────────┘
           │
           │ HTTP/HTTPS
           │ REST API
           │
┌──────────▼──────────┐
│  Azure Functions    │
│  (Python Backend)   │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │         │
┌─────▼─────┐ ┌▼────────────┐
│ Azure ML  │ │ Azure SQL   │
│  Model    │ │  Database   │
└───────────┘ └─────────────┘
```

---

## 📁 Project Structure

```
/src/app/
  ├── services/
  │   └── azureApi.ts          # All Azure API integration code
  ├── components/
  │   ├── WelcomeScreen.tsx    # Login/Authentication
  │   ├── HomeScreen.tsx       # Dashboard
  │   ├── InputScreen.tsx      # Email input & analysis trigger
  │   ├── ResultsScreen.tsx    # ML model results display
  │   └── HistoryScreen.tsx    # Analysis history
  └── routes.ts                # React Router configuration
```

---

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AZURE_API_URL=https://your-azure-function-app.azurewebsites.net/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```
<img width="1887" height="965" alt="Screenshot 2026-02-13 214046" src="https://github.com/user-attachments/assets/952d59c6-b9cd-40c2-85ab-181fd368060e" />

---

## 🔌 Azure Backend Requirements

Your Python backend needs to implement these API endpoints:

### **1. Authentication Endpoint**

**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "userId": "user_123",
  "message": "Login successful"
}
```

---

### **2. Email Analysis Endpoint**

<img width="1896" height="988" alt="Screenshot 2026-02-16 172421" src="https://github.com/user-attachments/assets/1624eabf-4f02-49cc-be75-57b4daf619be" />


**POST** `/analyze`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "emailContent": "Dear user, your account has been suspended...",
  "subject": "Urgent: Account Suspended",
  "sender": "noreply@suspicious-bank.com",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "id": "analysis_1234567890",
  "isFake": true,
  "confidence": 0.89,
  "threatLevel": "high",
  "indicators": [
    {
      "type": "Suspicious Keyword",
      "description": "Found suspicious phrase: 'suspended'",
      "severity": "high"
    },
    {
      "type": "Suspicious Link",
      "description": "Email contains external links",
      "severity": "medium"
    }
  ],
  "recommendations": [
    "Do not click any links in this email",
    "Do not provide any personal information",
    "Report this email as spam"
  ],
  "analysisTimestamp": "2026-02-13T10:30:00Z",
  "emailSubject": "Urgent: Account Suspended",
  "emailSender": "noreply@suspicious-bank.com"
}
```

---

### **3. Get History Endpoint**

<img width="1876" height="908" alt="Screenshot 2026-02-13 214014" src="https://github.com/user-attachments/assets/e9d3abf3-65cf-426c-b0d4-d0530d17fa44" />


**GET** `/history?userId={userId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "analysis_1234567890",
    "emailSubject": "Urgent: Account Suspended",
    "emailSender": "noreply@suspicious-bank.com",
    "isFake": true,
    "confidence": 0.89,
    "threatLevel": "high",
    "timestamp": "2026-02-13T10:30:00Z"
  }
]
```

---

### **4. Save History Endpoint**

**POST** `/history`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "id": "analysis_1234567890",
  "emailSubject": "Urgent: Account Suspended",
  "emailSender": "noreply@suspicious-bank.com",
  "isFake": true,
  "confidence": 0.89,
  "threatLevel": "high",
  "indicators": [...],
  "recommendations": [...],
  "analysisTimestamp": "2026-02-13T10:30:00Z"
}
```

---

### **5. Delete History Endpoint**

**DELETE** `/history/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

---

## 🤖 Python Backend (Azure Functions)

Here's a starter template for your Python Azure Function:

### `__init__.py` (Email Analysis Function)

```python
import azure.functions as func
import logging
import json
import pickle
import numpy as np
from datetime import datetime

# Load your trained ML model
# model = pickle.load(open('model.pkl', 'rb'))
# vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        req_body = req.get_json()
        email_content = req_body.get('emailContent')
        subject = req_body.get('subject', '')
        sender = req_body.get('sender', '')
        
        # TODO: Implement your ML model prediction
        # features = vectorizer.transform([email_content])
        # prediction = model.predict(features)[0]
        # confidence = model.predict_proba(features)[0][1]
        
        # Mock response for demonstration
        is_fake = True  # Replace with: bool(prediction)
        confidence = 0.89  # Replace with: float(confidence)
        
        # Determine threat level
        if confidence > 0.85:
            threat_level = 'critical'
        elif confidence > 0.65:
            threat_level = 'high'
        elif confidence > 0.4:
            threat_level = 'medium'
        else:
            threat_level = 'low'
        
        # Generate indicators
        indicators = []
        suspicious_keywords = ['urgent', 'verify', 'suspended', 'click here']
        for keyword in suspicious_keywords:
            if keyword.lower() in email_content.lower():
                indicators.append({
                    'type': 'Suspicious Keyword',
                    'description': f'Found suspicious phrase: "{keyword}"',
                    'severity': 'high'
                })
        
        # Generate recommendations
        recommendations = [
            'Do not click any links in this email',
            'Do not provide any personal information',
            'Report this email as spam'
        ] if is_fake else [
            'Email appears legitimate, but remain cautious',
            'Verify sender identity if requesting sensitive information'
        ]
        
        response = {
            'id': f'analysis_{int(datetime.now().timestamp())}',
            'isFake': is_fake,
            'confidence': confidence,
            'threatLevel': threat_level,
            'indicators': indicators,
            'recommendations': recommendations,
            'analysisTimestamp': datetime.now().isoformat(),
            'emailSubject': subject,
            'emailSender': sender
        }
        
        return func.HttpResponse(
            json.dumps(response),
            mimetype="application/json",
            status_code=200
        )
        
    except Exception as e:
        logging.error(f'Error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            mimetype="application/json",
            status_code=500
        )
```

### `function.json`

```json
{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "analyze"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
```

---

## 🗄️ Azure Database Setup

<img width="1908" height="838" alt="Screenshot 2026-02-13 213918" src="https://github.com/user-attachments/assets/24fbfcf2-02fd-4733-9d3c-c292aa31a74c" />


### Option 1: Azure SQL Database

```sql
CREATE TABLE EmailAnalyses (
    id VARCHAR(100) PRIMARY KEY,
    userId VARCHAR(100),
    emailSubject NVARCHAR(500),
    emailSender NVARCHAR(255),
    emailContent NVARCHAR(MAX),
    isFake BIT,
    confidence FLOAT,
    threatLevel VARCHAR(20),
    analysisTimestamp DATETIME,
    indicators NVARCHAR(MAX),
    recommendations NVARCHAR(MAX)
);

CREATE TABLE Users (
    id VARCHAR(100) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE,
    passwordHash NVARCHAR(255),
    createdAt DATETIME
);
```

### Option 2: Azure Cosmos DB

```python
from azure.cosmos import CosmosClient

# Initialize Cosmos DB client
client = CosmosClient(url, key)
database = client.get_database_client('FakeEmailDetector')
container = database.get_container_client('analyses')

# Save analysis
container.create_item(body=analysis_data)

# Get user history
query = "SELECT * FROM c WHERE c.userId = @userId"
items = list(container.query_items(
    query=query,
    parameters=[{"name": "@userId", "value": user_id}]
))
```

---

## 🧠 ML Model Training (Python)

### Example using scikit-learn:

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load your training data
df = pd.read_csv('email_dataset.csv')
X = df['email_content']
y = df['is_fake']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Vectorize text
vectorizer = TfidfVectorizer(max_features=5000)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train_vec, y_train)

# Evaluate
accuracy = model.score(X_test_vec, y_test)
print(f'Accuracy: {accuracy}')

# Save model
pickle.dump(model, open('model.pkl', 'wb'))
pickle.dump(vectorizer, open('vectorizer.pkl', 'wb'))
```

---

## 🚀 Deployment

### Deploy React Frontend (Azure Static Web Apps)

```bash
# Build the app
npm run build

# Deploy using Azure CLI
az staticwebapp create \
  --name fake-email-detector \
  --resource-group my-resource-group \
  --source ./dist \
  --location "East US"
```

### Deploy Python Backend (Azure Functions)

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create Azure Function App
az functionapp create \
  --resource-group my-resource-group \
  --consumption-plan-location eastus \
  --runtime python \
  --runtime-version 3.9 \
  --functions-version 4 \
  --name fake-email-detector-api \
  --storage-account mystorageaccount

# Deploy
func azure functionapp publish fake-email-detector-api
```

---

## 🔐 Security Recommendations

1. **Enable CORS** on Azure Functions to allow your frontend domain
2. **Use Azure AD** for authentication instead of custom JWT
3. **Enable HTTPS only** for all endpoints
4. **Store secrets** in Azure Key Vault, not in code
5. **Rate limit** API endpoints to prevent abuse
6. **Validate and sanitize** all user inputs
7. **Encrypt sensitive data** at rest and in transit

---

## 🧪 Testing

### Test with Mock Data (Current Setup)

The app currently uses mock responses. You can test the full flow without a backend.

### Connect to Real Azure Backend

1. Update `VITE_AZURE_API_URL` in `.env`
2. Uncomment the real API calls in `/src/app/services/azureApi.ts`
3. Comment out the mock response sections

---

## 📊 Monitoring & Analytics

Use Azure Application Insights to monitor:

- API request/response times
- Error rates
- ML model prediction accuracy
- User activity patterns

```python
from applicationinsights import TelemetryClient

tc = TelemetryClient('your-instrumentation-key')
tc.track_event('email_analyzed', {'is_fake': is_fake, 'confidence': confidence})
tc.flush()
```

---

## 🤝 Support

For questions about:
- **Frontend (React)**: Check the code in `/src/app/`
- **Azure Integration**: See `/src/app/services/azureApi.ts`
- **Python Backend**: Refer to Azure Functions documentation

---

## 📝 License

This project owns to the developer. Use responsibly and ensure compliance with data protection regulations.
