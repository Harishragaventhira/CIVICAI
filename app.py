import os
import sqlite3
import cv2
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from geopy.geocoders import Nominatim
from ultralytics import YOLO
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.secret_key = 'super_secret_key_change_this'  # Required for login security
# Use an absolute path for the SQLite DB to avoid working-directory issues
basedir = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(basedir, 'smart_city.db')

# --- CONFIGURATION ---
# 1. Load AI Model
try:
    model = YOLO('best.pt')
    print("✅ AI Model Loaded")
except:
    print("⚠ 'best.pt' not found. Using 'yolov8n.pt' for testing.")
    model = YOLO('yolov8n.pt')

# 2. Setup Geocoder (Converts Lat/Long -> Address)
geolocator = Nominatim(user_agent="smart_city_app_v1")

# 3. Setup Login Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    c = conn.cursor()
    # Create Users Table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  password TEXT,
                  role TEXT,    -- 'citizen' or 'mayor'
                  region TEXT)  -- e.g., 'Chennai' (only for mayors)
              ''')
    # Create Reports Table
    c.execute('''CREATE TABLE IF NOT EXISTS reports
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  image_path TEXT,
                  annotated_path TEXT,
                  hazard_type TEXT,
                  latitude TEXT,
                  longitude TEXT,
                  address TEXT,
                  assigned_to TEXT,
                  status TEXT)
              ''')
    conn.commit()
    conn.close()

# --- USER CLASS ---
class User(UserMixin):
    def __init__(self, id, username, role, region):
        self.id = id
        self.username = username
        self.role = role
        self.region = region

@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    u = c.fetchone()
    conn.close()
    if u:
        return User(id=u[0], username=u[1], role=u[3], region=u[4])
    return None

# --- ROUTES ---

@app.route('/')
def home():
    if current_user.is_authenticated:
        if current_user.role == 'mayor':
            return redirect(url_for('mayor_dashboard'))
        return redirect(url_for('user_dashboard'))
    return redirect(url_for('login'))

# AUTHENTICATION ROUTES
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        role = request.form['role']
        region = request.form.get('region', 'General')

        try:
            conn = sqlite3.connect(DB_PATH, check_same_thread=False)
            c = conn.cursor()
            c.execute("INSERT INTO users (username, password, role, region) VALUES (?, ?, ?, ?)",
                      (username, password, role, region))
            conn.commit()
            conn.close()
            flash("Account created! Please login.", "success")
            return redirect(url_for('login'))
        except:
            flash("Username already exists.", "danger")
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = c.fetchone()
        conn.close()

        if user and check_password_hash(user[2], password):
            login_user(User(id=user[0], username=user[1], role=user[3], region=user[4]))
            return redirect(url_for('home'))
        else:
            flash("Invalid credentials.", "danger")
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# CITIZEN ROUTES - (FIXED FOR FILE PATHS)
@app.route('/dashboard', methods=['GET', 'POST'])
@login_required
def user_dashboard():
    if request.method == 'POST':
        file = request.files['file']
        lat = request.form['lat']
        lon = request.form['lon']

        if file:
            # --- FIX STARTS HERE: ABSOLUTE PATHS ---
            
            # 1. Get the Absolute Path (C:\Users\...\static\uploads)
            basedir = os.path.abspath(os.path.dirname(__file__))
            upload_folder = os.path.join(basedir, 'static', 'uploads')
            
            # Create folder if it doesn't exist
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)

            # 2. Save Original Image using Absolute Path
            filename = file.filename
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)

            # 3. AI Detection (Pass the Absolute Path to YOLO)
            results = model(filepath)
            
            # Get Class Name
            try:
                class_id = int(results[0].boxes.cls[0])
                hazard = results[0].names[class_id]
            except:
                hazard = "Unknown Hazard"

            # 4. Save Annotated Image using Absolute Path
            annotated_filename = "detected_" + filename
            annotated_path_abs = os.path.join(upload_folder, annotated_filename)
            cv2.imwrite(annotated_path_abs, results[0].plot())

            # 5. Prepare Database Paths (These must be RELATIVE for HTML to see them)
            # Convert back to "static/uploads/image.jpg"
            db_image_path = f"static/uploads/{filename}"
            db_annotated_path = f"static/uploads/{annotated_filename}"

            # --- FIX ENDS HERE ---

            # 6. Get Address from GPS
            try:
                location_info = geolocator.reverse(f"{lat}, {lon}")
                address = location_info.address
                city = location_info.raw['address'].get('city', 'Unknown')
            except:
                address = "GPS Location Found (Address Unavailable)"
                city = "General"

            # 7. Assign to Mayor
            assigned_to = f"{city} Mayor"

            # 8. Save to DB (Using the relative paths for HTML)
            conn = sqlite3.connect(DB_PATH, check_same_thread=False)
            c = conn.cursor()
            c.execute("""INSERT INTO reports (user_id, image_path, annotated_path, hazard_type, latitude, longitude, address, assigned_to, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                      (current_user.id, db_image_path, db_annotated_path, hazard, lat, lon, address, assigned_to, "Pending"))
            conn.commit()
            conn.close()
            flash("Report Submitted Successfully!", "success")

    # Load User History
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM reports WHERE user_id = ? ORDER BY id DESC", (current_user.id,))
    reports = c.fetchall()
    conn.close()
    return render_template('user_dashboard.html', reports=reports, user=current_user)

# MAYOR ROUTES
@app.route('/admin')
@login_required
def mayor_dashboard():
    if current_user.role != 'mayor':
        return "Access Denied"
    
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    # Filter reports by Mayor's Region (e.g., "Chennai" matches "Chennai, TN")
    c.execute("SELECT * FROM reports WHERE address LIKE ? ORDER BY id DESC", (f'%{current_user.region}%',))
    reports = c.fetchall()
    conn.close()
    return render_template('mayor_dashboard.html', reports=reports, user=current_user)

@app.route('/resolve/<int:id>')
@login_required
def resolve_issue(id):
    if current_user.role == 'mayor':
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        c = conn.cursor()
        c.execute("UPDATE reports SET status = 'Resolved' WHERE id = ?", (id,))
        conn.commit()
        conn.close()
    return redirect(url_for('mayor_dashboard'))


# --- API ROUTES ---

@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    region = data.get('region', 'General')

    if not all([username, password, role]):
        return jsonify({"error": "Missing required fields"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        c = conn.cursor()
        c.execute("INSERT INTO users (username, password, role, region) VALUES (?, ?, ?, ?)",
                  (username, hashed_password, role, region))
        conn.commit()
        conn.close()
        return jsonify({"message": "Account created successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400

    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    user_row = c.fetchone()
    conn.close()

    if user_row and check_password_hash(user_row[2], password):
        user = User(id=user_row[0], username=user_row[1], role=user_row[3], region=user_row[4])
        login_user(user)
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "region": user.region
            }
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/user', methods=['GET'])
def api_get_user():
    if current_user.is_authenticated:
        return jsonify({
            "is_authenticated": True,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "role": current_user.role,
                "region": current_user.region
            }
        }), 200
    else:
        return jsonify({"is_authenticated": False}), 200

@app.route('/api/reports', methods=['GET'])
@login_required
def api_get_reports():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if current_user.role == 'mayor':
        c.execute("SELECT * FROM reports WHERE address LIKE ? ORDER BY id DESC", (f'%{current_user.region}%',))
    else:
        c.execute("SELECT * FROM reports WHERE user_id = ? ORDER BY id DESC", (current_user.id,))
        
    reports = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify(reports), 200

@app.route('/api/reports', methods=['POST'])
@login_required
def api_create_report():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    lat = request.form.get('lat')
    lon = request.form.get('lon')

    if not lat or not lon:
        return jsonify({"error": "Missing location data"}), 400
    
    # --- Reusing File Save Logic ---
    basedir = os.path.abspath(os.path.dirname(__file__))
    upload_folder = os.path.join(basedir, 'static', 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    filename = file.filename
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    # AI Detection
    results = model(filepath)
    try:
        class_id = int(results[0].boxes.cls[0])
        hazard = results[0].names[class_id]
    except:
        hazard = "Unknown Hazard"

    annotated_filename = "detected_" + filename
    annotated_path_abs = os.path.join(upload_folder, annotated_filename)
    cv2.imwrite(annotated_path_abs, results[0].plot())

    # DB Paths
    db_image_path = f"static/uploads/{filename}"
    db_annotated_path = f"static/uploads/{annotated_filename}"

    # Geocoding
    try:
        location_info = geolocator.reverse(f"{lat}, {lon}")
        address = location_info.address
        city = location_info.raw['address'].get('city', 'Unknown')
    except:
        address = "GPS Location Found (Address Unavailable)"
        city = "General"

    assigned_to = f"{city} Mayor"

    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    c = conn.cursor()
    c.execute("""INSERT INTO reports (user_id, image_path, annotated_path, hazard_type, latitude, longitude, address, assigned_to, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
              (current_user.id, db_image_path, db_annotated_path, hazard, lat, lon, address, assigned_to, "Pending"))
    conn.commit()
    report_id = c.lastrowid
    conn.close()

    return jsonify({"message": "Report created", "report_id": report_id}), 201

@app.route('/api/resolve/<int:id>', methods=['PUT', 'POST']) 
@login_required
def api_resolve_issue(id):
    if current_user.role != 'mayor':
        return jsonify({"error": "Access Denied"}), 403
    
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    c = conn.cursor()
    c.execute("UPDATE reports SET status = 'Resolved' WHERE id = ?", (id,))
    conn.commit()
    rows = c.rowcount
    conn.close()
    
    if rows > 0:
        return jsonify({"message": "Report resolved"}), 200
    else:
         return jsonify({"error": "Report not found"}), 404

if __name__ == '__main__':
    init_db()
    app.run(debug=True)