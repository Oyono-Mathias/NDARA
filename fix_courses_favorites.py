import re

with open('src/views/Courses.tsx', 'r') as f:
    content = f.read()

old_filter = """    if (activeTab === 'inprogress') {
        list = list.filter(c => c.progress > 0 && c.progress < 100);
    } else if (activeTab === 'completed') {
        list = list.filter(c => c.progress === 100);
    }"""

new_filter = """    if (activeTab === 'inprogress') {
        list = list.filter(c => c.progress > 0 && c.progress < 100);
    } else if (activeTab === 'completed') {
        list = list.filter(c => c.progress === 100);
    } else if (activeTab === 'favorites') {
        list = list.filter(c => c.isFavorite);
    }"""

content = content.replace(old_filter, new_filter)

with open('src/views/Courses.tsx', 'w') as f:
    f.write(content)
