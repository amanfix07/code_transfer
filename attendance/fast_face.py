import cv2
from deepface import DeepFace
import os

# Initialize the webcam (0 is the default camera)
cap = cv2.VideoCapture(0)

frame_width = 1280  # Increase the width (in pixels)
frame_height = 720  # Increase the height (in pixels)

# Set the frame width and height for the camera
cap.set(3, frame_width)  # 3 corresponds to the width
cap.set(4, frame_height)  # 4 corresponds to the height
# Path to your known faces dataset
known_faces_path = "./people_images"

# Load OpenCV's face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

while True:
    # Read a frame from the camera
    ret, frame = cap.read()

    if not ret:
        print("Failed to grab frame")
        break

    # Convert the frame to grayscale for face detection
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the grayscale image
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    # If faces are detected
    if len(faces) > 0:
        # Loop through all the detected faces
        for (x, y, w, h) in faces:
            # Crop the detected face from the frame
            face_crop = frame[y:y+h, x:x+w]

            # Convert the cropped face to RGB (DeepFace expects RGB images)
            rgb_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)

            try:
                # Use DeepFace to find matches in the database
                result = DeepFace.find(img_path=rgb_face, db_path=known_faces_path, enforce_detection=False)

                # If faces are detected and matched
                if len(result) > 0:
                    for match in result:
                        # Get the matched person's name (assuming directory name is the person's name)
                        matched_person = match['identity'].iloc[0]  # Get the first match
                        
                        # Extract the person's name (i.e., the directory name, not full path)
                        person_name = os.path.basename(os.path.dirname(matched_person))
                        
                        # Draw rectangle around the face
                        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                        
                        # Display the name of the matched person
                        cv2.putText(frame, f"{person_name}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                else:
                    # If no match, display a message
                    cv2.putText(frame, "No Match Found", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            except Exception as e:
                print(f"Error during face recognition: {e}")

    else:
        cv2.putText(frame, "No Face Detected", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Display the frame with the drawn rectangles and names
    cv2.imshow('Live Face Recognition', frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close all windows
cap.release()
cv2.destroyAllWindows()