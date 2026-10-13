import os
import re
import glob

# 1. Update HTML files
html_files = glob.glob('*.html')
for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # update css links: href="filename.css..." -> href="css/filename.css..."
    content = re.sub(r'href="(?!http|css/|assets/|fonts/)([^"]+\.css[^"]*)"', r'href="css/\1"', content)

    # update js links: src="filename.js..." -> src="js/filename.js..."
    content = re.sub(r'src="(?!http|js/|assets/|images/)([^"]+\.js[^"]*)"', r'src="js/\1"', content)

    # update image links if any .jpg in root
    content = re.sub(r'src="(?!http|images/|assets/)([^"]+\.jpg[^"]*)"', r'src="images/\1"', content)

    # draft.html has <img src="assets/logo-classic.webp"...> we don't touch since it's already in assets.

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated HTML files.")

# 2. Update CSS files inside css/
css_files = glob.glob('css/*.css')
for fpath in css_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # fonts/ in css -> ../fonts/
    content = re.sub(r'url\((["\']?)fonts/', r'url(\1../fonts/', content)

    # assets/ in css -> ../assets/
    content = re.sub(r'url\((["\']?)assets/', r'url(\1../assets/', content)

    # images in css -> ../images/ (if referred directly as url('bg_02_loading_facility.jpg')
    content = re.sub(r'url\((["\']?)([^/]+)\.jpg', r'url(\1../images/\2.jpg', content)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated CSS files.")
