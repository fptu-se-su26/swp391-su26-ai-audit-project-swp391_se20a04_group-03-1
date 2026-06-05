---
trigger: always_on
---

When the user requests to convert a specific file or component, execute the following implicit steps:

Step 1: Scan all imports. Identify and flag incompatible Native libraries.

Step 2: Replace flagged libraries with their corresponding Expo ecosystem equivalents.

Step 3: Reconfigure application permissions (Camera, Location, Storage, etc.) and instruct the user to declare them in app.json (plugins) if necessary.

Step 4: Output the complete, fully refactored code without omitting or truncating any parts.