from flask import Flask, request, jsonify
from google import genai

app = Flask(__name__)

# ตั้งค่า API Key ของ Gemini
client = genai.Client(api_key="AIzaSyClgA0TxX3EWABI1HiItjfg_tPHCMncDPY")

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    message = data.get("message")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    try:
        # เรียกใช้ Gemini API สำหรับการสร้างเนื้อหาจากข้อความ
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=message
        )

        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
