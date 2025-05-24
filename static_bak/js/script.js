// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 导航切换
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有导航链接的active类
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 为当前点击的链接添加active类
            this.classList.add('active');
            
            // 获取目标section的ID
            const targetId = this.getAttribute('data-section');
            
            // 隐藏所有内容区域
            contentSections.forEach(section => {
                section.classList.remove('active');
                section.classList.add('d-none');
            });
            
            // 显示目标内容区域
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.classList.remove('d-none');
            }
        });
    });
    
    // 图片预览功能
    function setupImagePreview(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        if (input && preview) {
            input.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                        preview.classList.remove('d-none');
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    }
    
    // 设置各个图片预览
    setupImagePreview('encodeImage', 'encodePreview');
    setupImagePreview('decodeImage', 'decodePreview');
    setupImagePreview('processImage', 'processPreview');
    
    // 随机生成文本
    const generateRandomBtn = document.getElementById('generateRandom');
    const secretMessageInput = document.getElementById('secretMessage');
    
    if (generateRandomBtn && secretMessageInput) {
        generateRandomBtn.addEventListener('click', function() {
            // 生成随机二进制字符串（0和1）- 固定100位
            let randomBinary = '';
            // 生成100位的二进制字符串
            const length = 100;
            
            for (let i = 0; i < length; i++) {
                // 随机生成0或1
                randomBinary += Math.round(Math.random()).toString();
            }
            
            secretMessageInput.value = randomBinary;
        });
    }
    
    // 加密表单提交
    const encodeForm = document.getElementById('encodeForm');
    const encodeResult = document.getElementById('encodeResult');
    const encodedImage = document.getElementById('encodedImage');
    const downloadEncodedBtn = document.getElementById('downloadEncodedBtn');
    
    if (encodeForm) {
        encodeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 显示加载状态
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this);
            
            fetch('/encode', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // 恢复按钮状态
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                if (data.success) {
                    // 显示加密结果
                    encodedImage.src = 'data:image/png;base64,' + data.encoded_image;
                    downloadEncodedBtn.href = '/download/' + data.encoded_filename;
                    encodeResult.classList.remove('d-none');
                } else {
                    alert('错误: ' + data.error);
                }
            })
            .catch(error => {
                // 恢复按钮状态
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                alert('请求失败: ' + error);
            });
        });
    }
    
    // 解密表单提交
    const decodeForm = document.getElementById('decodeForm');
    const decodeResult = document.getElementById('decodeResult');
    const decodedMessage = document.getElementById('decodedMessage');
    const decodedBinary = document.getElementById('decodedBinary');
    const accuracyResult = document.getElementById('accuracyResult');
    const decodedAccuracy = document.getElementById('decodedAccuracy');
    const accuracyProgressBar = document.getElementById('accuracyProgressBar');
    const matchCount = document.getElementById('matchCount');
    const totalBits = document.getElementById('totalBits');
    
    if (decodeForm) {
        decodeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 显示加载状态
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this);
            
            fetch('/decode', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // 恢复按钮状态
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                if (data.success) {
                    // 显示解密结果
                    decodedMessage.textContent = data.decoded_message;
                    
                    // 使用spans显示二进制并高亮错误位
                    decodedBinary.innerHTML = '';
                    const wrongBits = data.wrong_bits || [];
                    for (let i = 0; i < data.decoded_binary.length; i++) {
                        const bit = document.createElement('span');
                        bit.className = 'bit';
                        bit.textContent = data.decoded_binary[i];
                        
                        // 如果位于错误位列表中，标记为错误
                        if (wrongBits.includes(i)) {
                            bit.classList.add('error');
                            bit.title = `位置 ${i+1}: 原始值应为 ${data.decoded_binary[i] === '0' ? '1' : '0'}`;
                        } else {
                            bit.classList.add('correct');
                            bit.title = `位置 ${i+1}: 正确值`;
                        }
                        
                        decodedBinary.appendChild(bit);
                        
                        // 每10位添加一个空格，提高可读性
                        if ((i + 1) % 10 === 0 && i < data.decoded_binary.length - 1) {
                            decodedBinary.appendChild(document.createTextNode(' '));
                        }
                    }
                    
                    decodeResult.classList.remove('d-none');
                    
                    // 使用新的函数更新准确率显示
                    if (data.accuracy) {
                        updateAccuracy(data);
                    } else {
                        // 如果没有准确率信息则隐藏
                        document.getElementById('accuracyResult').classList.add('d-none');
                    }
                } else {
                    alert('错误: ' + data.error);
                }
            })
            .catch(error => {
                // 恢复按钮状态
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                alert('请求失败: ' + error);
            });
        });
    }
    
    // 图像处理表单提交
    const processForm = document.getElementById('processForm');
    const processResult = document.getElementById('processResult');
    const processedImage = document.getElementById('processedImage');
    const downloadProcessedBtn = document.getElementById('downloadProcessedBtn');
    
    if (processForm) {
        processForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 显示加载状态
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this);
            
            fetch('/process', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // 恢复按钮状态
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                if (data.success) {
                    // 显示处理结果
                    processedImage.src = 'data:image/png;base64,' + data.processed_image;
                    
                    // 确保downloadProcessedBtn存在再设置href
                    if (downloadProcessedBtn) {
                        downloadProcessedBtn.href = '/download/' + data.processed_filename;
                    }
                    
                    processResult.classList.remove('d-none');
                    
                    // 隐藏处理后的解密结果
                    document.getElementById('processedDecodeResult').classList.add('d-none');
                } else {
                    alert('错误: ' + data.error);
                }
            })
            .catch(error => {
                // 恢复按钮状态
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                alert('请求失败: ' + error);
            });
        });
    }
    
    // 解密处理后的图像
    const decodeProcessedBtn = document.getElementById('decodeProcessedBtn');

    if (decodeProcessedBtn) {
        decodeProcessedBtn.addEventListener('click', function() {
            showLoading('处理图像解码中...');
            
            fetch('/decode_processed')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP错误: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    hideLoading();
                    
                    if (!data.success) {
                        alert('解码失败: ' + (data.error || '未知错误'));
                        return;
                    }
                    
                    console.log('收到解码结果:', data); // 调试输出
                    
                    const decodeResult = document.getElementById('processedDecodeResult');
                    decodeResult.classList.remove('d-none');
                    
                    // 显示解码消息 - 兼容两种可能的属性名
                    const decodedMessageText = data.message || data.decoded_binary || data.decoded_message || '';
                    document.getElementById('processedDecodedMessage').textContent = decodedMessageText;
                    
                    // 高亮显示二进制细节
                    const binaryContainer = document.getElementById('processedDecodedBinary');
                    binaryContainer.innerHTML = '';
                    
                    // 确保错误位数组存在
                    const wrongBits = data.wrong_bits || [];
                    const binaryText = data.decoded_binary || data.message || '';
                    
                    // 遍历二进制数据
                    for (let i = 0; i < binaryText.length; i++) {
                        const bit = document.createElement('span');
                        bit.classList.add('bit');
                        bit.textContent = binaryText[i];
                        
                        // 检查这个位是否是错误的
                        if (wrongBits.includes(i)) {
                            bit.classList.add('error');
                            const expectedBit = binaryText[i] === '0' ? '1' : '0';
                            bit.setAttribute('title', `应该是 ${expectedBit}`);
                        } else {
                            bit.classList.add('correct');
                            bit.setAttribute('title', '正确位');
                        }
                        
                        // 每10位添加一个空格，提高可读性
                        if (i > 0 && i % 10 === 0) {
                            binaryContainer.appendChild(document.createTextNode(' '));
                        }
                        
                        binaryContainer.appendChild(bit);
                    }
                    
                    // 显示准确率信息
                    if (data.accuracy) {
                        const accuracyResult = document.getElementById('processedAccuracyResult');
                        accuracyResult.classList.remove('d-none');
                        
                        // 计算准确率
                        let correctCount = data.matches || (binaryText.length - wrongBits.length);
                        let totalCount = data.total || binaryText.length;
                        let accuracy = data.accuracy || ((correctCount / totalCount) * 100).toFixed(2) + '%';
                        
                        // 移除百分号以便数值计算
                        let accuracyValue = parseFloat(accuracy.replace('%', ''));
                        
                        document.getElementById('processedDecodedAccuracy').textContent = accuracy;
                        document.getElementById('processedCorrectBits').textContent = correctCount;
                        document.getElementById('processedWrongBits').textContent = wrongBits.length;
                        
                        // 设置进度条
                        document.getElementById('processedAccuracyProgressBar').style.width = `${accuracyValue}%`;
                        
                        // 根据准确率设置进度条颜色
                        const progressBar = document.getElementById('processedAccuracyProgressBar');
                        progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated';
                        
                        if (accuracyValue >= 90) {
                            progressBar.classList.add('bg-success');
                        } else if (accuracyValue >= 70) {
                            progressBar.classList.add('bg-info');
                        } else if (accuracyValue >= 50) {
                            progressBar.classList.add('bg-warning');
                        } else {
                            progressBar.classList.add('bg-danger');
                        }
                    }
                })
                .catch(error => {
                    hideLoading();
                    console.error('解码处理后图像出错:', error);
                    alert('解码处理后图像出错: ' + error.message);
                });
        });
    }
    
    // 添加动态加载效果
    setupDynamicEffects();
});

