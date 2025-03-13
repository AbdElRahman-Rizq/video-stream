from flask import Flask, request, jsonify
import subprocess
import json

app = Flask(__name__)

@app.route('/get_video', methods=['GET'])
def get_video():
    video_id = request.args.get('video_id')
    if not video_id:
        return jsonify({"error": "Missing video_id"}), 400

    try:
        result = subprocess.run(
            ["python3", "scripts/fetch_streams.py", video_id], 
            capture_output=True, text=True
        )
        if result.stderr:
            return jsonify({"error": result.stderr}), 500
        
        return jsonify(json.loads(result.stdout))
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Expose the service on port 5001
