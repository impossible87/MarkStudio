document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdownInput');
    const htmlPreview = document.getElementById('htmlPreview');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const themeToggle = document.getElementById('themeToggle');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const checkSystemBtn = document.getElementById('checkSystemBtn');
    const systemInfoModal = document.getElementById('systemInfoModal');
    const systemInfoContent = document.getElementById('systemInfoContent');

    // 初始化主题
    initTheme();

    // 初始化marked库配置
    marked.setOptions({
        breaks: true,        // 启用换行符
        gfm: true,           // 启用GitHub风格的Markdown
        headerIds: true,     // 为标题添加ID
        sanitize: false,     // 不清理HTML（允许HTML标签）
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, code).value;
                } catch(e) {}
            }
            return hljs.highlightAuto(code).value;
        }
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

    // 显示通知
    function showNotification(message, type = 'success') {
        notificationText.textContent = message;
        
        // 设置通知类型样式
        notification.className = 'notification';
        if (type === 'error') {
            notification.style.backgroundColor = 'var(--error-color)';
        } else if (type === 'warning') {
            notification.style.backgroundColor = 'var(--warning-color)';
        } else {
            notification.style.backgroundColor = 'var(--success-color)';
        }
        
        // 显示通知
        notification.classList.add('show');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // 显示加载动画
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    // 隐藏加载动画
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // 系统信息检查
    function checkSystemInfo() {
        showLoading();
        
        fetch('/system-info')
            .then(response => response.json())
            .then(data => {
                hideLoading();
                
                // 格式化系统信息
                let html = '';
                
                // Pandoc状态
                html += '<div class="info-item">';
                html += '<div class="info-label">Pandoc状态:</div>';
                if (data.pandoc_available) {
                    html += '<div class="info-value status-ok">✓ Pandoc可用</div>';
                } else {
                    html += '<div class="info-value status-error">✗ Pandoc不可用</div>';
                    html += '<div class="info-value">请确保Pandoc已安装并添加到环境变量或放置在项目目录中。</div>';
                    html += '<div class="info-value">Windows用户可以从<a href="https://pandoc.org/installing.html" target="_blank">Pandoc官网</a>下载安装包。</div>';
                    html += '<div class="info-value">安装后，将pandoc.exe放入项目根目录或命名为pandoc的子目录中。</div>';
                }
                html += '</div>';
                
                // Python版本
                html += '<div class="info-item">';
                html += '<div class="info-label">Python版本:</div>';
                html += `<div class="info-value">${data.python_version}</div>`;
                html += '</div>';
                
                // 当前目录
                html += '<div class="info-item">';
                html += '<div class="info-label">当前目录:</div>';
                html += `<div class="info-value">${data.current_dir}</div>`;
                html += '</div>';
                
                // 环境变量PATH (仅显示部分)
                html += '<div class="info-item">';
                html += '<div class="info-label">环境变量PATH:</div>';
                const pathDisplay = data.os_path.length > 100 ? 
                    data.os_path.substring(0, 100) + '...' : 
                    data.os_path;
                html += `<div class="info-value">${pathDisplay}</div>`;
                html += '</div>';
                
                // 设置HTML内容
                systemInfoContent.innerHTML = html;
                
                // 显示模态框
                systemInfoModal.style.display = 'block';
            })
            .catch(error => {
                hideLoading();
                console.error('检查系统信息出错:', error);
                showNotification('检查系统信息失败，请查看控制台获取详细信息。', 'error');
            });
    }

    // 模态框关闭事件
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(el => {
        el.addEventListener('click', function() {
            systemInfoModal.style.display = 'none';
        });
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === systemInfoModal) {
            systemInfoModal.style.display = 'none';
        }
    });

    // 系统检查按钮点击事件
    checkSystemBtn.addEventListener('click', checkSystemInfo);

    // 实时预览功能
    function updatePreview() {
        const markdownText = markdownInput.value;
        const htmlContent = marked.parse(markdownText);
        htmlPreview.innerHTML = htmlContent;
        
        // 初始化代码高亮
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }

    // 监听输入变化，实时更新预览
    markdownInput.addEventListener('input', updatePreview);
    
    // 监听粘贴事件
    markdownInput.addEventListener('paste', function(e) {
        // 如果不是文本粘贴，则不处理
        if (!e.clipboardData || !e.clipboardData.items) {
            return;
        }
        
        const items = e.clipboardData.items;
        
        // 检查是否有文件被粘贴
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                e.preventDefault(); // 阻止默认粘贴
                const file = items[i].getAsFile();
                if (file) {
                    handleFileUpload(file);
                }
                return;
            }
        }
        
        // 如果是文本粘贴，继续使用默认行为
        // 系统会自动将文本粘贴到textarea中，然后触发input事件更新预览
    });
    
    // 处理文件上传
    function handleFileUpload(file) {
        const fileName = file.name;
        const fileExt = fileName.split('.').pop().toLowerCase();
        
        // 检查文件类型
        const allowedTypes = ['md', 'markdown', 'txt', 'docx', 'pdf'];
        if (!allowedTypes.includes(fileExt)) {
            showNotification('不支持的文件类型！仅支持：Markdown, TXT, DOCX, PDF', 'error');
            return;
        }
        
        showLoading(); // 显示加载动画
        
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/load', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            hideLoading(); // 隐藏加载动画
            
            if (data.success) {
                markdownInput.value = data.content;
                updatePreview();
                showNotification(`文件 ${fileName} 加载成功！`);
            } else {
                showNotification(`加载失败: ${data.message}`, 'error');
                // 如果是Pandoc相关错误，提示检查系统信息
                if (data.message && data.message.includes('Pandoc')) {
                    setTimeout(() => {
                        showNotification('请点击"系统检查"按钮查看详细信息', 'warning');
                    }, 3500);
                }
            }
        })
        .catch(error => {
            hideLoading(); // 确保在出错时也隐藏加载动画
            console.error('加载出错:', error);
            showNotification('加载失败，请查看控制台获取详细信息。', 'error');
        });
    }
    
    // 初始化预览
