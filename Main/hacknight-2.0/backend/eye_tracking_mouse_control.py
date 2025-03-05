import cv2
import mediapipe as mp
import pyautogui
import numpy as np
import time

class EyeTrackingMouseControl:
    def __init__(self):
        # Disable PyAutoGUI fail-safe (use with caution)
        pyautogui.FAILSAFE = False
        
        # Screen and camera setup
        self.screen_w, self.screen_h = pyautogui.size()
        self.cam = cv2.VideoCapture(0)
        
        # Verify camera is opened
        if not self.cam.isOpened():
            raise RuntimeError("Unable to open camera. Check camera connection.")
        
        # Set camera resolution and fps for better performance
        self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        self.cam.set(cv2.CAP_PROP_FPS, 30)
        
        # Face mesh configuration
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.6,  # Increased confidence
            min_tracking_confidence=0.6
        )
        
        # Sensitivity and smoothing parameters
        self.sensitivity_x = 1.2
        self.sensitivity_y = 1.0
        self.smooth_factor = 0.6
        
        # Position tracking
        self.prev_screen_x = self.screen_w // 2
        self.prev_screen_y = self.screen_h // 2
        
        # Calibration parameters
        self.calibration_frames = 200
        self.x_min, self.x_max = None, None
        self.y_min, self.y_max = None, None
        
        # Enhanced blink detection parameters
        self.blink_state = {
            'is_blinking': False,
            'start_time': 0,
            'duration': 0,
            'last_pos_x': None,
            'last_pos_y': None,
            'click_prepared': False
        }
        
        # Blink detection thresholds
        self.blink_threshold = 0.01
        self.blink_hold_duration = 0.3  # Duration to prepare click
        self.click_cooldown = 0.4
        self.last_click_time = 0
    
    def calibrate(self):
        """Enhanced calibration process with more robust landmark tracking."""
        print("Calibrating... Look around the screen edges.")
        x_vals, y_vals = [], []
        start_time = time.time()
        
        # Position cursor at screen center
        pyautogui.moveTo(self.screen_w // 2, self.screen_h // 2)
        
        while len(x_vals) < self.calibration_frames:
            ret, frame = self.cam.read()
            if not ret:
                print("Failed to capture frame. Retrying...")
                continue
            
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            output = self.face_mesh.process(rgb_frame)
            
            # Calibration visual feedback
            cv2.putText(frame, 
                f"Calibrating: {len(x_vals)}/{self.calibration_frames}", 
                (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow("Calibration", frame)
            
            if output.multi_face_landmarks:
                landmarks = output.multi_face_landmarks[0].landmark
                eye_landmark = landmarks[474]  # Consistent landmark
                x_vals.append(eye_landmark.x)
                y_vals.append(eye_landmark.y)
            
            # Timeout and exit handling
            if time.time() - start_time > 45:
                print("Calibration timed out. Ensure good lighting and face visibility.")
                break
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cv2.destroyWindow("Calibration")
        
        # Validate calibration data
        if len(x_vals) < 50 or len(y_vals) < 50:
            raise ValueError("Insufficient landmarks detected during calibration.")
        
        # Calculate ranges with some buffer
        self.x_min = min(x_vals) * 0.95
        self.x_max = max(x_vals) * 1.05
        self.y_min = min(y_vals) * 0.95
        self.y_max = max(y_vals) * 1.05
        
        print("Calibration complete.")
    
    def map_coordinates(self, x, y, frame_w, frame_h):
        """Precise coordinate mapping with improved range handling."""
        if self.x_min is None:
            return self.screen_w // 2, self.screen_h // 2
        
        # Clamp input within calibration range
        x = max(self.x_min, min(x, self.x_max))
        y = max(self.y_min, min(y, self.y_max))
        
        # Normalize and map to screen
        norm_x = (x - self.x_min) / (self.x_max - self.x_min)
        norm_y = (y - self.y_min) / (self.y_max - self.y_min)
        
        screen_x = int(np.interp(norm_x, [0, 1], [0, self.screen_w]) * self.sensitivity_x)
        screen_y = int(np.interp(norm_y, [0, 1], [0, self.screen_h]) * self.sensitivity_y)
        
        # Smooth movement
        screen_x = int(self.smooth_factor * self.prev_screen_x + 
                       (1 - self.smooth_factor) * screen_x)
        screen_y = int(self.smooth_factor * self.prev_screen_y + 
                       (1 - self.smooth_factor) * screen_y)
        
        # Ensure screen bounds
        screen_x = max(0, min(screen_x, self.screen_w))
        screen_y = max(0, min(screen_y, self.screen_h))
        
        self.prev_screen_x = screen_x
        self.prev_screen_y = screen_y
        
        return screen_x, screen_y
    
    def detect_blink(self, left_eye, screen_x, screen_y):
        """
        Enhanced blink detection with click preparation and position locking
        
        Key improvements:
        1. Prepare click without moving mouse
        2. Lock mouse position during blink
        3. Require sustained blink for click
        """
        current_time = time.time()
        eye_height = abs(left_eye[0].y - left_eye[1].y)
        
        # Blink detection logic
        if eye_height < self.blink_threshold:
            if not self.blink_state['is_blinking']:
                # First frame of blink
                self.blink_state['is_blinking'] = True
                self.blink_state['start_time'] = current_time
                # Lock the current mouse position
                self.blink_state['last_pos_x'] = screen_x
                self.blink_state['last_pos_y'] = screen_y
                self.blink_state['click_prepared'] = False
            
            # Calculate blink duration
            blink_duration = current_time - self.blink_state['start_time']
            
            # Prepare click after a hold duration
            if blink_duration > self.blink_hold_duration:
                self.blink_state['click_prepared'] = True
            
            # Execute click if conditions are met
            if (self.blink_state['click_prepared'] and 
                current_time - self.last_click_time > self.click_cooldown):
                pyautogui.click()
                self.last_click_time = current_time
                return True, self.blink_state['last_pos_x'], self.blink_state['last_pos_y']
        else:
            # Reset blink state when eye opens
            if self.blink_state['is_blinking']:
                self.blink_state['is_blinking'] = False
                self.blink_state['duration'] = 0
                self.blink_state['click_prepared'] = False
        
        return False, screen_x, screen_y
    
    def run(self):
        # Calibration
        try:
            self.calibrate()
        except Exception as e:
            print(f"Calibration failed: {e}")
            return
        
        print("Eye tracking started. Press 'q' to quit.")
        
        while True:
            ret, frame = self.cam.read()
            if not ret:
                print("Frame capture failed")
                break
            
            frame = cv2.flip(frame, 1)
            frame_h, frame_w, _ = frame.shape
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            output = self.face_mesh.process(rgb_frame)
            
            if output.multi_face_landmarks:
                landmarks = output.multi_face_landmarks[0].landmark
                
                # Tracking landmark
                eye_landmark = landmarks[474]
                
                # Compute screen coordinates
                screen_x, screen_y = self.map_coordinates(
                    eye_landmark.x, eye_landmark.y, frame_w, frame_h
                )
                
                # Blink detection
                left_eye = [landmarks[145], landmarks[159]]
                is_click, locked_x, locked_y = self.detect_blink(left_eye, screen_x, screen_y)
                
                # Move mouse if not in click preparation state
                if not is_click and not self.blink_state['click_prepared']:
                    pyautogui.moveTo(screen_x, screen_y)
                else:
                    # Keep mouse at locked position during click preparation/execution
                    pyautogui.moveTo(locked_x, locked_y)
                
                # Visualization
                x = int(eye_landmark.x * frame_w)
                y = int(eye_landmark.y * frame_h)
                cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)
                
                # Blink landmarks
                for landmark in left_eye:
                    lx = int(landmark.x * frame_w)
                    ly = int(landmark.y * frame_h)
                    cv2.circle(frame, (lx, ly), 3, (0, 255, 255), -1)
            
            # Display frame
            cv2.imshow("Eye Tracking Mouse Control", frame)
            
            # Exit condition
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        # Cleanup
        self.cam.release()
        cv2.destroyAllWindows()

# Run the eye tracking mouse control
if __name__ == "__main__":
    try:
        mouse_control = EyeTrackingMouseControl()
        mouse_control.run()
    except Exception as e:
        print(f"An error occurred: {e}")