import os
import sys
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import numpy as np
from torchvision import transforms
from clothes.models import build_model
from clothes.configs import get_config
import argparse

# 检查必要的依赖
try:
    import python_multipart
except ImportError:
    print("错误: 缺少必要的依赖包 'python-multipart'")
    print("请运行: pip install python-multipart")
    sys.exit(1)

app = FastAPI(title="衣物分类 API")

# 配置参数
parser = argparse.ArgumentParser('Swin Transformer single image testing', add_help=False)
parser.add_argument('--cfg', type=str, default='clothes/configs/swinv2/swinv2_large_patch4_window12_192_22k.yaml', 
                    metavar="FILE", help='path to config file')
parser.add_argument('--checkpoint', type=str, 
                    default='clothes/output/swinv2_large_patch4_window12_192_22k/class20_8shot_v4/ckpt_epoch_88.pth', 
                    help='path to model checkpoint')

args, _ = parser.parse_known_args()

# 检查配置文件是否存在
if not os.path.exists(args.cfg):
    print(f"错误: 配置文件不存在: {args.cfg}")
    sys.exit(1)

# 检查模型文件是否存在
if not os.path.exists(args.checkpoint):
    print(f"错误: 模型文件不存在: {args.checkpoint}")
    sys.exit(1)

try:
    config = get_config(args)
except Exception as e:
    print(f"错误: 加载配置文件失败: {str(e)}")
    sys.exit(1)

# 加载模型
try:
    model = build_model(config)
    checkpoint = torch.load(args.checkpoint, map_location='cpu')
    model.load_state_dict(checkpoint['model'])
    model.eval()
except Exception as e:
    print(f"错误: 加载模型失败: {str(e)}")
    sys.exit(1)

# 图像预处理
transform = transforms.Compose([
    transforms.Resize((config.DATA.IMG_SIZE, config.DATA.IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("https://f84e-202-120-234-217.ngrok-free.app/classify")
async def classify_image(file: UploadFile = File(...)):
    try:
        # 检查文件类型
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="只支持图片文件")
            
        # 读取上传的图片
        contents = await file.read()
        try:
            image = Image.open(io.BytesIO(contents)).convert('RGB')
        except Exception as e:
            raise HTTPException(status_code=400, detail="无法读取图片文件")
        
        # 预处理图像
        image_tensor = transform(image).unsqueeze(0)
        
        # 进行预测
        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.softmax(output, dim=1)
            top_probs, top_classes = probabilities.topk(5, dim=1)
            
            # 获取前5个预测结果
            results = []
            for prob, class_idx in zip(top_probs[0], top_classes[0]):
                results.append({
                    "class_id": int(class_idx),
                    "probability": float(prob)
                })
        
        return JSONResponse(content={
            "status": "success",
            "predictions": results
        })
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("启动衣物分类 API 服务...")
    print(f"服务地址: http://localhost:8000")
    print(f"API文档: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000) 