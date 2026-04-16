# Kadari Lassi Deployment Guide

## ✅ Issues Fixed

### 1. ✅ Hardcoded Localhost URLs
**Fixed in:** `js/script.js`, `admin.html`
- Changed from `http://localhost:5000` → `/api/endpoint` (relative paths)
- Automatically uses `http://localhost:5000` when running locally
- Automatically uses relative paths `/api/endpoint` in production

### 2. ✅ Flask Debug Mode
**Fixed in:** `app.py`
- Changed from `debug=True` → Uses environment variable `FLASK_ENV`
- Production: `FLASK_ENV=production` → debug=False
- Development: `FLASK_ENV=development` → debug=True

### 3. ✅ Hardcoded Host Binding
**Fixed in:** `app.py`
- Changed from `host='localhost'` → `FLASK_HOST=0.0.0.0`
- Now listens on all network interfaces (accessible remotely)
- Use environment variable for configuration

### 4. ✅ Database Path Issues
**Fixed in:** `app.py`
- Changed from relative path → Absolute path with `DB_DIR` env variable
- Default: Uses current directory if not specified
- Production: Can set `DB_DIR=/var/data` for external volume

### 5. ✅ Overly Permissive CORS
**Fixed in:** `app.py`
- Changed from `CORS(app)` (all origins) → Restricted origins list
- Includes localhost by default
- Production domains from `ALLOWED_ORIGINS` environment variable

---

## 🚀 Deployment Instructions

### Step 1: Setup Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# For Local Development:
FLASK_ENV=development
FLASK_HOST=localhost
FLASK_PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# For Production (VPS/Cloud):
FLASK_ENV=production
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
DB_DIR=/var/kadari-lassi/data
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Step 2: Install Python Packages

```bash
pip install -r requirements.txt
```

### Step 3: Run for Local Testing

```bash
# Windows PowerShell
$env:FLASK_ENV="development"; python app.py

# macOS/Linux
export FLASK_ENV=development && python app.py
```

Then visit: `http://localhost:5000`

### Step 4: Deploy to Production

#### Option A: Traditional VPS (Ubuntu/Debian)

```bash
# Install dependencies
pip install gunicorn python-dotenv

# Create .env file with production settings
nano .env

# Create systemd service file
sudo nano /etc/systemd/system/kadari-lassi.service
```

**Service file content:**
```ini
[Unit]
Description=Kadari Lassi API
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/home/www-data/kadari
Environment="PATH=/home/www-data/kadari/venv/bin"
ExecStart=/home/www-data/kadari/venv/bin/gunicorn --workers 4 --bind 0.0.0.0:5000 --env-file .env app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl start kadari-lassi
sudo systemctl enable kadari-lassi
```

#### Option B: Heroku

```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Create .env for Heroku (use Heroku dashboard instead)
# OR use Heroku CLI:
heroku config:set FLASK_ENV=production
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
```

#### Option C: Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "app:app"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - ALLOWED_ORIGINS=https://yourdomain.com
    volumes:
      - ./data:/app/data
```

Run:
```bash
docker-compose up -d
```

### Step 5: Setup Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 6: Enable SSL/HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at your domain
- [ ] Menu items display (from API or JSON fallback)
- [ ] Admin page accessible at `/admin.html`
- [ ] Admin can add/edit menu items
- [ ] Admin sync to backend works
- [ ] Backend shows correct host/port in logs
- [ ] CORS not blocking requests
- [ ] Database file created in correct location
- [ ] No console errors in browser DevTools
- [ ] WhatsApp links work with correct phone number

---

## 🔍 Testing API Endpoints

### Get Menu (GET)
```bash
curl http://localhost:5000/api/menu
```

### Health Check (GET)
```bash
curl http://localhost:5000/api/health
```

### Create Menu Item (POST)
```bash
curl -X POST http://localhost:5000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mango Lassi",
    "price": 85,
    "description": "Refreshing mango lassi",
    "badge": "Seasonal",
    "emoji": "🥭"
  }'
```

### Sync All Menu (POST)
```bash
curl -X POST http://localhost:5000/api/menu/sync/all \
  -H "Content-Type: application/json" \
  -d '{"items": [...]}'
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
```bash
# Make sure you're in the correct directory
cd /path/to/kadari
# Install requirements
pip install -r requirements.txt
```

### Issue: Port 5000 already in use
```bash
# Change port in .env
FLASK_PORT=5001
```

### Issue: CORS errors in browser
```bash
# Check your domain is in .env ALLOWED_ORIGINS
# Format must be: https://yourdomain.com (no trailing slash)
```

### Issue: Database file not created
```bash
# Check write permissions in DB_DIR
chmod 755 /var/kadari-lassi/data
# Or use current directory (default)
```

### Issue: Menu not syncing from admin
```bash
# Check admin.html console for errors
# Verify backend is running
# Check CORS origins in app.py
```

---

## 📊 Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `FLASK_ENV` | development | Set to `production` for live deployment |
| `FLASK_HOST` | 0.0.0.0 | Server address (0.0.0.0 = all interfaces) |
| `FLASK_PORT` | 5000 | Server port |
| `DB_DIR` | Current dir | Database directory path |
| `ALLOWED_ORIGINS` | localhost | Comma-separated allowed domains |

---

## 🎯 Summary

✅ All hardcoded URLs fixed  
✅ Production-ready Flask configuration  
✅ Environment variable support  
✅ CORS properly restricted  
✅ Database path configurable  
✅ Ready for deployment!

---

**Generated:** April 16, 2026  
**Status:** ✅ ALL ISSUES FIXED - READY TO DEPLOY
