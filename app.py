from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
import nltk
import pickle
import numpy as np
import json
import random
from nltk.stem import WordNetLemmatizer
from googletrans import Translator

lemmatizer = WordNetLemmatizer()
model = load_model('model.h5')
intents = json.load(open('intents.json'))
words = pickle.load(open('texts.pkl', 'rb'))
classes = pickle.load(open('labels.pkl', 'rb'))

translator = Translator()

app = Flask(__name__)
app.static_folder = 'static'

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    return [lemmatizer.lemmatize(word.lower()) for word in sentence_words]

def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

def predict_class(sentence):
    p = bow(sentence, words)
    res = model.predict(np.array([p]))[0]
    threshold = 0.25
    return [{"intent": classes[i], "probability": str(prob)} for i, prob in enumerate(res) if prob > threshold]

def get_response(intents_list):
    if not intents_list:
        return "Sorry, I couldn't understand."
    tag = intents_list[0]['intent']
    for i in intents["intents"]:
        if i["tag"] == tag:
            return random.choice(i["responses"])

@app.route('/')
def home():
    return render_template('index.html')
import traceback  # <-- Add this at the top

...

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_msg = data.get("msg")
        detected = translator.detect(user_msg)
        lang = detected.lang

        # Translate to English
        if lang != "en":
            user_msg_translated = translator.translate(user_msg, src=lang, dest="en").text
        else:
            user_msg_translated = user_msg

        intents_list = predict_class(user_msg_translated)
        response_en = get_response(intents_list)

        # Translate back to original
        if lang != "en":
            response_final = translator.translate(response_en, src="en", dest=lang).text
        else:
            response_final = response_en

        return jsonify({'response': response_final})

    except Exception as e:
        print("🔥 ERROR:", e)
        traceback.print_exc()  # <-- Add this line to print full traceback
        return jsonify({'response': 'Internal Server Error'}), 500



if __name__ == '__main__':
    app.run(debug=True)
