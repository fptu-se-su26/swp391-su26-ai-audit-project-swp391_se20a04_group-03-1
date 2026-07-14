import cv2
import numpy as np
import time
import threading
from scipy.spatial import distance as dist

try:
    from hailo_platform import (HEF, VDevice, HailoStreamInterface, InferVStreams,
                                ConfigureParams, InputVStreamParams, OutputVStreamParams, FormatType)
    HAILO_AVAILABLE = True
except ImportError:
    HAILO_AVAILABLE = False

# Scheduler cho phép nhiều network group (plate + container) cùng chia sẻ 1 NPU
# mà không phải activate/deactivate thủ công mỗi frame. Guard riêng để tương thích
# với các bản HailoRT cũ chưa có API này (khi đó tự fallback về chế độ activate cũ).
try:
    from hailo_platform import HailoSchedulingAlgorithm
    HAILO_SCHEDULER_AVAILABLE = True
except (ImportError, NameError):
    HAILO_SCHEDULER_AVAILABLE = False


def softmax(x, axis=-1):
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / e_x.sum(axis=axis, keepdims=True)

def make_anchors(feats_shape, strides, grid_cell_offset=0.5):
    anchor_points = []
    stride_tensor = []
    for i, stride in enumerate(strides):
        _, _, h, w = feats_shape[i]
        sx = np.arange(w) + grid_cell_offset
        sy = np.arange(h) + grid_cell_offset
        grid_y, grid_x = np.meshgrid(sy, sx, indexing='ij')
        anchor_points.append(np.stack((grid_x, grid_y), axis=-1).reshape(-1, 2))
        stride_tensor.append(np.full((h * w, 1), stride))
    return np.concatenate(anchor_points), np.concatenate(stride_tensor)

def decode_yolov8(outputs_dict):
    strides = [8, 16, 32]
    feats_shape = []
    box_preds = []
    cls_preds = []
    
    outputs = list(outputs_dict.values())
    boxes_tensors = [t for t in outputs if t.shape[-1] == 64]
    cls_tensors = [t for t in outputs if t.shape[-1] != 64]
    
    if len(boxes_tensors) != 3 or len(cls_tensors) != 3:
        return None, None
        
    num_classes = cls_tensors[0].shape[-1]
    boxes_tensors = sorted(boxes_tensors, key=lambda x: x.shape[1], reverse=True)
    cls_tensors = sorted(cls_tensors, key=lambda x: x.shape[1], reverse=True)
    
    for i in range(3):
        b = boxes_tensors[i][0]
        c = cls_tensors[i][0]
        H, W = b.shape[:2]
        feats_shape.append((1, 64, H, W))
        box_preds.append(b.reshape(-1, 64))
        cls_preds.append(c.reshape(-1, num_classes))
        
    box_preds = np.concatenate(box_preds, axis=0)
    cls_preds = np.concatenate(cls_preds, axis=0)
    
    cls_preds = 1 / (1 + np.exp(-cls_preds))
    
    box_preds = box_preds.reshape(-1, 4, 16)
    box_preds = softmax(box_preds, axis=-1)
    dfl_weights = np.arange(16, dtype=np.float32)
    box_preds = np.sum(box_preds * dfl_weights, axis=-1)
    
    anchor_points, stride_tensor = make_anchors(feats_shape, strides)
    lt, rb = np.split(box_preds, 2, axis=-1)
    x1y1 = anchor_points - lt
    x2y2 = anchor_points + rb
    c_xy = (x1y1 + x2y2) / 2
    wh = x2y2 - x1y1
    pred_bboxes = np.concatenate((c_xy, wh), axis=-1) * stride_tensor
    
    return pred_bboxes, cls_preds

class CentroidTracker:
    def __init__(self, maxDisappeared=10, maxDistance=80):
        self.nextObjectID = 0
        self.objects = {}
        self.disappeared = {}
        self.maxDisappeared = maxDisappeared
        self.maxDistance = maxDistance

    def update(self, rects):
        if len(rects) == 0:
            for objectID in list(self.disappeared.keys()):
                self.disappeared[objectID] += 1
                if self.disappeared[objectID] > self.maxDisappeared:
                    self.deregister(objectID)
            return self.objects

        inputCentroids = np.zeros((len(rects), 2), dtype="int")
        inputRects = []
        for (i, (startX, startY, endX, endY)) in enumerate(rects):
            cX = int((startX + endX) / 2.0)
            cY = int((startY + endY) / 2.0)
            inputCentroids[i] = (cX, cY)
            inputRects.append((startX, startY, endX, endY))

        if len(self.objects) == 0:
            for i in range(0, len(inputCentroids)):
                self.register(inputCentroids[i], inputRects[i])
        else:
            objectIDs = list(self.objects.keys())
            objectCentroids = [self.objects[objID][0] for objID in objectIDs]

            D = dist.cdist(np.array(objectCentroids), inputCentroids)
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            usedRows, usedCols = set(), set()

            for (row, col) in zip(rows, cols):
                if row in usedRows or col in usedCols:
                    continue
                if D[row, col] > self.maxDistance:
                    continue
                    
                objectID = objectIDs[row]
                self.objects[objectID] = (inputCentroids[col], inputRects[col])
                self.disappeared[objectID] = 0
                usedRows.add(row)
                usedCols.add(col)

            unusedRows = set(range(0, D.shape[0])).difference(usedRows)
            unusedCols = set(range(0, D.shape[1])).difference(usedCols)

            for row in unusedRows:
                objectID = objectIDs[row]
                self.disappeared[objectID] += 1
                if self.disappeared[objectID] > self.maxDisappeared:
                    self.deregister(objectID)

            for col in unusedCols:
                self.register(inputCentroids[col], inputRects[col])

        return self.objects

    def register(self, centroid, rect):
        self.objects[self.nextObjectID] = (centroid, rect)
        self.disappeared[self.nextObjectID] = 0
        self.nextObjectID += 1

    def deregister(self, objectID):
        del self.objects[objectID]
        del self.disappeared[objectID]

