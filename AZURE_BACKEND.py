"""
AZURE PYTHON BACKEND
============================

This is a complete example Azure Functions project structure for your 
fake email detection backend.

PROJECT STRUCTURE:
==================

azure-backend/
├── analyze/
│   ├── __init__.py          # Email analysis function
│   └── function.json
├── auth/
│   ├── __init__.py          # Authentication function
│   └── function.json
├── history/
│   ├── __init__.py          # Get/Save/Delete history
│   └── function.json
├── models/
│   ├── ml_model.pkl         # Trained ML model
│   └── vectorizer.pkl       # Text vectorizer
├── utils/
│   ├── __init__.py
│   ├── auth.py              # Auth utilities
│   ├── database.py          # Database operations
│   └── ml_predictor.py      # ML prediction logic
├── requirements.txt
├── host.json
└── local.settings.json

"""

# ============================================================================
# FILE: analyze/__init__.py
# ============================================================================

ANALYZE_INIT_PY = '''
import azure.functions as func
import logging
import json
from datetime import datetime
import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.ml_predictor import EmailPredictor
from utils.auth import verify_token

# Initialize ML model
predictor = EmailPredictor()

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Analyze email content using ML model
    Endpoint: POST /analyze
    """
    logging.info('Email analysis request received')

    # Verify authentication
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return func.HttpResponse(
            json.dumps({'error': 'Unauthorized'}),
            mimetype="application/json",
            status_code=401
        )
    
    token = auth_header.split(' ')[1]
    user_data = verify_token(token)
    if not user_data:
        return func.HttpResponse(
            json.dumps({'error': 'Invalid token'}),
            mimetype="application/json",
            status_code=401
        )

    try:
        # Parse request
        req_body = req.get_json()
        email_content = req_body.get('emailContent', '')
        subject = req_body.get('subject', '')
        sender = req_body.get('sender', '')
        user_id = req_body.get('userId', user_data.get('userId'))
        
        if not email_content:
            return func.HttpResponse(
                json.dumps({'error': 'Email content is required'}),
                mimetype="application/json",
                status_code=400
            )
        
        # Run ML prediction
        result = predictor.predict(email_content, subject, sender)
        
        # Add metadata
        result['id'] = f'analysis_{int(datetime.now().timestamp())}_{user_id}'
        result['analysisTimestamp'] = datetime.now().isoformat()
        result['emailSubject'] = subject
        result['emailSender'] = sender
        result['userId'] = user_id
        
        logging.info(f'Analysis complete: isFake={result["isFake"]}, confidence={result["confidence"]}')
        
        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json",
            status_code=200
        )
        
    except ValueError as e:
        logging.error(f'Validation error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            mimetype="application/json",
            status_code=400
        )
    except Exception as e:
        logging.error(f'Server error: {str(e)}')
        return func.HttpResponse(
            json.dumps({'error': 'Internal server error'}),
            mimetype="application/json",
            status_code=500
        )
'''

# ============================================================================
# FILE: analyze/function.json
# ============================================================================

ANALYZE_FUNCTION_JSON = '''{
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
}'''

# ============================================================================
# FILE: auth/__init__.py
# ============================================================================

AUTH_INIT_PY = '''
import azure.functions as func
import logging
import json
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.database import get_user_by_email

# Get secret key from environment variable
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here')

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Authenticate user and return JWT token
    Endpoint: POST /auth/login
    """
    logging.info('Login request received')

    try:
        req_body = req.get_json()
        email = req_body.get('email', '')
        password = req_body.get('password', '')
        
        if not email or not password:
            return func.HttpResponse(
                json.dumps({
                    'success': False,
                    'message': 'Email and password are required'
                }),
                mimetype="application/json",
                status_code=400
            )
        
        # Get user from database
        user = get_user_by_email(email)
        
        if not user:
            return func.HttpResponse(
                json.dumps({
                    'success': False,
                    'message': 'Invalid credentials'
                }),
                mimetype="application/json",
                status_code=401
            )
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return func.HttpResponse(
                json.dumps({
                    'success': False,
                    'message': 'Invalid credentials'
                }),
                mimetype="application/json",
                status_code=401
            )
        
        # Generate JWT token
        token = jwt.encode({
            'userId': user['id'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, SECRET_KEY, algorithm='HS256')
        
        logging.info(f'User {email} logged in successfully')
        
        return func.HttpResponse(
            json.dumps({
                'success': True,
                'token': token,
                'userId': user['id'],
                'message': 'Login successful'
            }),
            mimetype="application/json",
            status_code=200
        )
        
    except Exception as e:
        logging.error(f'Login error: {str(e)}')
        return func.HttpResponse(
            json.dumps({
                'success': False,
                'message': 'Login failed'
            }),
            mimetype="application/json",
            status_code=500
        )
'''

