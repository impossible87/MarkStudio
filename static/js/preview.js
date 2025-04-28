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
const printBtn = document.getElementById('printBtn');
const themeToggle = document.getElementById('themeToggle');
const tocContainer = document.getElementById('tocContainer');
const tocToggle = document.getElementById('tocToggle');
const shareLink = document.getElementById('shareLink');
const backToTop = document.getElementById('backToTop');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// 初始化主题
initTheme();

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

// 渲染Markdown内容
function renderMarkdown(markdownText) {
    if (!markdownText) return;
    
    const contentElement = document.getElementById('content');
    const tocElement = document.getElementById('toc');
    
    // 渲染Markdown
    contentElement.innerHTML = marked.parse(markdownText);
    
    // 高亮代码
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
    
    // 生成目录
    generateTOC(contentElement, tocElement);
    
    // 添加图片错误处理
    handleImageErrors();
    
    // 添加表格响应式处理
    makeTablesResponsive();
    
    // 处理链接
    handleLinks();
    
    // 添加复制代码按钮
    addCopyCodeButtons();
    
    // 添加标题锚点
    addHeaderAnchors();
}

// 生成目录
function generateTOC(contentElement, tocElement) {
    const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
        tocContainer.style.display = 'none';
        return;
    }
    
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    
    headings.forEach((heading, index) => {
        // 为标题添加ID，如果没有
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        const level = parseInt(heading.tagName.substring(1));
        const tocItem = document.createElement('li');
        tocItem.className = `toc-item toc-level-${level}`;
        
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // 平滑滚动到目标位置
            heading.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
        
        tocItem.appendChild(link);
        tocList.appendChild(tocItem);
    });
    
    tocElement.appendChild(tocList);
    tocContainer.style.display = 'block';
}

// 为图片添加错误处理
function handleImageErrors() {
    document.querySelectorAll('.markdown-content img').forEach(img => {
        img.onerror = function() {
            this.onerror = null;
            this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 180 100%22%3E%3Crect fill%3D%22%23eee%22 width%3D%22180%22 height%3D%22100%22%2F%3E%3Cpath fill%3D%22%23999%22 d%3D%22M80 40h20v20H80zM60 60h60v5H60z%22%2F%3E%3C%2Fsvg%3E';
            this.alt = '图片加载失败';
            this.classList.add('img-error');
        };
        // 添加点击放大功能
        img.addEventListener('click', function() {
            this.classList.toggle('img-zoomed');
        });
    });
}

// 使表格响应式
function makeTablesResponsive() {
    document.querySelectorAll('.markdown-content table').forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

// 处理链接
function handleLinks() {
    document.querySelectorAll('.markdown-content a').forEach(link => {
        // 如果是外部链接，在新标签页打开
        if (link.hostname !== window.location.hostname && link.hostname !== '') {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            // 添加外部链接图标
            if (!link.querySelector('.fas.fa-external-link-alt')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-external-link-alt external-link-icon';
                link.appendChild(icon);
            }
        }
    });
}

// 添加复制代码按钮
function addCopyCodeButtons() {
    document.querySelectorAll('pre').forEach(pre => {
        if (pre.querySelector('.copy-btn')) return;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = '复制代码';
        
        copyBtn.addEventListener('click', function() {
            const code = pre.querySelector('code');
            const textToCopy = code.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // 成功复制
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                showNotification('代码已复制到剪贴板', 'success');
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                showNotification('复制失败，请手动选择并复制', 'error');
            });
        });
        
        pre.appendChild(copyBtn);
    });
}

// 添加标题锚点
function addHeaderAnchors() {
    document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6').forEach(header => {
        if (header.querySelector('.header-anchor')) return;
        
        const anchor = document.createElement('a');
        anchor.className = 'header-anchor';
        anchor.href = `#${header.id}`;
        anchor.innerHTML = '<i class="fas fa-link"></i>';
        
        header.appendChild(anchor);
    });
}

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

// 打印功能
printBtn.addEventListener('click', function() {
    window.print();
});

// 返回顶部按钮
backToTop.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