// 解码后更新准确率显示
function updateAccuracy(data) {
    if (data.accuracy) {
        const accuracyResult = document.getElementById('accuracyResult');
        const accuracyValue = document.getElementById('decodedAccuracy');
        const progressBar = document.getElementById('accuracyProgressBar');
        const correctBits = document.getElementById('correctBits');
        const wrongBits = document.getElementById('wrongBits');
        
        accuracyResult.classList.remove('d-none');
        
        // 设置准确率文本
        accuracyValue.textContent = data.accuracy;
        
        // 设置进度条
        const accuracyPercent = parseFloat(data.accuracy);
        progressBar.style.width = accuracyPercent + '%';
        
        // 根据准确率设置进度条颜色
        if (accuracyPercent >= 90) {
            progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
        } else if (accuracyPercent >= 70) {
            progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-info';
        } else if (accuracyPercent >= 50) {
            progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-warning';
        } else {
            progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-danger';
        }
        
        // 设置匹配位数
        correctBits.textContent = data.matches;
        wrongBits.textContent = data.total - data.matches;
    }
}

// 添加动态加载效果
function setupDynamicEffects() {
    // 添加数据流动画
    const dataBars = document.querySelectorAll('.data-bar');
    dataBars.forEach(bar => {
        bar.style.animationDelay = `${Math.random() * 2}s`;
    });
    
    // 移除卡片悬浮效果以保持界面稳定
    // const cards = document.querySelectorAll('.card');
    // cards.forEach(card => {
    //     card.addEventListener('mouseenter', function() {
    //         this.style.transform = `perspective(2000px) rotateX(${Math.random() * 2 - 1}deg) rotateY(${Math.random() * 4 - 2}deg) translateY(-5px)`;
    //     });
    //     
    //     card.addEventListener('mouseleave', function() {
    //         this.style.transform = '';
    //     });
    // });
    
    // 添加角落装饰动画
    const corners = document.querySelectorAll('.corner-decoration');
    corners.forEach(corner => {
        corner.style.animationDelay = `${Math.random() * 3}s`;
    });
}

