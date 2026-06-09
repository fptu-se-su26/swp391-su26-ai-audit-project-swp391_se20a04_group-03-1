#include "BluetoothA2DPSink.h"

BluetoothA2DPSink a2dp_sink;

void setup() {
  Serial.begin(115200);

  // 1. Cấu hình các chân I2S (Kết nối sang mạch giải mã DAC MAX98357A / PCM5102)
  i2s_pin_config_t my_pin_config = {
      .bck_io_num = 27,   // Chân Bit Clock (BCLK)
      .ws_io_num = 26,    // Chân Left-Right Clock (LRCK)
      .data_out_num = 25, // Chân Data Out (DOUT)
      .data_in_num = I2S_PIN_NO_CHANGE
  };
  a2dp_sink.set_pin_config(my_pin_config);

  // 2. Cài đặt âm lượng mặc định
  a2dp_sink.set_volume(10);

  // 3. Khởi chạy Bluetooth A2DP
  a2dp_sink.set_auto_reconnect(true);
  a2dp_sink.start("ESP32_BT_Loudspeaker"); 
  
  Serial.println("ESP32 đã sẵn sàng! Hãy mở điện thoại kết nối Bluetooth.");
}

void loop() {
  // Không cần viết gì ở đây, thư viện tự động xử lý ngầm ở mức hệ thống
}