# ============================================================================
# FILE: utils/ml_predictor.py
# ============================================================================

ML_PREDICTOR_PY = '''
import pickle
import os
import re
import numpy as np
from typing import Dict, List, Any

class EmailPredictor:
    """
    Machine Learning predictor for fake email detection
    """
    
    def __init__(self):
        """Load trained ML model and vectorizer"""
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'ml_model.pkl')
        vectorizer_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'vectorizer.pkl')
        
        # Load model (if files exist)
        # For now, we'll use rule-based detection as a fallback
        self.model = None
        self.vectorizer = None
        
        # try:
        #     with open(model_path, 'rb') as f:
        #         self.model = pickle.load(f)
        #     with open(vectorizer_path, 'rb') as f:
        #         self.vectorizer = pickle.load(f)
        # except FileNotFoundError:
        #     print("Warning: ML model files not found. Using rule-based detection.")
        
        # Suspicious patterns
        self.suspicious_keywords = [
            'urgent', 'verify', 'suspended', 'confirm', 'click here', 'act now',
            'prize', 'winner', 'congratulations', 'account security', 'unusual activity',
            'password', 'credit card', 'social security', 'bank account', 'wire transfer',
            'limited time', 'expire', 'claim', 'free', 'guaranteed'
        ]
        
        self.urgent_phrases = [
            'immediate action', 'within 24 hours', 'expire soon', 
            'last chance', 'act immediately'
        ]
    
    def predict(self, email_content: str, subject: str = '', sender: str = '') -> Dict[str, Any]:
        """
        Predict if email is fake
        
        Args:
            email_content: The body of the email
            subject: Email subject line
            sender: Sender email address
            
        Returns:
            Dictionary with prediction results
        """
        # If ML model is loaded, use it
        if self.model and self.vectorizer:
            return self._ml_predict(email_content, subject, sender)
        
        # Otherwise, use rule-based detection
        return self._rule_based_predict(email_content, subject, sender)
    
    def _ml_predict(self, email_content: str, subject: str, sender: str) -> Dict[str, Any]:
        """Use trained ML model for prediction"""
        combined_text = f"{subject} {email_content}"
        features = self.vectorizer.transform([combined_text])
        prediction = self.model.predict(features)[0]
        confidence = self.model.predict_proba(features)[0][1]
        
        return self._format_result(bool(prediction), float(confidence), email_content, subject, sender)
    
    def _rule_based_predict(self, email_content: str, subject: str, sender: str) -> Dict[str, Any]:
        """Use rule-based detection as fallback"""
        content_lower = email_content.lower()
        subject_lower = subject.lower()
        
        risk_score = 0.0
        indicators = []
        
        # Check suspicious keywords
        for keyword in self.suspicious_keywords:
            if keyword in content_lower or keyword in subject_lower:
                risk_score += 0.1
                indicators.append({
                    'type': 'Suspicious Keyword',
                    'description': f'Found suspicious phrase: "{keyword}"',
                    'severity': 'high'
                })
        
        # Check urgent phrases
        for phrase in self.urgent_phrases:
            if phrase in content_lower:
                risk_score += 0.15
                indicators.append({
                    'type': 'Urgency Tactic',
                    'description': f'Uses pressure tactic: "{phrase}"',
                    'severity': 'high'
                })
        
        # Check for links
        if 'http://' in content_lower or 'bit.ly' in content_lower or 'tinyurl' in content_lower:
            risk_score += 0.12
            indicators.append({
                'type': 'Suspicious Link',
                'description': 'Email contains potentially malicious links',
                'severity': 'medium'
            })
        
        # Check sender domain
        if sender and '@' in sender:
            domain = sender.split('@')[1] if '@' in sender else ''
            if not re.match(r'^[a-zA-Z0-9-]+\\.(com|org|edu|gov|net)$', domain):
                risk_score += 0.15
                indicators.append({
                    'type': 'Suspicious Sender',
                    'description': 'Sender email has unusual domain',
                    'severity': 'high'
                })
        
        # Check for ALL CAPS (shouting)
        caps_words = sum(1 for word in email_content.split() if word.isupper() and len(word) > 3)
        if caps_words > 5:
            risk_score += 0.1
            indicators.append({
                'type': 'Suspicious Formatting',
                'description': 'Excessive use of capital letters',
                'severity': 'low'
            })
        
        # Calculate confidence
        confidence = min(0.99, risk_score)
        is_fake = confidence > 0.5
        
        return self._format_result(is_fake, confidence, email_content, subject, sender, indicators)
    
    def _format_result(self, is_fake: bool, confidence: float, 
                      email_content: str, subject: str, sender: str,
                      indicators: List[Dict] = None) -> Dict[str, Any]:
        """Format prediction result"""
        
        # Determine threat level
        if confidence > 0.85:
            threat_level = 'critical'
        elif confidence > 0.65:
            threat_level = 'high'
        elif confidence > 0.4:
            threat_level = 'medium'
        else:
            threat_level = 'low'
        
        # Generate recommendations
        if is_fake:
            recommendations = [
                'Do not click any links in this email',
                'Do not provide any personal or financial information',
                'Mark this email as spam and delete it',
                'Report this email to your IT security team',
                'Verify sender identity through official channels'
            ]
        else:
            recommendations = [
                'Email appears legitimate, but remain cautious',
                'Verify sender identity if requesting sensitive information',
                'Check for grammar and spelling errors',
                'Hover over links before clicking to verify destinations'
            ]
        
        return {
            'isFake': is_fake,
            'confidence': confidence,
            'threatLevel': threat_level,
            'indicators': indicators or [],
            'recommendations': recommendations
        }
'''

