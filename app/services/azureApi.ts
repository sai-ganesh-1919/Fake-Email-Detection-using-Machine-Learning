/**
 * Azure API Service
 * 
 * This file contains all API calls to your Azure-hosted Python backend.
 * Replace the AZURE_API_BASE_URL with your actual Azure endpoint.
 */

// TODO: Replace this with your actual Azure API endpoint
const AZURE_API_BASE_URL = import.meta.env.VITE_AZURE_API_URL || 'https://your-azure-function-app.azurewebsites.net/api';

// TODO: If using Azure AD authentication, add your token here
const getAuthHeaders = () => {
  const token = localStorage.getItem('azure_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export interface EmailAnalysisRequest {
  emailContent: string;
  subject?: string;
  sender?: string;
  userId?: string;
}

export interface EmailAnalysisResponse {
  id: string;
  isFake: boolean;
  confidence: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  recommendations: string[];
  analysisTimestamp: string;
  emailSubject?: string;
  emailSender?: string;
}

export interface HistoryItem {
  id: string;
  emailSubject: string;
  emailSender: string;
  isFake: boolean;
  confidence: number;
  threatLevel: string;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  userId?: string;
  message?: string;
}

/**
 * Login user via Azure authentication
 * Azure Endpoint: POST /auth/login
 */
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    // UNCOMMENT THIS WHEN YOUR AZURE BACKEND IS READY:
    // const response = await fetch(`${AZURE_API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Login failed');
    // }
    // 
    // const data = await response.json();
    // if (data.token) {
    //   localStorage.setItem('azure_auth_token', data.token);
    // }
    // return data;

    // MOCK RESPONSE (Remove when Azure backend is ready):
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockToken = 'mock_azure_token_' + Date.now();
    localStorage.setItem('azure_auth_token', mockToken);
    return {
      success: true,
      token: mockToken,
      userId: 'user_123',
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Analyze email content using Azure ML model
 * Azure Endpoint: POST /analyze
 * 
 * Expected Python backend structure:
 * - Receives email content, subject, sender
 * - Runs ML model (e.g., sklearn, TensorFlow, PyTorch)
 * - Returns prediction with confidence score
 */
export const analyzeEmail = async (request: EmailAnalysisRequest): Promise<EmailAnalysisResponse> => {
  try {
    // UNCOMMENT THIS WHEN YOUR AZURE BACKEND IS READY:
    // const response = await fetch(`${AZURE_API_BASE_URL}/analyze`, {
    //   method: 'POST',
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify(request),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || 'Analysis failed');
    // }
    // 
    // return await response.json();

    // MOCK RESPONSE (Remove when Azure backend is ready):
    // This simulates what your Python Azure Function should return
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    const content = request.emailContent.toLowerCase();
    const suspiciousKeywords = ['urgent', 'verify', 'suspended', 'click here', 'prize', 'winner', 'act now', 'limited time'];
    const foundKeywords = suspiciousKeywords.filter(keyword => content.includes(keyword));
    
    const baseConfidence = foundKeywords.length > 0 ? 0.85 : 0.25;
    const confidence = Math.min(0.98, baseConfidence + (Math.random() * 0.1));
    const isFake = confidence > 0.5;

    const threatLevel: 'low' | 'medium' | 'high' | 'critical' = 
      confidence > 0.85 ? 'critical' : 
      confidence > 0.65 ? 'high' : 
      confidence > 0.4 ? 'medium' : 'low';

    const indicators = foundKeywords.map(keyword => ({
      type: 'Suspicious Keyword',
      description: `Found suspicious phrase: "${keyword}"`,
      severity: 'high' as const,
    }));

    if (content.includes('http') || content.includes('www.')) {
      indicators.push({
        type: 'Suspicious Link',
        description: 'Email contains external links',
        severity: 'medium' as const,
      });
    }

    const recommendations = isFake
      ? [
          'Do not click any links in this email',
          'Do not provide any personal or financial information',
          'Mark this email as spam and delete it',
          'Report this email to your IT security team',
          'Verify sender identity through official channels',
        ]
      : [
          'Email appears legitimate, but remain cautious',
          'Verify sender identity if requesting sensitive information',
          'Check for grammar and spelling errors',
        ];

    return {
      id: 'analysis_' + Date.now(),
      isFake,
      confidence,
      threatLevel,
      indicators,
      recommendations,
      analysisTimestamp: new Date().toISOString(),
      emailSubject: request.subject,
      emailSender: request.sender,
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};

/**
 * Get user's analysis history from Azure database
 * Azure Endpoint: GET /history?userId={userId}
 * 
 * Expected to query Azure SQL Database, CosmosDB, or similar
 */
export const getAnalysisHistory = async (userId?: string): Promise<HistoryItem[]> => {
  try {
    // UNCOMMENT THIS WHEN YOUR AZURE BACKEND IS READY:
    // const url = userId 
    //   ? `${AZURE_API_BASE_URL}/history?userId=${userId}`
    //   : `${AZURE_API_BASE_URL}/history`;
    // 
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: getAuthHeaders(),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to fetch history');
    // }
    // 
    // return await response.json();

    // MOCK RESPONSE (Remove when Azure backend is ready):
    // For now, use localStorage to persist history
    await new Promise(resolve => setTimeout(resolve, 500));
    const history = localStorage.getItem('email_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('History fetch error:', error);
    throw error;
  }
};

/**
 * Save analysis result to Azure database
 * Azure Endpoint: POST /history
 */
export const saveAnalysisToHistory = async (analysis: EmailAnalysisResponse): Promise<void> => {
  try {
    // UNCOMMENT THIS WHEN YOUR AZURE BACKEND IS READY:
    // await fetch(`${AZURE_API_BASE_URL}/history`, {
    //   method: 'POST',
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify(analysis),
    // });

    // MOCK IMPLEMENTATION (Remove when Azure backend is ready):
    const historyItem: HistoryItem = {
      id: analysis.id,
      emailSubject: analysis.emailSubject || 'No Subject',
      emailSender: analysis.emailSender || 'Unknown',
      isFake: analysis.isFake,
      confidence: analysis.confidence,
      threatLevel: analysis.threatLevel,
      timestamp: analysis.analysisTimestamp,
    };

    const history = await getAnalysisHistory();
    const updatedHistory = [historyItem, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem('email_history', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Save history error:', error);
  }
};

/**
 * Delete history item
 * Azure Endpoint: DELETE /history/{id}
 */
export const deleteHistoryItem = async (id: string): Promise<void> => {
  try {
    // UNCOMMENT THIS WHEN YOUR AZURE BACKEND IS READY:
    // await fetch(`${AZURE_API_BASE_URL}/history/${id}`, {
    //   method: 'DELETE',
    //   headers: getAuthHeaders(),
    // });

    // MOCK IMPLEMENTATION:
    const history = await getAnalysisHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem('email_history', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Delete history error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('azure_auth_token');
  localStorage.removeItem('user_id');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('azure_auth_token');
};
