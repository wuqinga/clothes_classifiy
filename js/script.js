// 页面加载完成后执行
$(document).ready(function() {
    // 导航切换
    $('.nav-link').click(function(e) {
        e.preventDefault();
        
        // 移除所有导航项的active类
        $('.nav-link').removeClass('active');
        // 为当前点击的导航项添加active类
        $(this).addClass('active');
        
        // 获取目标部分
        const targetSection = $(this).data('section');
        
        // 隐藏所有内容部分
        $('.content-section').addClass('d-none');
        // 显示目标部分
        $(`#${targetSection}`).removeClass('d-none');
    });
    
    // 生成随机二进制序列
    function generateRandomBinary(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.round(Math.random());
        }
        return result;
    }
    
    // 生成随机数值
    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // 图片预览功能
    function setupImagePreview(inputId, previewId) {
        $(`#${inputId}`).change(function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $(`#${previewId}`).attr('src', e.target.result).removeClass('d-none');
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // 设置所有图片预览
    setupImagePreview('printEncodeImage', 'printEncodePreview');
    setupImagePreview('printDecodeImage', 'printDecodePreview');
    setupImagePreview('textureEncodeImage', 'textureEncodePreview');
    setupImagePreview('textureDecodeImage', 'textureDecodePreview');
    setupImagePreview('clothesImage', 'clothesPreview');
    
    // 随机生成按钮事件
    $('#printGenerateRandom').click(function() {
        $('#printSecretMessage').val(generateRandomNumber(0, 65535));
    });
    
    $('#textureGenerateRandom').click(function() {
        $('#textureSecretMessage').val(generateRandomBinary(Math.floor(Math.random() * 10) + 5));
    });
    
    // 表单提交事件
    $('#printEncodeForm').submit(function(e) {
        e.preventDefault();
        // TODO: 实现加密API调用
        alert('加密功能需要后端API支持');
    });
    
    $('#printDecodeForm').submit(function(e) {
        e.preventDefault();
        // TODO: 实现解密API调用
        alert('解密功能需要后端API支持');
    });
    
    $('#textureEncodeForm').submit(function(e) {
        e.preventDefault();
        // TODO: 实现加密API调用
        alert('加密功能需要后端API支持');
    });
    
    $('#textureDecodeForm').submit(function(e) {
        e.preventDefault();
        // TODO: 实现解密API调用
        alert('解密功能需要后端API支持');
    });
    
    $('#clothesClassifyForm').submit(function(e) {
        e.preventDefault();
        // TODO: 实现分类API调用
        alert('分类功能需要后端API支持');
    });
}); 