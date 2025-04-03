import os
import logging
from flask import Flask, render_template, request, jsonify
from utils.seo_analyzer import analyze_url

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze a URL and return SEO data"""
    url = request.form.get('url')
    
    if not url:
        return jsonify({
            'success': False,
            'error': 'URL is required'
        }), 400
    
    try:
        # Get SEO analysis results
        results = analyze_url(url)
        return jsonify({
            'success': True,
            'data': results
        })
    except Exception as e:
        logging.error(f"Error analyzing URL: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
