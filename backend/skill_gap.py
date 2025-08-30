# backend/skill_gap.py
from flask import Blueprint, jsonify, request
import random
from typing import Dict, List, Any

skill_gap_bp = Blueprint("skill_gap", __name__)

# === Sample static role/skills/quiz database (extend as needed) ===
# For each role we provide: skills (with benchmark %) and quiz questions per skill.
ROLES = {
    "Frontend Developer": {
        "skills": [
            {"name": "JavaScript", "benchmark": 95},
            {"name": "React", "benchmark": 90},
            {"name": "CSS", "benchmark": 85},
            {"name": "Git", "benchmark": 80},
        ],
        "questions": {
            "JavaScript": [
                {
                    "id": "js_q1",
                    "question": "Which keyword declares a block-scoped variable in JavaScript?",
                    "options": ["var", "let", "const", "function"],
                    "answer": 1,  # let (we treat let as block scoped; const also, but question expects let)
                },
                {
                    "id": "js_q2",
                    "question": "What will typeof NaN return?",
                    "options": ["'number'", "'NaN'", "'undefined'", "'object'"],
                    "answer": 0,
                },
            ],
            "React": [
                {
                    "id": "react_q1",
                    "question": "Which hook is used to manage state in functional React components?",
                    "options": ["useEffect", "useState", "useRef", "useContext"],
                    "answer": 1,
                },
                {
                    "id": "react_q2",
                    "question": "What is the virtual DOM primarily used for?",
                    "options": [
                        "Storing data permanently",
                        "Optimizing DOM updates",
                        "Handling HTTP requests",
                        "Querying databases",
                    ],
                    "answer": 1,
                },
            ],
            "CSS": [
                {
                    "id": "css_q1",
                    "question": "Which property controls the space between words?",
                    "options": ["letter-spacing", "word-spacing", "text-indent", "line-height"],
                    "answer": 1,
                }
            ],
            "Git": [
                {
                    "id": "git_q1",
                    "question": "Which command creates a new branch called feature?",
                    "options": ["git branch feature", "git checkout feature", "git init feature", "git commit -b feature"],
                    "answer": 0,
                }
            ],
        },
    },
    "Data Scientist": {
        "skills": [
            {"name": "Python", "benchmark": 95},
            {"name": "Pandas", "benchmark": 85},
            {"name": "Machine Learning", "benchmark": 80},
            {"name": "SQL", "benchmark": 75},
        ],
        "questions": {
            "Python": [
                {
                    "id": "py_q1",
                    "question": "Which keyword starts a function definition in Python?",
                    "options": ["func", "def", "function", "lambda"],
                    "answer": 1,
                }
            ],
            "Pandas": [
                {
                    "id": "pd_q1",
                    "question": "Which pandas method reads a CSV into a DataFrame?",
                    "options": ["pd.load_csv", "pd.read_csv", "pd.open_csv", "pd.csv_read"],
                    "answer": 1,
                }
            ],
            "Machine Learning": [
                {
                    "id": "ml_q1",
                    "question": "Which of the following is a supervised learning task?",
                    "options": ["Clustering", "Dimensionality reduction", "Linear regression", "PCA"],
                    "answer": 2,
                }
            ],
            "SQL": [
                {
                    "id": "sql_q1",
                    "question": "Which SQL clause filters rows returned by a SELECT?",
                    "options": ["GROUP BY", "ORDER BY", "WHERE", "HAVING"],
                    "answer": 2,
                }
            ],
        },
    },
}


def _get_role_or_404(role: str) -> Dict[str, Any]:
    if not role or role not in ROLES:
        raise ValueError("Invalid role")
    return ROLES[role]


# Utility: return roles and skills/benchmarks (public)
@skill_gap_bp.route("/roles", methods=["GET"])
def api_roles():
    out = []
    for role_name, info in ROLES.items():
        out.append({"role": role_name, "skills": info["skills"]})
    return jsonify({"status": "ok", "roles": out})


# Get quiz questions for a role (we strip internal 'answer' keys before sending)
@skill_gap_bp.route("/quiz", methods=["GET"])
def api_quiz_for_role():
    role = request.args.get("role")
    try:
        info = _get_role_or_404(role)
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid or missing role parameter"}), 400

    questions = []
    for skill, qlist in info.get("questions", {}).items():
        for q in qlist:
            qcopy = {"id": q["id"], "skill": skill, "question": q["question"], "options": q["options"]}
            questions.append(qcopy)

    # Optionally shuffle questions
    random.shuffle(questions)
    return jsonify({"status": "ok", "role": role, "questions": questions})


