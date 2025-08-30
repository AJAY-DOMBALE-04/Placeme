# # backend/app.py
# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from resume_analyzer import analyze_resume, export_analysis_to_pdf, export_analysis_to_excel
# from io import BytesIO
# from opportunity_model import train_model, predict_opportunity, recommend_from_trends, load_dataset
# import os
# from learning_path import generate_roadmap
# from skill_gap import skill_gap_bp

# # Import only for Interview Practice
# from interview_analyzer import save_upload, analyze_file

# app = Flask(__name__)
# CORS(app)

# app.register_blueprint(skill_gap_bp, url_prefix="/api/skill-gap")

# UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # =========================
# # INTERVIEW PRACTICE ROUTE
# # =========================
# @app.route("/api/interview/analyze", methods=["POST"])
# def api_interview_analyze():
#     """
#     Expects a file field named 'file' (video or audio).
#     Returns JSON analysis from interview_analyzer.analyze_file(...)
#     """
#     try:
#         if "file" not in request.files:
#             return jsonify({"status": "error", "message": "No file provided"}), 400

#         f = request.files["file"]

#         if f.filename == "":
#             return jsonify({"status": "error", "message": "Empty filename"}), 400

#         # Save the uploaded file
#         path = save_upload(f)

#         # Analyze the saved file
#         analysis = analyze_file(path)

#         # Optionally remove saved file after analysis to save space
#         try:
#             os.remove(path)
#         except Exception:
#             pass

#         return jsonify({"status": "ok", "analysis": analysis}), 200

#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# # --- NEW: Learning path route ---
# @app.route("/api/learning-path", methods=["POST"])
# def api_learning_path():
#     """
#     Expects JSON:
#     {
#       "goal": "Frontend Developer",
#       "current_skills": ["HTML", "CSS"],
#       "hours_per_week": 6,
#       "weeks": 8
#     }
#     """
#     try:
#         data = request.get_json() or {}
#         goal = data.get("goal", "")
#         current_skills = data.get("current_skills", [])
#         hours_per_week = float(data.get("hours_per_week", 5.0))
#         weeks = int(data.get("weeks", 8))
#         roadmap = generate_roadmap(goal, current_skills, hours_per_week, weeks)
#         return jsonify({"status":"ok", "roadmap": roadmap}), 200
#     except Exception as e:
#         return jsonify({"status":"error","message": str(e)}), 500



# # =========================
# # RESUME ANALYZER ROUTES
# # =========================
# @app.route('/api/analyze-resume', methods=['POST'])
# def analyze():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file provided"}), 400
#     file = request.files['file']
#     result = analyze_resume(file)
#     return jsonify(result)

# @app.route('/api/export-pdf', methods=['POST'])
# def export_pdf():
#     data = request.json
#     pdf_bytes = export_analysis_to_pdf(data)
#     return send_file(BytesIO(pdf_bytes), download_name='analysis_report.pdf', as_attachment=True)

# @app.route('/api/export-excel', methods=['POST'])
# def export_excel():
#     data = request.json
#     excel_bytes = export_analysis_to_excel(data)
#     return send_file(BytesIO(excel_bytes), download_name='analysis_report.xlsx', as_attachment=True)


# # =========================
# # OPPORTUNITY MODEL ROUTES
# # =========================
# @app.route("/api/train-opportunity", methods=["POST"])
# def api_train():
#     try:
#         path = train_model()
#         return jsonify({"status": "ok", "message": f"Model trained: {path}"}), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

# @app.route("/api/predict-opportunity", methods=["POST"])
# def api_predict():
#     try:
#         data = request.get_json() or {}
#         branch = data.get("branch", "")
#         cgpa = float(data.get("cgpa", 0.0))
#         skills_raw = data.get("skills", "")
#         skills = [s.strip() for s in skills_raw.split(",")] if isinstance(skills_raw, str) else skills_raw
#         year = data.get("year", None)
#         res = predict_opportunity(branch, cgpa, skills, year)
#         return jsonify({"status": "ok", "prediction": res}), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# # =========================
# # RECOMMENDATION ROUTES
# # =========================
# @app.route("/api/recommend-from-trends", methods=["POST"])
# def api_recommend_trends():
#     try:
#         data = request.get_json() or {}
#         branch = data.get("branch", "")
#         cgpa = float(data.get("cgpa")) if data.get("cgpa") not in (None, "") else None
#         skills_raw = data.get("skills", "")
#         skills = [s.strip() for s in skills_raw.split(",")] if isinstance(skills_raw, str) else skills_raw
#         year = data.get("year", None)
#         top_k = int(data.get("top_k", 10))
#         res = recommend_from_trends(skills_input=skills, branch=branch, cgpa=cgpa, year=year, top_k=top_k)

#         response = {
#             "roles_for_skills": res.get("roles_for_skills", []),
#             "companies_for_skills": res.get("companies_for_skills", []),
#             "matched_students": res.get("matched_students", []),
#             "stats": res.get("stats", {}),
#             "predicted": res.get("predicted", None)
#         }
#         return jsonify({"status": "ok", "result": response}), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# # =========================
# # SAMPLE DATA ROUTE
# # =========================
# @app.route("/api/sample-data", methods=["GET"])
# def api_sample():
#     try:
#         df = load_dataset()
#         sample = df.head(20).to_dict(orient="records")
#         return jsonify({"status": "ok", "sample": sample}), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# # =========================
# # ROOT ROUTE
# # =========================
# @app.route("/", methods=["GET"])
# def root():
#     return jsonify({"message": "Placement AI API"}), 200


# if __name__ == "__main__":
#     os.makedirs(os.path.join(os.path.dirname(__file__), "models"), exist_ok=True)
#     app.run(debug=True, host="0.0.0.0", port=5000)


