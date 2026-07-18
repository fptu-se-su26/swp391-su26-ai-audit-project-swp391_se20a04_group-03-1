import mqtt, { MqttClient } from "mqtt";

/**
 * Cầu nối MQTT của backend.
 *
 * Vai trò: sau khi backend cấp ô đỗ, nó publish 2 loại lệnh qua broker cloud:
 *   - smartparking/gate/<gate>/cmd  { action:"open", plate, container }  -> ESP32 mở cổng
 *   - smartparking/announce         { gate, plate, slot }                -> Pi 5 đọc bằng Piper
 *
 * Broker đặt trên cloud (ví dụ HiveMQ Cloud) để backend-cloud, Pi và ESP32 (đều ở LAN,
 * sau NAT) cùng connect RA broker — không cần mở cổng vào mạng nội bộ.
 *
 * Thay cho cách cũ: fetch(http://ESP32_IP/api/open-gate) — chỉ chạy được khi backend ở
 * cùng LAN với ESP32, và firmware ESP32 cũ vốn không có web server nên lệnh rơi vào hư không.
 *
 * Cấu hình qua .env: MQTT_URL, MQTT_USERNAME, MQTT_PASSWORD.
 * Nếu MQTT_URL trống -> service tự tắt (no-op), backend vẫn chạy bình thường.
 */

let client: MqttClient | null = null;
let enabled = false;

export const initMqtt = (): void => {
  const url = process.env.MQTT_URL; // ví dụ: mqtts://xxxx.s1.eu.hivemq.cloud:8883
  if (!url) {
    console.warn("[MQTT] MQTT_URL chưa đặt — bỏ qua điều khiển cổng/loa qua MQTT.");
    return;
  }

  client = mqtt.connect(url, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 5000, // tự nối lại mỗi 5s nếu rớt
    connectTimeout: 10000,
    clientId: `backend-${Math.random().toString(16).slice(2, 10)}`,
  });

  client.on("connect", () => {
    enabled = true;
    console.log("[MQTT] Đã kết nối broker.");
  });
  client.on("reconnect", () => console.log("[MQTT] Đang kết nối lại broker..."));
  client.on("error", (err) => console.error("[MQTT] Lỗi:", err.message));
  client.on("close", () => {
    enabled = false;
  });
};

/** Gửi lệnh MỞ CỔNG tới ESP32 tại cổng in/out. */
export const publishGateOpen = (
  gate: "in" | "out",
  plate: string,
  container?: string,
): void => {
  if (!client || !enabled) {
    console.warn(`[MQTT] Chưa sẵn sàng — bỏ lệnh mở cổng ${gate} (${plate}).`);
    return;
  }
  const topic = `smartparking/gate/${gate}/cmd`;
  const payload = JSON.stringify({ action: "open", plate: plate || "", container: container || "" });
  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) console.error(`[MQTT] Publish ${topic} lỗi:`, err.message);
    else console.log(`[MQTT] -> ${topic} ${payload}`);
  });
};

/**
 * Yêu cầu Pi 5 đọc thông báo bằng giọng nói.
 * slot có (check-in) -> câu VÀO kèm số ô; slot null (check-out) -> câu RA.
 */
export const publishAnnounce = (
  gate: "in" | "out",
  plate: string,
  slot?: string | null,
): void => {
  if (!client || !enabled) {
    console.warn(`[MQTT] Chưa sẵn sàng — bỏ thông báo loa cổng ${gate} (${plate}).`);
    return;
  }
  const topic = "smartparking/announce";
  const payload = JSON.stringify({ gate, plate: plate || "", slot: slot ?? null });
  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) console.error(`[MQTT] Publish ${topic} lỗi:`, err.message);
    else console.log(`[MQTT] -> ${topic} ${payload}`);
  });
};

/**
 * Yêu cầu Pi 5 đọc một câu LỖI bất kỳ ra loa tại cổng (xe bị từ chối, bãi đầy...).
 *
 * Khác publishAnnounce: không dựng câu từ biển+ô mà đọc NGUYÊN VĂN `text`. Pi nhận field
 * `error` -> render thẳng câu đó -> đẩy URL WAV cho ESP32 cổng tương ứng phát.
 * Câu nên ngắn, không dấu ngoặc / viết HOA gào thét để Piper đọc mượt.
 */
export const publishAnnounceError = (
  gate: "in" | "out",
  text: string,
): void => {
  if (!client || !enabled) {
    console.warn(`[MQTT] Chưa sẵn sàng — bỏ thông báo lỗi loa cổng ${gate}.`);
    return;
  }
  const topic = "smartparking/announce";
  const payload = JSON.stringify({ gate, error: text || "" });
  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) console.error(`[MQTT] Publish ${topic} (error) lỗi:`, err.message);
    else console.log(`[MQTT] -> ${topic} ${payload}`);
  });
};
