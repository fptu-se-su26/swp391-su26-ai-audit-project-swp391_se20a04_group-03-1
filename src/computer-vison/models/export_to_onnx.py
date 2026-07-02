from ultralytics import YOLO
import os

def export_model(pt_path):
    if not os.path.exists(pt_path):
        print(f"File not found: {pt_path}")
        return
    
    print(f"Loading {pt_path}...")
    model = YOLO(pt_path)
    
    print(f"Exporting {pt_path} to ONNX format...")
    # Export the model to ONNX format. 
    # opset=11 is generally recommended for Hailo compatibility.
    path = model.export(format="onnx", opset=11, simplify=True)
    print(f"Export successful. ONNX model saved at: {path}")

if __name__ == "__main__":
    # Lấy đường dẫn của thư mục chứa script này (tức là thư mục models/)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    models_to_export = [
        os.path.join(base_dir, "best.pt"), 
        os.path.join(base_dir, "container-code.pt")
    ]
    
    for model_file in models_to_export:
        export_model(model_file)
