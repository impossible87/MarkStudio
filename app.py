from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for
import os
import json
from werkzeug.utils import secure_filename
import tempfile
import chardet

# 添加新的依赖库
import pypandoc
import pdfplumber
import markdown
import re
import sys
import uuid
import datetime

# 添加资源路径函数用于PyInstaller打包
def resource_path(relative_path):
    ''' 获取资源的绝对路径 '''
    if hasattr(sys, '_MEIPASS'):
        # PyInstaller创建临时文件夹，将路径存储在_MEIPASS中
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

app = Flask(__name__, static_folder=resource_path('static'), template_folder=resource_path('templates'))
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'md', 'markdown', 'txt', 'docx', 'pdf'}  # 添加docx和pdf支持
PREVIEW_DOCUMENTS = {}  # 存储预览文档的映射

# 配置应用
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB上传限制
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_key')

# 确保上传目录存在
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 配置Pandoc路径
def setup_pandoc():
    # 先尝试从项目目录中查找pandoc
    current_dir = os.path.dirname(os.path.abspath(__file__)) if not hasattr(sys, '_MEIPASS') else sys._MEIPASS
    pandoc_possible_paths = [
        os.path.join(current_dir, 'pandoc', 'pandoc.exe'),  # Windows
        os.path.join(current_dir, 'pandoc', 'bin', 'pandoc.exe'),  # Windows
        os.path.join(current_dir, 'pandoc.exe'),  # Windows
        os.path.join(current_dir, 'pandoc'),  # Unix
    ]
    
    for path in pandoc_possible_paths:
        if os.path.exists(path):
            os.environ['PYPANDOC_PANDOC'] = path
            print(f"已找到Pandoc: {path}")
            return True
    
    # 如果在项目目录找不到，尝试下载pandoc
    try:
        pypandoc.download_pandoc()
        print("已自动下载Pandoc")
        return True
    except Exception as e:
        print(f"下载Pandoc失败: {str(e)}")
        return False

# 初始化Pandoc
pandoc_available = setup_pandoc()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 添加文件转换函数
def convert_to_markdown(file_path, file_type):
    """将不同格式的文件转换为Markdown"""
    try:
        if file_type == 'docx':
            # 使用pypandoc将docx转换为markdown
            if not pandoc_available:
                return "错误：未找到Pandoc。请确保已安装Pandoc并添加到环境变量或放置在项目目录中。"
            try:
                markdown_content = pypandoc.convert_file(file_path, 'md')
                return markdown_content
            except Exception as e:
                print(f"Pandoc转换错误: {str(e)}")
                return f"Pandoc转换错误: {str(e)}"
        elif file_type == 'pdf':
            # 使用pdfplumber提取PDF文本
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n\n"
            
            # 简单格式化为markdown
            # 将标题行转换为markdown标题
            lines = text.split('\n')
            formatted_lines = []
            for line in lines:
                line = line.strip()
                if not line:
                    formatted_lines.append("")
                    continue
                
                # 检测可能的标题（全大写或首字母大写的短行）
                if (line.isupper() or re.match(r'^[A-Z][a-z]', line)) and len(line) < 100:
                    formatted_lines.append(f"## {line}")
                else:
                    formatted_lines.append(line)
            
            return "\n".join(formatted_lines)
        else:
            # 对于已经是markdown或txt的文件，先检测编码再读取内容
            try:
                # 首先尝试 UTF-8
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except UnicodeDecodeError:
                # 如果 UTF-8 失败，尝试检测实际编码
                with open(file_path, 'rb') as f:
                    raw_data = f.read()
                    result = chardet.detect(raw_data)
                    encoding = result['encoding']
                
                # 使用检测到的编码重新读取
                try:
                    if encoding is not None:
                        with open(file_path, 'r', encoding=encoding) as f:
                            return f.read()
                    else:
                        # 如果无法检测到编码，尝试常见中文编码
                        for enc in ['gbk', 'gb2312', 'big5']:
                            try:
                                with open(file_path, 'r', encoding=enc) as f:
                                    return f.read()
                            except UnicodeDecodeError:
                                continue
                        
                        # 所有尝试都失败，返回错误信息
                        return "无法识别文件编码，请确保文件使用UTF-8或其他常见编码格式。"
                except Exception as e:
                    return f"读取文件时出错: {str(e)}"
    except Exception as e:
        print(f"转换错误: {str(e)}")
        return f"转换错误: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/preview/<preview_id>')
def preview_document(preview_id):
    """显示预览文档的页面"""
    if preview_id in PREVIEW_DOCUMENTS:
        document = PREVIEW_DOCUMENTS[preview_id]
        return render_template('preview.html', 
                              title=document.get('title', 'Markdown文档'),
                              content=document.get('content', ''),
                              preview_id=preview_id,
                              created_time=document.get('created_time', ''))
    return redirect(url_for('index'))

@app.route('/share', methods=['POST'])
def share_document():
    """创建可分享的文档链接"""
    try:
        data = request.json
        content = data.get('content', '')
        title = data.get('title', 'Markdown文档')
        
        # 生成唯一ID
        preview_id = str(uuid.uuid4())
        
        # 保存预览文档
        PREVIEW_DOCUMENTS[preview_id] = {
            'content': content,
            'title': title,
            'created_time': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # 返回预览URL
        preview_url = url_for('preview_document', preview_id=preview_id, _external=True)
        return jsonify({"success": True, "preview_url": preview_url, "preview_id": preview_id})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/save', methods=['POST'])
def save_file():
    try:
        data = request.json
        content = data.get('content', '')
        filename = data.get('filename', '')
        
        print(f"收到的文件名参数: '{filename}'")
        
        # 如果未提供文件名，使用当前时间戳作为文件名
        if not filename:
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"markdown_{timestamp}.md"
            print(f"使用时间戳作为文件名: {filename}")
        else:
            # 安全处理文件名，同时保留中文字符
            original_filename = filename
            # 替换不安全的字符，但保留中文
            filename = re.sub(r'[\\/*?:"<>|]', '_', filename)  # 替换Windows不允许的文件名字符
            print(f"原始文件名: '{original_filename}', 安全处理后: '{filename}'")
            
            if not filename.lower().endswith('.md'):
                filename += '.md'
                print(f"添加.md后缀: '{filename}'")
        
        print(f"最终使用的文件名: '{filename}'")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
            
        return jsonify({"success": True, "filename": filename})
    except Exception as e:
        print(f"保存文件时出错: {str(e)}")
        return jsonify({"success": False, "message": str(e)})

@app.route('/load', methods=['POST'])
def load_file():
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "message": "没有选择文件"})
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"success": False, "message": "没有选择文件"})
            
        if file and allowed_file(file.filename):
            # 处理文件名，保留中文字符
            original_filename = file.filename
            # 使用自定义的安全处理，保留中文字符
            filename = re.sub(r'[\\/*?:"<>|]', '_', original_filename)
            file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # 根据文件类型转换为markdown
            markdown_content = convert_to_markdown(file_path, file_ext)
                
            return jsonify({"success": True, "content": markdown_content})
        else:
            return jsonify({"success": False, "message": "不支持的文件类型"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/paste', methods=['POST'])
def handle_paste():
    try:
        data = request.json
