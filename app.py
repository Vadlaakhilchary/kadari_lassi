"""
Kadari Lassi Backend API
Flask server with SQLite database for menu management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database configuration
DB_FILE = 'menu_data.db'

# Initialize database
def init_db():
    """Create database and tables if they don't exist"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create menu items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            badge TEXT,
            emoji TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check if table is empty
    cursor.execute('SELECT COUNT(*) FROM menu_items')
    count = cursor.fetchone()[0]
    
    # If empty, populate with default menu
    if count == 0:
        default_menu = [
            {
                "name": "Classic Lassi",
                "price": 70,
                "description": "The timeless original. Chilled, thick, and perfectly blended with pure curd and a touch of sweetness.",
                "badge": "Popular",
                "emoji": "🥛"
            },
            {
                "name": "No Sugar Lassi",
                "price": 80,
                "description": "A healthier choice without compromising taste. Pure curd, no added sugar — naturally refreshing.",
                "badge": "Healthy",
                "emoji": "🍃"
            },
            {
                "name": "Dry Fruit Lassi",
                "price": 90,
                "description": "Rich and indulgent. Topped with hand-picked dry fruits — almonds, cashews, and pistachios.",
                "badge": "Premium",
                "emoji": "🥜"
            },
            {
                "name": "Special Kadari Lassi",
                "price": 100,
                "description": "The crown jewel. A secret family recipe passed down through generations — one sip tells the story.",
                "badge": "Signature",
                "emoji": "✨"
            }
        ]
        
        for item in default_menu:
            cursor.execute('''
                INSERT INTO menu_items (name, price, description, badge, emoji)
                VALUES (?, ?, ?, ?, ?)
            ''', (item['name'], item['price'], item['description'], item['badge'], item['emoji']))
        
        print("✅ Database initialized with default menu items")
    
    conn.commit()
    conn.close()

# Helper function to get database connection
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# Helper function to convert row to dict
def row_to_dict(row):
    if row is None:
        return None
    return dict(row)

# ========================
# API ENDPOINTS
# ========================

@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Get all menu items"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, price, description, badge, emoji FROM menu_items ORDER BY id')
        rows = cursor.fetchall()
        conn.close()
        
        items = [row_to_dict(row) for row in rows]
        return jsonify({
            'success': True,
            'data': items,
            'count': len(items)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/menu/<int:item_id>', methods=['GET'])
def get_menu_item(item_id):
    """Get a single menu item"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, price, description, badge, emoji FROM menu_items WHERE id = ?', (item_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row is None:
            return jsonify({'success': False, 'error': 'Item not found'}), 404
        
        return jsonify({
            'success': True,
            'data': row_to_dict(row)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/menu', methods=['POST'])
def create_menu_item():
    """Create a new menu item"""
    try:
        data = request.json
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO menu_items (name, price, description, badge, emoji)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.get('name'),
            data.get('price'),
            data.get('description'),
            data.get('badge'),
            data.get('emoji')
        ))
        conn.commit()
        item_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Item created successfully',
            'id': item_id
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/menu/<int:item_id>', methods=['PUT'])
def update_menu_item(item_id):
    """Update a menu item"""
    try:
        data = request.json
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if item exists
        cursor.execute('SELECT id FROM menu_items WHERE id = ?', (item_id,))
        if cursor.fetchone() is None:
            return jsonify({'success': False, 'error': 'Item not found'}), 404
        
        cursor.execute('''
            UPDATE menu_items 
            SET name = ?, price = ?, description = ?, badge = ?, emoji = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data.get('name'),
            data.get('price'),
            data.get('description'),
            data.get('badge'),
            data.get('emoji'),
            item_id
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Item updated successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/menu/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    """Delete a menu item"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if item exists
        cursor.execute('SELECT id FROM menu_items WHERE id = ?', (item_id,))
        if cursor.fetchone() is None:
            return jsonify({'success': False, 'error': 'Item not found'}), 404
        
        cursor.execute('DELETE FROM menu_items WHERE id = ?', (item_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Item deleted successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/menu/sync/all', methods=['POST'])
def sync_all_menu():
    """Sync entire menu (used by admin to update all items at once)"""
    try:
        data = request.json
        items = data.get('items', [])
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Clear existing items
        cursor.execute('DELETE FROM menu_items')
        
        # Insert new items
        for item in items:
            cursor.execute('''
                INSERT INTO menu_items (name, price, description, badge, emoji)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                item.get('name'),
                item.get('price'),
                item.get('description'),
                item.get('badge'),
                item.get('emoji')
            ))
        
        conn.commit()
        conn.close()
        
        # Also save to menu.json for backward compatibility
        save_menu_json(items)
        
        return jsonify({
            'success': True,
            'message': f'{len(items)} items synced successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Kadari Lassi API is running',
        'timestamp': datetime.now().isoformat()
    })

# ========================
# HELPER FUNCTIONS
# ========================

def save_menu_json(items):
    """Save menu items to menu.json file"""
    try:
        with open('js/menu.json', 'w') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        print("✅ Menu saved to menu.json")
    except Exception as e:
        print(f"❌ Error saving menu.json: {e}")

# ========================
# MAIN
# ========================

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    print("=" * 50)
    print("🚀 Kadari Lassi Backend API")
    print("=" * 50)
    print("✅ Database initialized")
    print("📡 API running on http://localhost:5000")
    print("=" * 50)
    
    # Run Flask app
    app.run(debug=True, port=5000, host='localhost')
