// Khai báo chân cho 2 cảm biến hồng ngoại
const int irPin1 = 13; // Cảm biến 1
const int irPin2 = 14; // Cảm biến 2 (An toàn hơn chân 12)

void setup() {
  Serial.begin(115200);
  
  // Cấu hình cả 2 chân là INPUT
  pinMode(irPin1, INPUT);
  pinMode(irPin2, INPUT);
  
  Serial.println("Bắt đầu kiểm tra hệ thống 2 cảm biến hồng ngoại (Chân 13 & 14)...");
}

void loop() {
  // Đọc trạng thái từ cảm biến 1 và cảm biến 2
  int state1 = digitalRead(irPin1);
  int state2 = digitalRead(irPin2);
  
  // In trạng thái cảm biến 1
  Serial.print("CB1 (Chân 13): ");
  if (state1 == LOW) {
    Serial.print("Phát hiện vật cản! 13| ");
  } else {
    Serial.print("Trống trải...  13    | ");
  }
  
  // In trạng thái cảm biến 2
  Serial.print("CB2 (Chân 14): ");
  if (state2 == LOW) {
    Serial.println("Phát hiện vật cản 14!");
  } else {
    Serial.println("Trống trải... 14");
  }
  
  delay(300); // Đọc lại sau mỗi 300ms
}