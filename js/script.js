// 页面加载完成后执行
$(document).ready(function() {
    // 导航切换
    $('.nav-link').click(function(e) {
        e.preventDefault();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        const targetSection = $(this).data('section');
        $('.content-section').addClass('d-none').removeClass('active');
        $(`#${targetSection}`).removeClass('d-none').addClass('active');
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
        alert('加密功能需要后端API支持');
    });
    
    $('#printDecodeForm').submit(function(e) {
        e.preventDefault();
        alert('解密功能需要后端API支持');
    });
    
    $('#textureEncodeForm').submit(function(e) {
        e.preventDefault();
        alert('加密功能需要后端API支持');
    });
    
    $('#textureDecodeForm').submit(function(e) {
        e.preventDefault();
        alert('解密功能需要后端API支持');
    });
    
    // 衣物识别API调用
    $('#clothesClassifyForm').submit(function(e) {
        e.preventDefault();
        if (!$('#clothesImage').val()) {
            alert('请选择要识别的图片');
            return;
        }
        var formData = new FormData(this);
        var $btn = $(this).find('button[type="submit"]');
        $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>识别中...').prop('disabled', true);
        $.ajax({
            url: ' https://3756c5c4ce2a.ngrok-free.app/classify', // 只拼接/classify，主机部分留空，方便ngrok
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $btn.html('<i class="fas fa-search me-2"></i>识别服饰').prop('disabled', false);
                if (response.status === 'success' && response.predictions && response.predictions.length > 0) {
                    // 显示结果
                    var results = response.predictions;
                    // 假设有类别映射表
                    var classMap = {
                        0: '汉族', 1: '蒙古族', 2: '藏族', 3: '苗族', 4: '彝族', 5: '壮族', 6: '布依族', 7: '维吾尔族', 8: '回族', 9: '朝鲜族',
                        10: '满族', 11: '侗族', 12: '瑶族', 13: '白族', 14: '土家族', 15: '傣族', 16: '僳僳族', 17: '畲族', 18: '羌族', 19: '俄罗斯族'
                    };
                    // 主结果
                    var top = results[0];
                    $('#topNation').text(classMap[top.class_id] || top.class_id);
                    $('#topProbability').text((top.probability * 100).toFixed(2) + '%');
                    $('#topProbabilityBar').css('width', (top.probability * 100) + '%');
                    // 其它结果
                    $('#otherResults').empty();
                    for (var i = 1; i < results.length; i++) {
                        var r = results[i];
                        var percent = (r.probability * 100).toFixed(2);
                        var width = Math.max(5, r.probability * 100);
                        var html = `<div class="other-result-item mb-2"><div class="d-flex justify-content-between align-items-center"><span class="nation-name">${classMap[r.class_id] || r.class_id}</span><span class="probability-value">${percent}%</span></div><div class="progress mt-1" style="height: 4px;"><div class="progress-bar" role="progressbar" style="width: ${width}%" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div></div></div>`;
                        $('#otherResults').append(html);
                    }
                    // 显示民族简介
                    showNationInfo(classMap[top.class_id] || top.class_id);
                    // 显示结果区域
                    $('#clothesResult').removeClass('d-none');
                    $('html, body').animate({scrollTop: $('#clothesResult').offset().top - 100}, 500);
                } else {
                    alert('无法识别服饰，请尝试其他图片');
                }
            },
            error: function(xhr, status, error) {
                $btn.html('<i class="fas fa-search me-2"></i>识别服饰').prop('disabled', false);
                alert('识别请求失败，请检查API服务或网络。');
            }
        });
    });
    
    // 显示民族简介信息
    function showNationInfo(nation) {
        const nationInfo = getNationDescription(nation);
        if (nationInfo) {
            $('#nationInfoTitle').text(nation + '服饰特点');
            $('#nationDescription').html(nationInfo);
            $('#nationInfo').removeClass('d-none');
        } else {
            $('#nationInfo').addClass('d-none');
        }
    }
    
    // 获取民族简介
    function getNationDescription(nation) {
        const descriptions = {
            '汉族': '汉族服饰历史悠久，风格多样，常见的有旗袍、长衫、马褂等。传统汉服以宽袖、交领、系带为特点，颜色多为素雅，刺绣精美，象征着中华文明的源远流长。',
            '蒙古族': '蒙古族服饰以长袍为主，称为"蒙古袍"，特点是大襟、对襟，腰间系带。男女服装区别不大，颜色鲜艳，多以棉布、皮毛、呢绒为材料，适应北方游牧生活。',
            // ... 其他民族描述保持不变 ...
        };
        return descriptions[nation] || null;
    }
}); 
