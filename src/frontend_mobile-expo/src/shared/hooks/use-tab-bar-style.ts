import { useSafeAreaInsets } from "react-native-safe-area-context";
import { stitchPalette } from "@/shared/theme";

/**
 * Style thanh tab, cộng thêm vùng an toàn dưới đáy máy.
 *
 * Trước đây chiều cao bị gõ cứng 74 + paddingBottom 8. Máy dùng CỬ CHỈ vuốt thì
 * vẫn ổn (vạch home mỏng), nhưng máy dùng PHÍM ĐIỀU HƯỚNG ẢO có thanh nút cao
 * ~48dp đè lên -> nhãn và icon tab bị che.
 *
 * insets.bottom do hệ điều hành báo đúng chiều cao thanh đó (0 khi ẩn), nên cộng
 * vào là hợp cho cả hai kiểu điều hướng, không cần dò từng dòng máy.
 */
export const TAB_BAR_BASE_HEIGHT = 74;

export function useTabBarStyle() {
  const insets = useSafeAreaInsets();

  return {
    tabBarStyle: {
      backgroundColor: stitchPalette.surfaceAlt,
      borderTopColor: stitchPalette.borderSoft,
      borderTopWidth: 1,
      height: TAB_BAR_BASE_HEIGHT + insets.bottom,
      paddingTop: 8,
      paddingBottom: 8 + insets.bottom,
    },
  };
}

/** Chiều cao thật của thanh tab — để màn hình chừa đáy cho nội dung không bị che. */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_BASE_HEIGHT + insets.bottom;
}
