# MarkStudio - Markdown预览与转换系统

<div align="center">

![MarkStudio Logo](static/images/logo.svg)

**一站式Markdown编辑、预览与格式转换解决方案**

</div>

## 📝 项目介绍

MarkStudio是一个功能强大的基于Flask的Markdown预览与转换系统，提供了丰富的文档处理功能。无论您是需要编辑Markdown文档、将Word文档转换为Markdown格式，还是需要从PDF中提取文本并格式化，MarkStudio都能满足您的需求。

## ✨ 功能特点

### 核心功能

- **实时预览**：即时渲染Markdown内容，所见即所得
- **多种格式转换**：
  - 支持DOCX文档转换为Markdown
  - 支持PDF文件转换为Markdown（带基础格式化）
  - 支持TXT文件导入并编辑
- **文件管理**：
  - 自定义文件名保存Markdown文件
  - 上传现有文件进行编辑和预览
  - 支持文本粘贴和文件拖放上传

### 用户体验

- **主题切换**：支持浅色/深色主题，保护您的眼睛
- **语法高亮**：实时代码语法高亮显示
- **响应式设计**：适配桌面和移动设备的界面
- **分享功能**：生成可分享的文档链接
- **打印支持**：一键打印文档

## 🖼️ 界面预览

<div align="center">
<img src="https://via.placeholder.com/800x450.png?text=MarkStudio+界面预览" alt="MarkStudio界面预览" width="800"/>
<p><i>MarkStudio编辑器界面</i></p>
</div>

## 🚀 安装与配置

### 环境要求

- Python 3.7+
- Flask
- Pandoc (用于DOCX转换)
- 其他依赖项（见requirements.txt）

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/yourusername/markstudio.git
cd markstudio
```

2. **安装Python依赖**

```bash
pip install -r requirements.txt
```

3. **配置Pandoc**

Pandoc 是用于 DOCX 转换的必要组件，**无需将 pandoc.exe 上传到 GitHub，只需在本地正确放置即可**。

#### 下载 Pandoc
- 访问 [Pandoc 官网](https://pandoc.org/installing.html) 下载适合你操作系统的安装包。
- Windows 用户建议下载 zip 包或 msi 安装包。
- Mac 用户可用 Homebrew：`brew install pandoc`
- Linux 用户可用 apt：`sudo apt-get install pandoc`

#### 推荐放置路径（任选其一）：
- 项目根目录：`项目文件夹/pandoc.exe`
- pandoc 子目录：`项目文件夹/pandoc/pandoc.exe`
- pandoc/bin 子目录：`项目文件夹/pandoc/bin/pandoc.exe`
- 或将 pandoc 添加到系统 PATH 环境变量

> **注意：** pandoc.exe 文件体积较大，不建议上传到 GitHub 仓库。请每位用户根据上述说明自行下载并放置。

### 配置流程图

```
安装Python依赖 → 配置Pandoc → 运行应用 → 访问Web界面
```

## 🔧 运行应用

```bash
python app.py
```

默认情况下，应用将在 http://127.0.0.1:5000/ 上运行。

## 📖 使用教程

### 基础使用

1. 在编辑区中输入或粘贴Markdown内容，右侧会实时预览效果
2. 点击"上传文件"按钮可以上传Markdown、TXT、DOCX或PDF文件
3. 也可以直接拖放文件到编辑区上传
4. 编辑完成后，点击"保存"按钮将内容保存为Markdown文件
   - 可以在保存时自定义文件名，不需要手动添加.md后缀
5. 点击"系统检查"按钮可以查看系统配置信息，包括Pandoc是否可用

### 高级功能

#### 文档分享

1. 编辑完成后，点击"分享"按钮
2. 系统会生成一个唯一的链接，可以分享给他人查看

#### 主题切换

- 点击界面右上角的主题切换按钮，可以在浅色和深色主题之间切换
- 系统会记住您的主题偏好，下次访问时自动应用

#### 文档打印

- 在预览页面，点击打印按钮可以打印当前文档

## 🔍 故障排除

### DOCX转换问题

如果在使用 DOCX 转换功能时遇到问题，请尝试以下步骤：

1. 点击界面上的"系统检查"按钮，确认 Pandoc 状态
2. 如果显示"Pandoc 不可用"，请按照上述安装步骤进行配置
3. 如果已经安装但仍不可用，请尝试将 pandoc.exe 直接放在项目根目录或 pandoc 子目录下
4. 确认未将 pandoc.exe 上传到 GitHub，仅需本地存在即可

### 文件编码问题

- 系统支持自动检测文件编码，但对于特殊编码的文件可能会出现乱码
- 建议使用UTF-8编码保存文件以获得最佳兼容性

### 大文件处理

- 转换大型DOCX或PDF文件可能需要较长时间，请耐心等待
- 系统默认限制上传文件大小为16MB，可以在app.py中修改`MAX_CONTENT_LENGTH`参数

## 💻 开发者信息

### 技术栈

- 后端：Flask (Python)
- 前端：HTML, CSS, JavaScript
- 文档转换：Pandoc, pdfplumber
- 样式：Modern CSS, Font Awesome

### 项目结构

```
├── app.py              # 主应用程序
├── requirements.txt    # 依赖项列表
├── static/            # 静态资源
│   ├── css/           # 样式表
│   ├── js/            # JavaScript文件
│   └── images/        # 图像资源
├── templates/         # HTML模板
│   ├── index.html     # 主页模板
│   └── preview.html   # 预览页模板
├── uploads/           # 上传文件存储目录
└── pandoc/            # Pandoc可执行文件目录
```

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Flask](https://flask.palletsprojects.com/) - Web框架
- [Pandoc](https://pandoc.org/) - 文档转换工具
- [Marked.js](https://marked.js.org/) - Markdown解析器
- [Highlight.js](https://highlightjs.org/) - 代码高亮
- [Font Awesome](https://fontawesome.com/) - 图标库

---

<div align="center">

**MarkStudio** - 让Markdown编辑更简单、更高效

</div>
