from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import re
import secrets
import sqlite3

try:
    import mysql.connector
except ImportError:
    mysql = None

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_PATH = os.path.join(BASE_DIR, "database", "users.db")
os.makedirs(os.path.dirname(SQLITE_PATH), exist_ok=True)

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-this-secret-in-production")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-this-jwt-secret-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=8)

CORS(app, resources={r"/*": {"origins": "*"}})
JWTManager(app)


def mysql_enabled():
    return bool(os.getenv("MYSQL_HOST"))


def db():
    """Return a database connection. MySQL is used when MYSQL_HOST is set.
    SQLite remains available for local development when MySQL variables are absent.
    """
    if mysql_enabled():
        if mysql is None:
            raise RuntimeError("mysql-connector-python is not installed")
        return mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DB"),
            autocommit=False,
        )

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def execute(conn, sql, params=()):
    if mysql_enabled():
        sql = sql.replace("?", "%s")
        return conn.cursor(dictionary=True).execute(sql, params)
    return conn.execute(sql, params)


def fetchone(conn, sql, params=()):
    cur = execute(conn, sql, params)
    row = cur.fetchone()
    cur.close()
    return row


def fetchall(conn, sql, params=()):
    cur = execute(conn, sql, params)
    rows = cur.fetchall()
    cur.close()
    return rows


def commit(conn):
    conn.commit()


def close(conn):
    conn.close()


def row_value(row, key, index=None):
    if isinstance(row, dict):
        return row[key]
    if key in row.keys():
        return row[key]
    return row[index] if index is not None else None


def user_dict(row):
    return {
        "id": row_value(row, "id", 0),
        "fullname": row_value(row, "fullname", 1),
        "email": row_value(row, "email", 2),
        "role": row_value(row, "role", 4),
        "created_at": str(row_value(row, "created_at", 5)),
    }


def valid_email(email):
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email or ""))


def admin_ok():
    return get_jwt().get("role") == "admin"


def ensure_schema():
    conn = db()
    if mysql_enabled():
        execute(conn, """CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            fullname VARCHAR(120) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""")
        execute(conn, """CREATE TABLE IF NOT EXISTS reset_tokens (
            id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            INDEX idx_reset_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4""")
    else:
        execute(conn, """CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL
        )""")
        execute(conn, """CREATE TABLE IF NOT EXISTS reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at TEXT NOT NULL
        )""")

    # Stable internship demo accounts. These are created/reset on startup so
    # deployment never fails because of a stale database.
    demo_email = "demo@secure.com"
    demo_password = "Demo@12345"
    admin_email = "admin@secure.local"
    admin_password = "Admin@12345"

    for fullname, email, password, role in [
        ("Diya Patel", demo_email, demo_password, "user"),
        ("System Admin", admin_email, admin_password, "admin"),
    ]:
        existing = fetchone(conn, "SELECT id FROM users WHERE email=?", (email,))
        if existing:
            execute(
                conn,
                "UPDATE users SET fullname=?, password=?, role=? WHERE email=?",
                (fullname, generate_password_hash(password), role, email),
            )
        else:
            execute(
                conn,
                "INSERT INTO users(fullname,email,password,role,created_at) VALUES(?,?,?,?,?)",
                (fullname, email, generate_password_hash(password), role, datetime.utcnow()),
            )

    commit(conn)
    close(conn)


@app.get("/")
def home():
    return jsonify(
        authentication="JWT",
        backend="Flask REST API",
        database="MySQL" if mysql_enabled() else "SQLite (local fallback)",
        developer="Patel Diya Vishnubhai",
        project="Secure User Management System",
        status="Running Successfully",
    )


@app.get("/health")
def health():
    try:
        conn = db()
        fetchone(conn, "SELECT 1")
        close(conn)
        return jsonify(status="healthy", database="MySQL" if mysql_enabled() else "SQLite")
    except Exception as exc:
        return jsonify(status="unhealthy", error=str(exc)), 500


@app.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or data.get("fullname") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify(error="Name, email and password are required"), 400
    if len(name) < 2:
        return jsonify(error="Please enter a valid name"), 400
    if not valid_email(email):
        return jsonify(error="Enter a valid email address"), 400
    if len(password) < 6:
        return jsonify(error="Password must be at least 6 characters"), 400

    conn = db()
    try:
        execute(
            conn,
            "INSERT INTO users(fullname,email,password,role,created_at) VALUES(?,?,?,?,?)",
            (name, email, generate_password_hash(password), "user", datetime.utcnow()),
        )
        commit(conn)
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        close(conn)
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            return jsonify(error="Email already registered"), 409
        return jsonify(error="Unable to create account"), 500
    close(conn)
    return jsonify(message="Account created successfully. You can now log in."), 201


@app.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify(error="Email and password are required"), 400

    conn = db()
    row = fetchone(conn, "SELECT * FROM users WHERE email=?", (email,))
    close(conn)

    if not row or not check_password_hash(row_value(row, "password", 3), password):
        return jsonify(error="Invalid email or password"), 401

    identity = row_value(row, "email", 2)
    claims = {
        "role": row_value(row, "role", 4),
        "user_id": row_value(row, "id", 0),
    }
    token = create_access_token(identity=identity, additional_claims=claims)
    return jsonify(message="Login successful", token=token, user=user_dict(row))


