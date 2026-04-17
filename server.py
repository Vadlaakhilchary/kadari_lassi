#!/usr/bin/env python3
"""
Simple HTTP server with URL routing for clean URLs
Routes /menu to /menu.html, /best-lassi-in-hyderabad to /best-lassi-in-hyderabad.html, etc.
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # If path doesn't end with a file extension and isn't root, try adding .html
        if self.path != '/' and '.' not in self.path.split('/')[-1]:
            # Try to serve .html file
            html_path = self.path.rstrip('/') + '.html'
            
            # Check if the HTML file exists
            file_path = os.path.join(os.getcwd(), html_path.lstrip('/'))
            if os.path.isfile(file_path):
                self.path = html_path
                print(f"✓ Routing {self.path} -> {html_path}")
        
        # Call parent method to serve the file
        super().do_GET()

    def end_headers(self):
        # Add cache headers for static files
        self.send_header('Cache-Control', 'public, max-age=300')
        super().end_headers()

if __name__ == '__main__':
    PORT = 5000
    Handler = CustomHTTPRequestHandler
    
    try:
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        server = HTTPServer(('localhost', PORT), Handler)
        print(f"✓ Server running on http://localhost:{PORT}")
        print(f"✓ Directory: {os.getcwd()}")
        print("✓ Press Ctrl+C to stop")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        sys.exit(0)
    except OSError as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