# Chỉ dùng khi KHÔNG có scheduler (fallback): serialize toàn bộ truy cập NPU.
# Khi có scheduler, mỗi model có infer_lock riêng nên plate/container không chặn nhau.
HAILO_DEVICE_LOCK = threading.Lock()

class HailoYOLO:
    """
    Wrapper cho Hailo-8L, hành xử gần giống Ultralytics YOLO.

    Hai chế độ:
    - persistent=True (khuyến nghị, cần scheduler VDevice): mở InferVStreams MỘT LẦN
      và tái sử dụng cho mọi frame → bỏ hoàn toàn chi phí activate()/tạo pipeline mỗi
      frame (nguyên nhân chính gây chậm). Scheduler tự chia lượt NPU giữa các model.
    - persistent=False (fallback bản HailoRT cũ): activate + tạo pipeline mỗi lần infer,
      dùng chung HAILO_DEVICE_LOCK (chậm, nhưng an toàn).
    """
    def __init__(self, hef_path, target_vdevice=None, persistent=False):
        if not HAILO_AVAILABLE:
            raise Exception("hailo_platform not available. Cannot initialize HailoYOLO.")

        self.target = target_vdevice if target_vdevice else VDevice()
        self.hef = HEF(hef_path)
        self.persistent = persistent

        configure_params = ConfigureParams.create_from_hef(self.hef, interface=HailoStreamInterface.PCIe)
        self.network_groups = self.target.configure(self.hef, configure_params)
        self.network_group = self.network_groups[0]
        self.network_group_params = self.network_group.create_params()

        self.input_vstreams_params = InputVStreamParams.make(self.network_group, format_type=FormatType.FLOAT32)
        self.output_vstreams_params = OutputVStreamParams.make(self.network_group, format_type=FormatType.FLOAT32)

        self.input_name = self.hef.get_input_vstream_infos()[0].name

        # Lock riêng cho từng model → cho phép plate & container overlap phần host,
        # chỉ chặn khi CÙNG một model bị gọi từ nhiều camera cùng lúc.
        self.infer_lock = threading.Lock()

        # Mở sẵn pipeline một lần và giữ sống suốt vòng đời tiến trình.
        self._infer_ctx = None
        self.infer_pipeline = None
        if self.persistent:
            self._infer_ctx = InferVStreams(
                self.network_group, self.input_vstreams_params, self.output_vstreams_params
            )
            self.infer_pipeline = self._infer_ctx.__enter__()

    def infer(self, image, conf_threshold=0.5):
        """Chạy inference thuần, trả về danh sách rects [(x1,y1,x2,y2)] ở hệ 640x640."""
        img_resized = cv2.resize(image, (640, 640))
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        input_data = np.expand_dims(img_rgb, axis=0).astype(np.float32)
        input_dict = {self.input_name: input_data}

        if self.persistent:
            # Pipeline đã mở sẵn; scheduler tự activate khi cần. Lock riêng theo model.
            with self.infer_lock:
                output_dict = self.infer_pipeline.infer(input_dict)
        else:
            # Fallback: activate + tạo pipeline mỗi frame, serialize toàn cục.
            with HAILO_DEVICE_LOCK:
                with self.network_group.activate(self.network_group_params):
                    with InferVStreams(self.network_group, self.input_vstreams_params,
                                       self.output_vstreams_params) as infer_pipeline:
                        output_dict = infer_pipeline.infer(input_dict)

        pred_bboxes, cls_preds = decode_yolov8(output_dict)

        rects = []
        if pred_bboxes is not None:
            scores = np.max(cls_preds, axis=1)
            mask = scores > conf_threshold
            pred_bboxes = pred_bboxes[mask]
            scores = scores[mask]

            if len(scores) > 0:
                indices = cv2.dnn.NMSBoxes(pred_bboxes.tolist(), scores.tolist(), conf_threshold, 0.4)
                if len(indices) > 0:
                    for i in indices.flatten():
                        x, y, w, h = pred_bboxes[i]
                        x1 = max(0, x - w / 2)
                        y1 = max(0, y - h / 2)
                        x2 = x + w / 2
                        y2 = y + h / 2
                        rects.append((x1, y1, x2, y2))
        return rects

    def track(self, image, tracker, conf_threshold=0.5):
        """Runs inference and tracking using the provided tracker instance."""
        rects = self.infer(image, conf_threshold=conf_threshold)
        return tracker.update(rects)

    def release(self):
        if self._infer_ctx is not None:
            try:
                self._infer_ctx.__exit__(None, None, None)
            except Exception:
                pass
            self._infer_ctx = None
            self.infer_pipeline = None
