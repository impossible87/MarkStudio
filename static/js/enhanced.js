/**
 * 增强型界面交互脚本
 * 为Markdown预览与转换系统提供更现代化的交互体验
 */

document.addEventListener('DOMContentLoaded', function() {
    // 页面加载动画
    const body = document.body;
    setTimeout(() => {
        body.classList.add('loaded');
    }, 300);

    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 工具按钮悬停效果
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('tool-hover');
        });
        button.addEventListener('mouseleave', function() {
            this.classList.remove('tool-hover');
        });
    });

    // 模态框动画效果
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
            }
        });
    });

    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // 点击模态框外部关闭
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                this.classList.remove('show');
            }
        });
    });

    // 编辑器和预览区域的交互效果
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    
    if (editorPane && previewPane) {
        // 添加焦点效果
        const markdownInput = document.getElementById('markdownInput');
        if (markdownInput) {
            markdownInput.addEventListener('focus', function() {
                editorPane.classList.add('pane-focus');
            });
            markdownInput.addEventListener('blur', function() {
                editorPane.classList.remove('pane-focus');
            });
        }

        // 预览区域悬停效果
        previewPane.addEventListener('mouseenter', function() {
            this.classList.add('pane-hover');
        });
        previewPane.addEventListener('mouseleave', function() {
            this.classList.remove('pane-hover');
        });
    }

    // 添加CSS类到body以启用增强动画
    body.classList.add('enhanced-animations');
});