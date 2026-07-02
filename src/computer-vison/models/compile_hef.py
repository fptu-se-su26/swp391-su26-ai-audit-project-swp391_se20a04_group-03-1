import os
import argparse
import glob
import cv2
import numpy as np
from hailo_sdk_client import ClientRunner

def load_calibration_data(image_dir, input_size=640, max_images=64):
    image_paths = glob.glob(os.path.join(image_dir, "*.jpg")) + \
                  glob.glob(os.path.join(image_dir, "*.png"))
    if not image_paths:
        raise ValueError(f"Không tìm thấy ảnh calibration trong {image_dir}")

    images = []
    print(f"Đang tải {min(len(image_paths), max_images)} ảnh thật từ {image_dir} để calibration...")
    for p in image_paths[:max_images]:
        img = cv2.imread(p)
        if img is None:
            continue
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (input_size, input_size))
        images.append(img.astype(np.float32))  # Giữ nguyên 0-255

    return np.stack(images, axis=0)

def compile_hailo_model(onnx_path, hef_path, model_name, calib_dir, hw_arch="hailo8l"):
    print(f"Bắt đầu biên dịch mô hình {onnx_path} cho kiến trúc {hw_arch}...")
    
    # Khởi tạo Runner
    runner = ClientRunner(hw_arch=hw_arch)

    # Bước 1: Parse ONNX sang HAR
    print("1. Parsing ONNX model...")
    har_name = f"{model_name}.har"
    # Lỗi "No valid partition found" chứng tỏ Hailo-8L không thể nhồi nhét nổi phần Head của YOLOv8 (640x640).
    # Ta bắt buộc phải cắt đồ thị sớm hơn, chỉ giữ lại phần Backbone và Neck cho NPU.
    # Toàn bộ phần Head (DFL, Sigmoid) sẽ được trả về cho CPU xử lý.
    end_nodes = [
        "/model.22/cv2.0/cv2.0.2/Conv",
        "/model.22/cv3.0/cv3.0.2/Conv",
        "/model.22/cv2.1/cv2.1.2/Conv",
        "/model.22/cv3.1/cv3.1.2/Conv",
        "/model.22/cv2.2/cv2.2.2/Conv",
        "/model.22/cv3.2/cv3.2.2/Conv"
    ]
    runner.translate_onnx_model(onnx_path, model_name, end_node_names=end_nodes)
    
    runner.save_har(har_name)
    print(f"Đã lưu HAR (chưa lượng tử hóa) tại: {har_name}")

    # Bước 2: Optimize model (Quantization)
    print("2. Optimizing model (Quantization)...")
    
    # Sử dụng cấu hình theo lời khuyên của Claude
    alls_script = (
        "normalization1 = normalization([0.0, 0.0, 0.0], [255.0, 255.0, 255.0])\n"
        "model_optimization_flavor(optimization_level=2)\n"
        "performance_param(compiler_optimization_level=max)"
    )
    runner.load_model_script(alls_script)
    
    # Tải ảnh calibration thật
    calib_dataset = load_calibration_data(calib_dir)
    
    # Bắt đầu optimize
    runner.optimize(calib_dataset)

    # Bước 3: Compile sang HEF
    print("3. Compiling to HEF...")
    hef = runner.compile()

    with open(hef_path, "wb") as f:
        f.write(hef)
        
    print(f"Biên dịch thành công! File HEF được lưu tại: {hef_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Biên dịch ONNX sang HEF cho Hailo-8L")
    parser.add_argument("--onnx", type=str, required=True, help="Đường dẫn đến file ONNX")
    parser.add_argument("--hef", type=str, required=True, help="Đường dẫn file HEF đầu ra")
    parser.add_argument("--name", type=str, default="yolov8", help="Tên model")
    parser.add_argument("--calib_dir", type=str, required=True, help="Thư mục chứa ảnh calibration")
    
    args = parser.parse_args()
    
    compile_hailo_model(args.onnx, args.hef, args.name, args.calib_dir)