# Score submitted answers and produce skill-level scores + recommended learning path
@skill_gap_bp.route("/score", methods=["POST"])
def api_score_quiz():
    data = request.get_json() or {}
    role = data.get("role")
    answers: Dict[str, int] = data.get("answers", {})  # { question_id: selected_index }

    try:
        role_info = _get_role_or_404(role)
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid or missing role"}), 400

    # Build lookup for correct answers
    correct_lookup: Dict[str, Dict[str, Any]] = {}
    for skill, qlist in role_info.get("questions", {}).items():
        for q in qlist:
            correct_lookup[q["id"]] = {"answer": q["answer"], "skill": skill}

    # Tally per-skill correct / total
    skill_tally: Dict[str, Dict[str, int]] = {}
    for qid, meta in correct_lookup.items():
        skill = meta["skill"]
        skill_tally.setdefault(skill, {"correct": 0, "total": 0})
        skill_tally[skill]["total"] += 1
        selected = answers.get(qid)
        if isinstance(selected, int) and selected == meta["answer"]:
            skill_tally[skill]["correct"] += 1

    # Convert to percentages and proficiency levels
    skill_scores = []
    missing_skills = []
    for s in role_info["skills"]:
        sname = s["name"]
        tally = skill_tally.get(sname, {"correct": 0, "total": 0})
        total = max(tally["total"], 1)  # avoid divide by zero
        pct = round((tally["correct"] / total) * 100, 1)
        # Map to a simple proficiency label
        if pct >= 80:
            prof = "Proficient"
        elif pct >= 50:
            prof = "Intermediate"
        else:
            prof = "Beginner"
        skill_scores.append({"skill": sname, "score_pct": pct, "proficiency": prof, "benchmark": s["benchmark"]})
        if pct < 70:  # treat <70 as a 'gap' for this demo
            missing_skills.append({"skill": sname, "score_pct": pct, "proficiency": prof})

    # Generate short actionable quick wins for missing skills
    quick_actions: List[str] = []
    for ms in missing_skills:
        skill = ms["skill"]
        quick_actions.append(f"Spend 2-4 hours on a focused tutorial for {skill} (e.g. a hands-on mini-project).")

    # Build a simple generated learning path for missing skills
    learning_path = _generate_learning_path([m["skill"] for m in missing_skills], role)

    response = {
        "status": "ok",
        "role": role,
        "skill_scores": skill_scores,
        "missing_skills": missing_skills,
        "quick_actions": quick_actions,
        "learning_path": learning_path,
    }
    return jsonify(response)


def _generate_learning_path(missing_skills: List[str], role: str) -> List[Dict[str, Any]]:
    """
    Create a small multi-module plan for each missing skill.
    This is static for demo purposes; replace with ML or content API for production.
    """
    modules_db = {
        "JavaScript": [
            {"title": "JS Fundamentals (2 hours)", "duration_mins": 120, "resource": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"},
            {"title": "ES6+ Solid Patterns (2 hours)", "duration_mins": 120, "resource": "https://javascript.info/"},
            {"title": "Mini project: To-do list app (3 hours)", "duration_mins": 180, "resource": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"},
        ],
        "React": [
            {"title": "React Basics (2 hours)", "duration_mins": 120, "resource": "https://reactjs.org/docs/getting-started.html"},
            {"title": "Hooks & State Management (2 hours)", "duration_mins": 120, "resource": "https://beta.reactjs.org/learn"},
            {"title": "Build a small SPA (3 hours)", "duration_mins": 180, "resource": "https://www.freecodecamp.org/news/learn-react-by-building-a-simple-app/"},
        ],
        "CSS": [
            {"title": "CSS Fundamentals (1.5 hours)", "duration_mins": 90, "resource": "https://developer.mozilla.org/en-US/docs/Learn/CSS"},
            {"title": "Layout practice (Flexbox & Grid) (2 hours)", "duration_mins": 120, "resource": "https://css-tricks.com/snippets/css/complete-guide-grid/"},
        ],
        "Git": [
            {"title": "Git Basics (1 hour)", "duration_mins": 60, "resource": "https://git-scm.com/docs/gittutorial"},
            {"title": "Branching workflows (1 hour)", "duration_mins": 60, "resource": "https://www.atlassian.com/git/tutorials/using-branches"},
        ],
        "Python": [
            {"title": "Python Basics (3 hours)", "duration_mins": 180, "resource": "https://docs.python.org/3/tutorial/"},
            {"title": "Small Python project (2 hours)", "duration_mins": 120, "resource": "https://www.learnpython.org/"},
        ],
        "Pandas": [
            {"title": "Pandas fundamentals (2 hours)", "duration_mins": 120, "resource": "https://pandas.pydata.org/docs/getting_started/index.html"},
            {"title": "Data cleaning practice (2 hours)", "duration_mins": 120, "resource": "https://www.kaggle.com/learn/pandas"},
        ],
        "Machine Learning": [
            {"title": "Intro to ML (2 hours)", "duration_mins": 120, "resource": "https://www.coursera.org/learn/machine-learning"},
            {"title": "Supervised models practice (3 hours)", "duration_mins": 180, "resource": "https://www.kaggle.com/learn/intro-to-machine-learning"},
        ],
        "SQL": [
            {"title": "SQL Basics (1.5 hours)", "duration_mins": 90, "resource": "https://www.w3schools.com/sql/"},
        ],
    }

    path: List[Dict[str, Any]] = []
    for skill in missing_skills:
        mods = modules_db.get(skill, [{"title": f"Intro to {skill}", "duration_mins": 60, "resource": "https://www.google.com"}])
        path.append({"skill": skill, "modules": mods})
    return path


# Optional: endpoint to generate path directly from missing skills (if frontend wants it)
@skill_gap_bp.route("/generate-path", methods=["POST"])
def api_generate_path():
    data = request.get_json() or {}
    missing = data.get("missing_skills", [])
    role = data.get("role", "Custom")
    path = _generate_learning_path(missing, role)
    return jsonify({"status": "ok", "learning_path": path})
