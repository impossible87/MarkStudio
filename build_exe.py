import PyInstaller.__main__
import os
import shutil
import sys

# 确保当前目录是项目根目录
project_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(project_dir)

# 创建资源文件夹的路径函数
def resource_path(relative_path):
    """ 获取资源的绝对路径 """
    if hasattr(sys, '_MEIPASS'):
        # PyInstaller创建临时文件夹，将路径存储在_MEIPASS中
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

# 添加这个函数到app.py中
with open('app.py', 'r', encoding='utf-8') as f:
    app_content = f.read()

# 检查是否已经添加了resource_path函数
if 'def resource_path(' not in app_content:
    # 在导入语句后添加resource_path函数
    import_section_end = app_content.find('app = Flask')
    if import_section_end > 0:
        modified_content = app_content[:import_section_end] + \
        """# 添加资源路径函数用于PyInstaller打包
def resource_path(relative_path):
    ''' 获取资源的绝对路径 '''
    if hasattr(sys, '_MEIPASS'):
        # PyInstaller创建临时文件夹，将路径存储在_MEIPASS中
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

""" + app_content[import_section_end:]
        
        # 修改Flask应用初始化，使用resource_path
        modified_content = modified_content.replace(
            "app = Flask(__name__, static_folder='static')", 
            "app = Flask(__name__, static_folder=resource_path('static'), template_folder=resource_path('templates'))"
        )
        
        # 修改setup_pandoc函数，使用resource_path
        modified_content = modified_content.replace(
            "current_dir = os.path.dirname(os.path.abspath(__file__))", 
            "current_dir = os.path.dirname(os.path.abspath(__file__)) if not hasattr(sys, '_MEIPASS') else sys._MEIPASS"
        )
        
        # 保存修改后的app.py
        with open('app.py', 'w', encoding='utf-8') as f:
            f.write(modified_content)
        print("已更新app.py以支持PyInstaller打包")

# 确保uploads目录存在
if not os.path.exists('uploads'):
    os.makedirs('uploads')

# 创建临时目录用于复制pandoc
temp_dir = os.path.join(project_dir, 'temp_build')
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)
os.makedirs(temp_dir)

# 复制pandoc到临时目录
pandoc_dir = os.path.join(project_dir, 'pandoc')
if os.path.exists(pandoc_dir):
    shutil.copytree(pandoc_dir, os.path.join(temp_dir, 'pandoc'))

# 定义PyInstaller参数
pyinstaller_args = [
    '--name=MarkdownStudio',
    '--onefile',  # 创建单个exe文件
    '--windowed',  # 使用窗口模式，不显示控制台
    '--icon=static/images/logo.ico',  # 如果有图标文件
    '--add-data=templates;templates',  # 添加模板目录
    '--add-data=static;static',  # 添加静态文件目录
    '--add-data=pandoc;pandoc',  # 添加pandoc目录
    '--add-data=uploads;uploads',  # 添加上传目录
    '--hidden-import=pypandoc',
    '--hidden-import=pdfplumber',
    '--hidden-import=markdown',
    '--hidden-import=chardet',
    'app.py',  # 主脚本
]

# 检查是否存在logo.ico，如果不存在则移除图标参数
if not os.path.exists('static/images/logo.ico'):
    # 尝试将SVG转换为ICO
    try:
        from cairosvg import svg2png
        from PIL import Image
        import io
        
        # 读取SVG文件
        with open('static/images/logo.svg', 'rb') as f:
            svg_data = f.read()
        
        # 转换为PNG
        png_data = svg2png(bytestring=svg_data, output_width=256, output_height=256)
        
        # 创建ICO文件
        img = Image.open(io.BytesIO(png_data))
        img.save('static/images/logo.ico')
        print("已创建logo.ico文件")
    except Exception as e:
        print(f"无法创建图标文件: {e}")
        # 移除图标参数
        pyinstaller_args = [arg for arg in pyinstaller_args if not arg.startswith('--icon=')]

# 运行PyInstaller
print("开始打包应用...")
PyInstaller.__main__.run(pyinstaller_args)
print("打包完成！可执行文件位于dist目录中。")

# 清理临时目录
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)
