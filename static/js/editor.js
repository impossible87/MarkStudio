// 初始化标记库配置
marked.setOptions({
    breaks: true,      // 启用换行符
    gfm: true,         // 启用GitHub风格的Markdown
    headerIds: true,   // 为标题添加ID
    sanitize: false,   // 不清理HTML（允许HTML标签）
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, code).value;
            } catch(e) {}
        }
        return hljs.highlightAuto(code).value;
    }
});

// DOM元素
const markdownInput = document.getElementById('markdownInput');
const htmlPreview = document.getElementById('htmlPreview');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');
const loadBtn = document.getElementById('loadBtn');
const fileInput = document.getElementById('fileInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const themeToggle = document.getElementById('themeToggle');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const checkSystemBtn = document.getElementById('checkSystemBtn');
const systemInfoModal = document.getElementById('systemInfoModal');
const systemInfoContent = document.getElementById('systemInfoContent');
const moreActionsBtn = document.getElementById('moreActionsBtn');
const copyEditorBtn = document.getElementById('copyEditorBtn');
const clearEditorBtn = document.getElementById('clearEditorBtn');
const syncScrollBtn = document.getElementById('syncScrollBtn');
const togglePreviewBtn = document.getElementById('togglePreviewBtn');
const shareModal = document.getElementById('shareModal');
const shareTitle = document.getElementById('shareTitle');
const shareUrl = document.getElementById('shareUrl');
const createShareBtn = document.getElementById('createShareBtn');
const cancelShareBtn = document.getElementById('cancelShareBtn');
const copyShareUrlBtn = document.getElementById('copyShareUrlBtn');

// 格式工具按钮
const formatTools = document.querySelectorAll('.tool-btn');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题
    initTheme();
    
    // 初始化编辑器
    initEditor();
    
    // 绑定事件
    bindEvents();
    
    // 检查URL参数是否有文档ID
    checkForDocumentId();
});

// 主题初始化和切换
function initTheme() {
    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
}

// 初始化编辑器
function initEditor() {
    // 初始化预览
    updatePreview();
    
    // 自动调整文本区域高度
    autoResizeTextarea();
}

// 自动调整文本区域高度
function autoResizeTextarea() {
    // 设置编辑器自动增高
    markdownInput.style.height = '300px'; // 初始高度
    markdownInput.addEventListener('input', function() {
        this.style.height = '300px'; // 重置高度，防止内容减少时不缩小
        this.style.height = Math.max(300, this.scrollHeight) + 'px';
    });
}

// 绑定事件处理
function bindEvents() {
    // 主题切换事件
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // 实时预览功能
    markdownInput.addEventListener('input', function() {
        updatePreview();
    });
    
    // 保存按钮点击事件
    saveBtn.addEventListener('click', saveMarkdown);
    
    // 加载按钮点击事件
    loadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 文件输入变化事件
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFileUpload(this.files[0]);
        }
    });
    
    // 系统检查按钮点击事件
    checkSystemBtn.addEventListener('click', checkSystemInfo);
    
    // 关闭模态框事件
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(el => {
        el.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // 监听粘贴事件
    markdownInput.addEventListener('paste', handlePaste);
    
    // 监听拖放事件
    markdownInput.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    markdownInput.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    markdownInput.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // 更多操作按钮
    moreActionsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = this.nextElementSibling;
        dropdown.classList.toggle('show');
    });
    
    // 点击其他区域关闭下拉菜单
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });
    
    // 复制编辑器内容
    copyEditorBtn.addEventListener('click', function() {
        const text = markdownInput.value;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('内容已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            showNotification('复制失败，请手动选择并复制', 'error');
        });
    });
    
    // 清空编辑器
    clearEditorBtn.addEventListener('click', function() {
        if (confirm('确定要清空编辑器吗？此操作不可撤销！')) {
            markdownInput.value = '';
            updatePreview();
            markdownInput.style.height = 'auto';
        }
    });
    
    // 同步滚动切换
    syncScrollBtn.addEventListener('click', function() {
        this.classList.toggle('active');
    });
    
    // 全屏预览切换
    togglePreviewBtn.addEventListener('click', function() {
        const editorContent = document.querySelector('.editor-content');
        editorContent.classList.toggle('preview-only');
        
        if (editorContent.classList.contains('preview-only')) {
            this.innerHTML = '<i class="fas fa-compress"></i>';
            this.setAttribute('data-tooltip', '退出全屏');
        } else {
            this.innerHTML = '<i class="fas fa-expand"></i>';
            this.setAttribute('data-tooltip', '全屏预览');
        }
    });
    
    // 编辑器滚动时同步预览滚动位置
    markdownInput.addEventListener('scroll', function() {
        if (syncScrollBtn.classList.contains('active')) {
            const percentage = this.scrollTop / (this.scrollHeight - this.clientHeight);
            const previewScrollTop = percentage * (htmlPreview.scrollHeight - htmlPreview.clientHeight);
            htmlPreview.scrollTop = previewScrollTop;
        }
    });
    
    // 预览滚动时同步编辑器滚动位置
    htmlPreview.addEventListener('scroll', function() {
        if (syncScrollBtn.classList.contains('active')) {
            const percentage = this.scrollTop / (this.scrollHeight - this.clientHeight);
            const editorScrollTop = percentage * (markdownInput.scrollHeight - markdownInput.clientHeight);
            markdownInput.scrollTop = editorScrollTop;
        }
    });
    
    // 格式工具点击事件
    formatTools.forEach(tool => {
        tool.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            const level = this.getAttribute('data-level');
            formatMarkdown(format, level);
        });
    });
    
    // 分享按钮点击事件
    shareBtn.addEventListener('click', function() {
        shareModal.style.display = 'block';
        shareTitle.value = '我的Markdown文档';
        shareUrl.value = '';
