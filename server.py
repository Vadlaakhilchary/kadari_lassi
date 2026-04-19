#!/usr/bin/env python3
"""
Simple HTTP server with URL routing for clean URLs
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Remove query string and fragments
        path = path.split('?')[0].split('#')[0]
        
        print(f"[TRANSLATE] Input path: {path}", flush=True)
        
        # For clean URLs without extension, add .html if the file exists
        if path != '/' and '.' not in path.split('/')[-1]:
            # Create test path
            test_path = path.lstrip('/') + '.html'
            full_path = os.path.join(os.getcwd(), test_path)
            
            print(f"[CHECK] test_path: {test_path}, full_path: {full_path}", flush=True)
            print(f"[EXISTS] File exists: {os.path.isfile(full_path)}", flush=True)
            
            # If .html file exists, add extension
            if os.path.isfile(full_path):
                print(f"[ROUTE] {path} -> {path}.html", flush=True)
                path = path + '.html'
        
        result = super().translate_path(path)
        print(f"[FINAL] Serving from: {result}", flush=True)
        return result

    def end_headers(self):
        self.send_header('Cache-Control', 'public, max-age=300')
        super().end_headers()

if __name__ == '__main__':
    PORT = 5000
    Handler = CustomHTTPRequestHandler
    
    try:
        work_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(work_dir)
        server = HTTPServer(('localhost', PORT), Handler)
        print(f"✓ Server running on http://localhost:{PORT}")
        print(f"✓ Working directory: {os.getcwd()}")
        print("✓ Clean URLs enabled: /menu, /about, /admin, etc.")
        print("✓ Press Ctrl+C to stop")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        sys.exit(0)
    except OSError as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
        sys.exit(1)
    except OSError as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
