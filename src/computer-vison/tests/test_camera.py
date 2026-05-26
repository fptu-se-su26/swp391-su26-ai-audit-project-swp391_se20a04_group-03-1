import cv2
import sys

def test_camera(index=0):
    print(f"=== TESTING CAMERA CONNECTION (INDEX: {index}) ===")
    print("Press 'q' or 'ESC' to close the window.")
    
    cap = cv2.VideoCapture(index)
    if not cap.isOpened():
        print(f"ERROR: Could not open camera source with index {index}.")
        print("Please check your camera connections or try a different index (e.g. 1, 2).")
        sys.exit(1)
        
    print("SUCCESS: Camera opened successfully. Launching display window...")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("ERROR: Failed to read frame from camera.")
            break
            
        # Draw camera info on screen
        h, w, _ = frame.shape
        cv2.putText(frame, f"Cam Index: {index} | Res: {w}x{h}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, "Press 'q' to Quit", (20, 80), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
        cv2.imshow(f"Camera Test (Index {index})", frame)
        
        # Press 'q' or ESC (27) to close
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            break
            
    cap.release()
    cv2.destroyAllWindows()
    print("Camera released. Window closed successfully.")

if __name__ == '__main__':
    # Allow choosing camera index via command line argument, e.g. python test_camera.py 1
    cam_index = 0
    if len(sys.argv) > 1:
        try:
            cam_index = int(sys.argv[1])
        except ValueError:
            pass
            
    test_camera(cam_index)