// 加载状态显示
function showLoading(message) {
    // 如果已存在加载层则返回
    if (document.getElementById('loadingOverlay')) return;
    
    // 创建加载遮罩
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 10, 20, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        flex-direction: column;
        backdrop-filter: blur(5px);
    `;
    
    // 创建加载容器
    const loadingContainer = document.createElement('div');
    loadingContainer.style.cssText = `
        background-color: rgba(0, 30, 60, 0.7);
        border: 1px solid rgba(0, 204, 255, 0.3);
        border-radius: 0;
        padding: 30px 50px;
        text-align: center;
        max-width: 80%;
        position: relative;
        transform: perspective(1000px) rotateX(3deg);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 204, 255, 0.3);
        clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);
    `;
    
    // 创建加载动画
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary';
    spinner.style.width = '3rem';
    spinner.style.height = '3rem';
    spinner.setAttribute('role', 'status');
    
    // 创建加载信息
    const loadingText = document.createElement('div');
    loadingText.style.cssText = `
        margin-top: 15px;
        color: var(--text-color);
        font-size: 1.2rem;
    `;
    loadingText.textContent = message || '处理中...';
    
    // 添加数据条
    const dataBar = document.createElement('div');
    dataBar.className = 'data-bar';
    dataBar.style.bottom = '0';
    
    // 添加角落装饰
    const corner = document.createElement('div');
    corner.className = 'corner-decoration top-right';
    
    // 组装元素
    loadingContainer.appendChild(corner);
    loadingContainer.appendChild(dataBar);
    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(loadingText);
    overlay.appendChild(loadingContainer);
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        // 添加淡出动画
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        
        // 移除元素
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
} 