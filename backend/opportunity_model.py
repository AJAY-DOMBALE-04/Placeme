# backend/opportunity_model.py
import os
import re
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import MultiLabelBinarizer
from typing import List, Dict, Any

ROOT = os.path.dirname(__file__)
DATA_PATH = os.path.join(ROOT, "data", "students_opportunities.csv")
MODEL_DIR = os.path.join(ROOT, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "opportunity_model.joblib")

_model_store = None
_mlb = None
_feature_columns = None
_df_cache = None

def _normalize_skill_string(s: str) -> List[str]:
    if not isinstance(s, str):
        return []
    parts = re.split(r"[;,|]", s)
    parts = [p.strip().lower() for p in parts if p and p.strip()]
    return parts

def load_dataset() -> pd.DataFrame:
    global _df_cache
    if _df_cache is not None:
        return _df_cache
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    df.columns = [c.strip() for c in df.columns]
    required = {"StudentName","RollNumber","Branch","CGPA","Skills","Company","JobRole","Package","Year","OpportunityType"}
    if not required.issubset(set(df.columns)):
        missing = required - set(df.columns)
        raise ValueError(f"CSV is missing required columns: {missing}")
    df["Skills"] = df["Skills"].fillna("").astype(str)
    df["Branch"] = df["Branch"].fillna("").astype(str)
    df["CGPA"] = pd.to_numeric(df["CGPA"], errors="coerce").fillna(0.0)
    df["Package"] = pd.to_numeric(df["Package"], errors="coerce").fillna(0.0)
    df["Year"] = pd.to_numeric(df["Year"], errors="coerce").fillna(0).astype(int)
    df["_skill_list"] = df["Skills"].apply(_normalize_skill_string)
    _df_cache = df
    return _df_cache

# --- training and model persistence (unchanged from before) ---
def train_model(random_state=42):
    global _model_store, _mlb, _feature_columns
    df = load_dataset()
    _mlb = MultiLabelBinarizer(sparse_output=False)
    skill_matrix = _mlb.fit_transform(df["_skill_list"])
    skill_cols = [f"skill__{s}" for s in _mlb.classes_]
    branches = pd.get_dummies(df["Branch"].str.strip().str.upper(), prefix="branch")
    numeric = df[["CGPA", "Year"]].reset_index(drop=True)
    skill_df = pd.DataFrame(skill_matrix, columns=skill_cols)
    X = pd.concat([branches.reset_index(drop=True), numeric, skill_df], axis=1).fillna(0)
    y_role = df["JobRole"].astype(str).reset_index(drop=True)
    y_company = df["Company"].astype(str).reset_index(drop=True)
    y_package = df["Package"].astype(float).reset_index(drop=True)
    role_model = RandomForestClassifier(n_estimators=200, random_state=random_state)
    company_model = RandomForestClassifier(n_estimators=200, random_state=random_state)
    package_model = RandomForestRegressor(n_estimators=200, random_state=random_state)
    role_model.fit(X, y_role)
    company_model.fit(X, y_company)
    package_model.fit(X, y_package)
    _model_store = {"role": role_model, "company": company_model, "package": package_model}
    _feature_columns = X.columns.tolist()
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({"models": _model_store, "mlb": _mlb, "feature_columns": _feature_columns}, MODEL_PATH)
    return MODEL_PATH

def load_model():
    global _model_store, _mlb, _feature_columns
    if _model_store is not None:
        return
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not found. Train first.")
    saved = joblib.load(MODEL_PATH)
    _model_store = saved["models"]
    _mlb = saved["mlb"]
    _feature_columns = saved["feature_columns"]

def _build_input_vector(branch: str, cgpa: float, skills_input: List[str], year: int):
    load_model()
    base = {c: 0 for c in _feature_columns}
    branch_col = f"branch_{branch.strip().upper()}" if branch else None
    if branch_col and branch_col in base:
        base[branch_col] = 1
    if "CGPA" in base:
        base["CGPA"] = float(cgpa)
    if "Year" in base:
        base["Year"] = int(year) if year is not None else 0
    skills_norm = [s.strip().lower() for s in skills_input if s and isinstance(s, str)]
    try:
        skills_vec = _mlb.transform([skills_norm])[0]
    except Exception:
        skills_vec = np.array([1 if s in skills_norm else 0 for s in _mlb.classes_])
    for i, sname in enumerate(_mlb.classes_):
        col = f"skill__{sname}"
        if col in base:
            base[col] = int(skills_vec[i])
    return pd.DataFrame([base], columns=_feature_columns)

