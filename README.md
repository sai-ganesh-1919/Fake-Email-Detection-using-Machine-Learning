# Fake-Email-Detection-using-Machine-Learning
*Problem Statement*
Email communication is widely used for business, banking, education, and personal communication. However, fake emails such as spam and phishing attacks are increasing rapidly.

These emails:
Steal personal information
Cause financial fraud
Spread malware
Reduce organizational security

Currently, many users manually identify spam emails, which is inefficient and unreliable.
Therefore, there is a need for an automated system that can accurately detect fake emails using Machine Learning techniques.

*System Requirements*
Hardware Requirements:
Minimum 4GB RAM
Internet connection

Software Requirements:
Python 3.x
Jupyter Notebook / VS Code
Microsoft Azure Account
Figma

*Libraries Required*
pandas
numpy
nltk
scikit-learn
flask (for deployment)

*Algorithm Selection*
The selected algorithm is Multinomial Naive Bayes.
Reason for selection:

Suitable for text classification
High accuracy for spam detection
Fast processing
Works efficiently with TF-IDF features

*Deployment on Microsoft Azure*

The system is deployed using:
Azure Machine Learning
Azure App Service

Deployment Steps:
Create Azure ML Workspace
Upload dataset
Train model using AutoML
Deploy as Real-time endpoint
Generate REST API

*Result*
<img width="1887" height="965" alt="Screenshot 2026-02-13 214046" src="https://github.com/user-attachments/assets/378b1ab8-e917-4127-a5d8-9b04eb6fbb25" />

<img width="1908" height="838" alt="Screenshot 2026-02-13 213918" src="https://github.com/user-attachments/assets/2d0d6c7a-773e-4cce-bb30-8017c7053fbe" />

<img width="1876" height="908" alt="Screenshot 2026-02-13 214014" src="https://github.com/user-attachments/assets/c02dd032-b6cf-4eeb-b1fb-04c002882562" />


Model Performance Metrics:
Accuracy: 95% – 98%
Precision: High spam detection rate
Recall: Reduced false negatives

Confusion Matrix Example:

Predicted        Spam	  Predicted Ham

Actual Spam	      95         	5

Actual Ham        	3     	97

The system successfully detects fake emails with high accuracy.
