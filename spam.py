import pandas as pd
import re
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import nltk

# Download stopwords (run once)
# nltk.download('stopwords')

# -----------------------------
# Sample Dataset
# -----------------------------
data = {
    "Text": [
        "You won a lottery click now",
        "Meeting at 10 am tomorrow",
        "Claim your free prize now",
        "Project submission deadline",
        "Urgent update your account",
        "Happy birthday have a nice day"
    ],
    "spam": [1, 0, 1, 0, 1, 0]
}

df = pd.DataFrame(data)

# -----------------------------
# Text Preprocessing
# -----------------------------
ps = PorterStemmer()
stop_words = set(stopwords.words('english'))

def preprocess(text):
    text = re.sub('[^a-zA-Z]', ' ', text)
    text = text.lower().split()
    text = [ps.stem(word) for word in text if word not in stop_words]
    return " ".join(text)

df["clean_text"] = df["Text"].apply(preprocess)

# -----------------------------
# Vectorization
# -----------------------------
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["clean_text"])
y = df["spam"]

# -----------------------------
# Train Model
# -----------------------------
x_train, x_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=0
)

model = MultinomialNB()
model.fit(x_train, y_train)

# -----------------------------
# Accuracy
# -----------------------------
y_pred = model.predict(x_test)
print("Accuracy:", accuracy_score(y_test, y_pred) * 100)

# -----------------------------
# Test New Email
# -----------------------------
new_email = input("Enter email text: ")
clean_email = preprocess(new_email)
vectorized_email = vectorizer.transform([clean_email])
prediction = model.predict(vectorized_email)

if prediction[0] == 1:
    print("Prediction: SPAM")
else:
    print("Prediction: HAM")