@app.get("/profile")
@jwt_required()
def profile():
    conn = db()
    row = fetchone(conn, "SELECT * FROM users WHERE email=?", (get_jwt_identity(),))
    close(conn)
    return jsonify(user=user_dict(row)) if row else (jsonify(error="User not found"), 404)


@app.put("/profile")
@jwt_required()
def profile_update():
    data = request.get_json(silent=True) or {}
    name = (data.get("fullname") or data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    old_email = get_jwt_identity()

    if not name or len(name) < 2 or not valid_email(email):
        return jsonify(error="Valid name and email are required"), 400

    conn = db()
    try:
        execute(conn, "UPDATE users SET fullname=?,email=? WHERE email=?", (name, email, old_email))
        commit(conn)
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        close(conn)
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            return jsonify(error="Email already in use"), 409
        return jsonify(error="Profile update failed"), 500

    row = fetchone(conn, "SELECT * FROM users WHERE email=?", (email,))
    close(conn)
    new_token = create_access_token(
        identity=email,
        additional_claims={"role": row_value(row, "role", 4), "user_id": row_value(row, "id", 0)},
    )
    return jsonify(message="Profile updated successfully", token=new_token, user=user_dict(row))


@app.post("/change-password")
@jwt_required()
def change_password():
    data = request.get_json(silent=True) or {}
    old_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if len(new_password) < 6:
        return jsonify(error="New password must be at least 6 characters"), 400

    email = get_jwt_identity()
    conn = db()
    row = fetchone(conn, "SELECT password FROM users WHERE email=?", (email,))
    if not row or not check_password_hash(row_value(row, "password", 0), old_password):
        close(conn)
        return jsonify(error="Current password is incorrect"), 400

    execute(conn, "UPDATE users SET password=? WHERE email=?", (generate_password_hash(new_password), email))
    commit(conn)
    close(conn)
    return jsonify(message="Password changed successfully")


@app.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    conn = db()
    if not fetchone(conn, "SELECT id FROM users WHERE email=?", (email,)):
        close(conn)
        return jsonify(error="No account found for this email"), 404

    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(minutes=15)
    execute(conn, "DELETE FROM reset_tokens WHERE email=?", (email,))
    execute(conn, "INSERT INTO reset_tokens(email,token,expires_at) VALUES(?,?,?)", (email, token, expires))
    commit(conn)
    close(conn)
    return jsonify(message="Reset token generated. Use it on Reset Password.", token=token)


@app.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    token = data.get("token") or ""
    password = data.get("new_password") or ""

    if len(password) < 6:
        return jsonify(error="New password must be at least 6 characters"), 400

    conn = db()
    row = fetchone(conn, "SELECT * FROM reset_tokens WHERE email=? AND token=?", (email, token))
    if not row:
        close(conn)
        return jsonify(error="Invalid reset token"), 400

    expires_raw = row_value(row, "expires_at", 3)
    expires = expires_raw if isinstance(expires_raw, datetime) else datetime.fromisoformat(str(expires_raw))
    if expires < datetime.utcnow():
        close(conn)
        return jsonify(error="Reset token has expired"), 400

    execute(conn, "UPDATE users SET password=? WHERE email=?", (generate_password_hash(password), email))
    execute(conn, "DELETE FROM reset_tokens WHERE email=?", (email,))
    commit(conn)
    close(conn)
    return jsonify(message="Password updated successfully")


@app.get("/admin")
@jwt_required()
def admin():
    return jsonify(message="Welcome Admin", role="admin") if admin_ok() else (jsonify(error="Admin Access Required"), 403)


@app.get("/users")
@jwt_required()
def users():
    if not admin_ok():
        return jsonify(error="Admin Access Required"), 403
    conn = db()
    rows = fetchall(conn, "SELECT * FROM users ORDER BY id DESC")
    close(conn)
    return jsonify(users=[user_dict(row) for row in rows])


@app.put("/users/<int:uid>")
@jwt_required()
def user_update(uid):
    if not admin_ok():
        return jsonify(error="Admin Access Required"), 403

    data = request.get_json(silent=True) or {}
    name = (data.get("fullname") or "").strip()
    email = (data.get("email") or "").strip().lower()
    role = data.get("role", "user")

    if not name or not valid_email(email) or role not in ("user", "admin"):
        return jsonify(error="Invalid user data"), 400

    conn = db()
    try:
        execute(conn, "UPDATE users SET fullname=?,email=?,role=? WHERE id=?", (name, email, role, uid))
        commit(conn)
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        close(conn)
        if "duplicate" in str(exc).lower() or "unique" in str(exc).lower():
            return jsonify(error="Email already in use"), 409
        return jsonify(error="User update failed"), 500
    close(conn)
    return jsonify(message="User updated successfully")


@app.delete("/users/<int:uid>")
@jwt_required()
def user_delete(uid):
    if not admin_ok():
        return jsonify(error="Admin Access Required"), 403
    if uid == get_jwt().get("user_id"):
        return jsonify(error="You cannot delete your own admin account"), 400

    conn = db()
    cur = execute(conn, "DELETE FROM users WHERE id=?", (uid,))
    deleted = cur.rowcount
    cur.close()
    commit(conn)
    close(conn)
    return jsonify(message="User deleted successfully") if deleted else (jsonify(error="User not found"), 404)


# Initialize the database for both local Flask and Gunicorn/Render startup.
try:
    ensure_schema()
except Exception as startup_error:
    print(f"Database initialization warning: {startup_error}")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