# ============================================================================
# FILE: utils/database.py
# ============================================================================

DATABASE_PY = '''
import os
from azure.cosmos import CosmosClient, exceptions
import logging

# Initialize Cosmos DB client
COSMOS_URL = os.environ.get('COSMOS_DB_URL')
COSMOS_KEY = os.environ.get('COSMOS_DB_KEY')
DATABASE_NAME = 'FakeEmailDetector'

client = None
database = None

def initialize_cosmos():
    """Initialize Cosmos DB connection"""
    global client, database
    if COSMOS_URL and COSMOS_KEY:
        client = CosmosClient(COSMOS_URL, COSMOS_KEY)
        database = client.get_database_client(DATABASE_NAME)
    else:
        logging.warning("Cosmos DB credentials not configured")

# Initialize on module load
initialize_cosmos()

def get_user_by_email(email: str):
    """Get user from database by email"""
    # TODO: Implement actual database query
    # For now, return mock user for demo purposes
    if email == 'demo@example.com':
        import bcrypt
        return {
            'id': 'demo_user',
            'email': 'demo@example.com',
            'password_hash': bcrypt.hashpw('demo'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        }
    return None

def save_analysis(analysis_data: dict):
    """Save analysis to database"""
    if database:
        container = database.get_container_client('analyses')
        container.create_item(body=analysis_data)
    else:
        logging.warning("Database not initialized")

def get_user_history(user_id: str):
    """Get user's analysis history"""
    if database:
        container = database.get_container_client('analyses')
        query = "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.analysisTimestamp DESC"
        items = list(container.query_items(
            query=query,
            parameters=[{"name": "@userId", "value": user_id}],
            enable_cross_partition_query=True
        ))
        return items
    return []

def delete_analysis(analysis_id: str):
    """Delete analysis from database"""
    if database:
        container = database.get_container_client('analyses')
        container.delete_item(item=analysis_id, partition_key=analysis_id)
'''

# ============================================================================
# FILE: utils/auth.py
# ============================================================================

AUTH_UTILS_PY = '''
import jwt
import os
from datetime import datetime

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here')

def verify_token(token: str):
    """Verify JWT token and return user data"""
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
'''

# ============================================================================
# FILE: host.json
# ============================================================================

HOST_JSON = '''{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "extensions": {
    "http": {
      "routePrefix": "api"
    }
  }
}'''

# ============================================================================
# FILE: local.settings.json
# ============================================================================

LOCAL_SETTINGS_JSON = '''{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "JWT_SECRET_KEY": "your-secret-key-for-jwt",
    "COSMOS_DB_URL": "https://your-cosmos-db.documents.azure.com:443/",
    "COSMOS_DB_KEY": "your-cosmos-db-key-here"
  }
}'''

print("Azure Python Backend Code Examples Generated")
print("=" * 70)
print("\\nCopy the code snippets above to create your Azure Functions backend.")
print("\\nMain files to create:")
print("  - analyze/__init__.py")
print("  - auth/__init__.py")
print("  - utils/ml_predictor.py")
print("  - utils/database.py")
print("  - utils/auth.py")
print("  - host.json")
print("  - local.settings.json")