from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from resume_analyzer import analyze_resume, export_analysis_to_pdf, export_analysis_to_excel
from io import BytesIO
from opportunity_model import train_model, predict_opportunity, recommend_from_trends, load_dataset
import os
from learning_path import generate_roadmap
from skill_gap import skill_gap_bp
from interview_analyzer import save_upload, analyze_file
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import uuid

# ==== CONFIG ====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv()

app = Flask(__name__)
CORS(app)

# ==== MONGODB CONNECTION ====
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["placeme"]  # Database name
jobs_collection = db["jobs"]
applications_collection = db["applications"]

# ==== JOB ROUTES ====
# Route to post a job
# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Connect to MongoDB
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI is not set in .env file")

try:
    client = MongoClient(mongo_uri)
    db = client["placement_portal"]
    jobs_collection = db["jobs"]
except Exception as e:
    print("Error connecting to MongoDB:", e)
    raise e

@app.route("/api/jobs", methods=["POST"])
def create_job():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        jobs_collection.insert_one({
            "companyName": data.get("companyName"),
            "jobRole": data.get("jobRole"),
            "location": data.get("location")
        })

        return jsonify({"message": "Job posted successfully"}), 201
    except Exception as e:
        print("Error inserting job:", e)
        return jsonify({"error": "Server error"}), 500

@app.route("/api/jobs", methods=["GET"])
def get_jobs():
    try:
        jobs = list(jobs_collection.find({}, {"_id": 0}))
        return jsonify(jobs)
    except Exception as e:
        print("Error fetching jobs:", e)
        return jsonify({"error": "Server error"}), 500
    
# ==== APPLICATION ROUTE ====
@app.route("/apply/<job_id>", methods=["POST"])
def apply_job(job_id):
    try:
        data = request.form
        application = {
            "_id": str(uuid.uuid4()),
            "job_id": job_id,
            "name": data.get("name"),
            "email": data.get("email"),
            "resume": request.files["resume"].filename if "resume" in request.files else None,
            "applied_at": datetime.utcnow()
        }
        applications_collection.insert_one(application)
        return jsonify({"message": "Application submitted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==== TEST CONNECTION ====
@app.route("/test_mongo", methods=["GET"])
def test_mongo():
    try:
        db.command("ping")
        return jsonify({"message": "MongoDB Atlas connection successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==== EXISTING FEATURES ====
app.register_blueprint(skill_gap_bp, url_prefix="/api/skill-gap")

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/api/interview/analyze", methods=["POST"])
def api_interview_analyze():
    try:
        if "file" not in request.files:
            return jsonify({"status": "error", "message": "No file provided"}), 400

        f = request.files["file"]
        if f.filename == "":
            return jsonify({"status": "error", "message": "Empty filename"}), 400

        path = save_upload(f)
        analysis = analyze_file(path)

        try:
            os.remove(path)
        except Exception:
            pass

        return jsonify({"status": "ok", "analysis": analysis}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/learning-path", methods=["POST"])
def api_learning_path():
    try:
        data = request.get_json() or {}
        goal = data.get("goal", "")
        current_skills = data.get("current_skills", [])
        hours_per_week = float(data.get("hours_per_week", 5.0))
        weeks = int(data.get("weeks", 8))
        roadmap = generate_roadmap(goal, current_skills, hours_per_week, weeks)
        return jsonify({"status":"ok", "roadmap": roadmap}), 200
    except Exception as e:
        return jsonify({"status":"error","message": str(e)}), 500


@app.route('/api/analyze-resume', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files['file']
    result = analyze_resume(file)
    return jsonify(result)


@app.route('/api/export-pdf', methods=['POST'])
def export_pdf():
    data = request.json
    pdf_bytes = export_analysis_to_pdf(data)
    return send_file(BytesIO(pdf_bytes), download_name='analysis_report.pdf', as_attachment=True)


@app.route('/api/export-excel', methods=['POST'])
def export_excel():
    data = request.json
    excel_bytes = export_analysis_to_excel(data)
    return send_file(BytesIO(excel_bytes), download_name='analysis_report.xlsx', as_attachment=True)


@app.route("/api/train-opportunity", methods=["POST"])
def api_train():
    try:
        path = train_model()
        return jsonify({"status": "ok", "message": f"Model trained: {path}"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/predict-opportunity", methods=["POST"])
def api_predict():
    try:
        data = request.get_json() or {}
        branch = data.get("branch", "")
        cgpa = float(data.get("cgpa", 0.0))
        skills_raw = data.get("skills", "")
        skills = [s.strip() for s in skills_raw.split(",")] if isinstance(skills_raw, str) else skills_raw
        year = data.get("year", None)
        res = predict_opportunity(branch, cgpa, skills, year)
        return jsonify({"status": "ok", "prediction": res}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/recommend-from-trends", methods=["POST"])
def api_recommend_trends():
    try:
        data = request.get_json() or {}
        branch = data.get("branch", "")
        cgpa = float(data.get("cgpa")) if data.get("cgpa") not in (None, "") else None
        skills_raw = data.get("skills", "")
        skills = [s.strip() for s in skills_raw.split(",")] if isinstance(skills_raw, str) else skills_raw
        year = data.get("year", None)
        top_k = int(data.get("top_k", 10))
        res = recommend_from_trends(skills_input=skills, branch=branch, cgpa=cgpa, year=year, top_k=top_k)
        return jsonify({"status": "ok", "result": res}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/sample-data", methods=["GET"])
def api_sample():
    try:
        df = load_dataset()
        sample = df.head(20).to_dict(orient="records")
        return jsonify({"status": "ok", "sample": sample}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Placement AI API"}), 200


if __name__ == "__main__":
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)
    app.run(debug=True, host="0.0.0.0", port=5000)