def predict_opportunity(branch: str, cgpa: float, skills: List[str], year: int = None) -> Dict[str, Any]:
    load_model()
    Xrow = _build_input_vector(branch, cgpa, skills, year or 0)
    role_pred = _model_store["role"].predict(Xrow)[0]
    company_pred = _model_store["company"].predict(Xrow)[0]
    package_pred = float(_model_store["package"].predict(Xrow)[0])
    return {"company": company_pred, "role": role_pred, "package": round(package_pred, 2)}

# ---------------- recommend-from-trends (UPDATED) ----------------
def recommend_from_trends(skills_input: List[str], branch: str = None, cgpa: float = None, year: int = None, top_k: int = 10):
    """
    Returns:
      {
        "matched_students": [...],
        "stats": {...},
        "predicted": {...} or None,
        "roles_for_skills": [...],
        "companies_for_skills": [...]
      }
    """
    df = load_dataset()
    s_norm = [s.strip().lower() for s in skills_input if s and isinstance(s, str)]
    if len(s_norm) == 0:
        return {"matched_students": [], "stats": {}, "predicted": None, "roles_for_skills": [], "companies_for_skills": []}

    # Collect roles & companies where any of the input skills appear
    roles_set = set()
    companies_set = set()
    for _, r in df.iterrows():
        student_skills = set(r["_skill_list"])
        if any(skill in student_skills for skill in s_norm):
            roles_set.add(str(r["JobRole"]))
            companies_set.add(str(r["Company"]))

    # compute matching metrics (overlap, similarity, branch match, cgpa diff, score)
    def compute_metrics(row):
        row_sk = set(row["_skill_list"])
        overlap = len(set(s_norm) & row_sk)
        sim = overlap / max(len(set(s_norm)), 1)
        branch_match = 1 if branch and (str(row["Branch"]).strip().lower() == str(branch).strip().lower()) else 0
        cgpa_diff = abs(float(row["CGPA"]) - float(cgpa)) if cgpa is not None else 0
        score = overlap * 10 + branch_match * 2 - cgpa_diff * 0.5
        return pd.Series({"_overlap": overlap, "_sim": sim, "_branch_match": branch_match, "_cgpa_diff": cgpa_diff, "_score": score})

    metrics = df.apply(compute_metrics, axis=1)
    df2 = pd.concat([df, metrics], axis=1)
    matched = df2[df2["_overlap"] > 0].copy()
    total_students = len(df2)
    matched_count = len(matched)
    if matched_count == 0:
        stats = {"matched_count": 0, "matched_pct": 0.0, "avg_package": 0.0, "top_companies": {}, "top_roles": {}}
        return {"matched_students": [], "stats": stats, "predicted": None, "roles_for_skills": list(roles_set), "companies_for_skills": list(companies_set)}

    matched = matched.sort_values(by=["_score", "_overlap", "_branch_match"], ascending=[False, False, False])
    top = matched.head(top_k)
    matched_students = []
    for _, r in top.iterrows():
        matched_students.append({
            "StudentName": r["StudentName"],
            "RollNumber": int(r["RollNumber"]) if not pd.isna(r["RollNumber"]) else None,
            "Branch": r["Branch"],
            "CGPA": float(r["CGPA"]),
            "Skills": r["Skills"],
            "Company": r["Company"],
            "JobRole": r["JobRole"],
            "Package": float(r["Package"]),
            "Year": int(r["Year"]) if not pd.isna(r["Year"]) else None,
            "OpportunityType": r["OpportunityType"],
            "overlap": int(r["_overlap"]),
            "similarity": float(r["_sim"]),
            "score": float(r["_score"])
        })

    avg_package = float(matched["Package"].mean())
    top_companies = matched.groupby("Company")["StudentName"].count().sort_values(ascending=False).head(5).to_dict()
    top_roles = matched.groupby("JobRole")["StudentName"].count().sort_values(ascending=False).head(5).to_dict()
    stats = {"matched_count": matched_count, "matched_pct": round(matched_count / max(total_students, 1) * 100, 2), "avg_package": round(avg_package, 2), "top_companies": top_companies, "top_roles": top_roles}

    predicted = None
    try:
        load_model()
        predicted = predict_opportunity(branch=branch or "", cgpa=cgpa or 0.0, skills=s_norm, year=year or 0)
    except Exception:
        predicted = None

    return {"matched_students": matched_students, "stats": stats, "predicted": predicted, "roles_for_skills": sorted(roles_set), "companies_for_skills": sorted(companies_set)}
