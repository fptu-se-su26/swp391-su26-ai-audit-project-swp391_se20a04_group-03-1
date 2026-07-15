# -*- coding: utf-8 -*-
"""
Từ vựng dùng CHUNG giữa bộ sinh chunk (tao_chunks.py, chạy trên laptop) và bộ ghép
(thong_bao.py, chạy trên Pi 5).

Cả hai bắt buộc import từ đây. Nhờ vậy nếu sinh thiếu mẩu nào thì lúc ghép sẽ báo lỗi
rõ ràng, thay vì phát ra một câu bị cụt mà không ai biết.
"""

# Đọc từng chữ số. Biển số phải đọc rời từng ký tự ("một hai ba"), KHÔNG đọc thành
# số nguyên ("một trăm hai mươi ba") — xem luu_y.md.
CHU_SO = {
    '0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn',
    '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín',
}

# Phiên âm tên chữ cái. I và Y đọc tách bạch ("i ngắn" / "y dài") để người nghe
# không lẫn — bản cũ đọc I thành "y", trùng với Y.
CHU_CAI = {
    'A': 'a', 'B': 'bê', 'C': 'xê', 'D': 'đê', 'E': 'e', 'F': 'ép',
    'G': 'gờ', 'H': 'hát', 'I': 'i ngắn', 'J': 'gi', 'K': 'ca', 'L': 'lờ',
    'M': 'mờ', 'N': 'nờ', 'O': 'o', 'P': 'pê', 'Q': 'quy', 'R': 'rờ',
    'S': 'ét', 'T': 'tê', 'U': 'u', 'V': 'vê', 'W': 'vê đúp', 'X': 'ích',
    'Y': 'y dài', 'Z': 'zét',
}

# Các cụm cố định trong câu thông báo.
CUM_TU = {
    'mo_dau': 'xe có biển số',
    'vao_o': 'di chuyển vào ô số',
}

# Số ô lớn nhất cần đọc được. Tăng lên nếu bãi có nhiều ô hơn rồi chạy lại tao_chunks.py.
SO_O_TOI_DA = 50

_DON_VI = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']


class LoiTuVung(Exception):
    pass


def so_sang_chu(n):
    """
    Đọc số tự nhiên 0..999 theo tiếng Việt, dùng cho SỐ Ô (đọc tự nhiên, khác biển số).

    Xử lý đúng các biến âm: 15 -> "mười lăm", 21 -> "hai mươi mốt", 105 -> "một trăm linh năm".
    """
    if not isinstance(n, int) or not 0 <= n <= 999:
        raise LoiTuVung(f"Chỉ đọc được số 0..999, nhận: {n!r}")

    if n < 10:
        return _DON_VI[n]

    if n < 20:
        dv = n - 10
        if dv == 0:
            return 'mười'
        if dv == 5:
            return 'mười lăm'
        return 'mười ' + _DON_VI[dv]

    if n < 100:
        chuc, dv = divmod(n, 10)
        chu = _DON_VI[chuc] + ' mươi'
        if dv == 0:
            return chu
        if dv == 1:
            return chu + ' mốt'
        if dv == 5:
            return chu + ' lăm'
        return chu + ' ' + _DON_VI[dv]

    tram, du = divmod(n, 100)
    chu = _DON_VI[tram] + ' trăm'
    if du == 0:
        return chu
    if du < 10:
        return chu + ' linh ' + _DON_VI[du]
    return chu + ' ' + so_sang_chu(du)


def ma_ky_tu(c):
    """Tên file (không đuôi) của mẩu WAV đọc 1 ký tự."""
    return 'kytu_' + c.upper()


def ma_cum(ten):
    """Tên file của mẩu WAV đọc 1 cụm cố định."""
    return 'cum_' + ten


def ma_o_so(n):
    """Tên file của mẩu WAV đọc số ô."""
    return 'oso_' + str(n)


def tat_ca_chunk(so_o_toi_da=SO_O_TOI_DA):
    """
    Toàn bộ mẩu cần render: {mã_chunk: văn_bản_để_đọc}.

    tao_chunks.py duyệt dict này để sinh ra đúng bấy nhiêu file WAV.
    """
    ds = {}
    for ten, van_ban in CUM_TU.items():
        ds[ma_cum(ten)] = van_ban
    for c, van_ban in CHU_SO.items():
        ds[ma_ky_tu(c)] = van_ban
    for c, van_ban in CHU_CAI.items():
        ds[ma_ky_tu(c)] = van_ban
    for n in range(1, so_o_toi_da + 1):
        ds[ma_o_so(n)] = so_sang_chu(n)
    return ds


def _kiem_o_so(o_so, so_o_toi_da):
    if not isinstance(o_so, int) or not 1 <= o_so <= so_o_toi_da:
        raise LoiTuVung(
            f"Số ô phải trong khoảng 1..{so_o_toi_da}, nhận: {o_so!r}. "
            f"Nếu bãi có nhiều ô hơn thì tăng SO_O_TOI_DA."
        )


def _tach_ky_tu(bien_so):
    """
    Biển số -> danh sách ký tự IN HOA đọc được.

    Dấu '-', '.', khoảng trắng được bỏ qua. Ký tự lạ -> báo lỗi ngay thay vì đọc
    thiếu âm thầm.
    """
    ds = []
    for c in str(bien_so):
        if c in '- .' or c.isspace():
            continue
        hoa = c.upper()
        if hoa not in CHU_SO and hoa not in CHU_CAI:
            raise LoiTuVung(f"Ký tự không đọc được trong biển số {bien_so!r}: {c!r}")
        ds.append(hoa)

    if not ds:
        raise LoiTuVung(f"Biển số rỗng: {bien_so!r}")
    return ds


def cau_thong_bao(bien_so, o_so, so_o_toi_da=SO_O_TOI_DA):
    """
    Biển số + số ô -> CÂU tiếng Việt hoàn chỉnh, cho TTS đọc liền một mạch (Piper).

    Ví dụ ("51A-12345", 3) ->
        "xe có biển số năm một a một hai ba bốn năm, di chuyển vào ô số ba."

    Biển số vẫn đọc RỜI từng ký tự theo luu_y.md; chỉ SỐ Ô mới đọc tự nhiên.
    Dấu phẩy trước "di chuyển" là cố ý: Piper ngắt nhịp ở đó cho dễ nghe.
    """
    _kiem_o_so(o_so, so_o_toi_da)
    tu = [CHU_SO[c] if c in CHU_SO else CHU_CAI[c] for c in _tach_ky_tu(bien_so)]
    return (f"{CUM_TU['mo_dau']} {' '.join(tu)}, "
            f"{CUM_TU['vao_o']} {so_sang_chu(o_so)}.")


def danh_sach_chunk(bien_so, o_so, so_o_toi_da=SO_O_TOI_DA):
    """
    Biển số + số ô -> danh sách mã chunk cần ghép, theo đúng thứ tự phát.

    Ví dụ ("51A-12345", 3) ->
        ['cum_mo_dau', 'kytu_5', 'kytu_1', 'kytu_A', 'kytu_1', 'kytu_2',
         'kytu_3', 'kytu_4', 'kytu_5', 'cum_vao_o', 'oso_3']

    CHỈ dùng cho hướng ghép chunk (đã bỏ — xem TTS_TIEP_TUC.md). Giữ lại để tham khảo.
    """
    _kiem_o_so(o_so, so_o_toi_da)
    ds = [ma_cum('mo_dau')]
    ds += [ma_ky_tu(c) for c in _tach_ky_tu(bien_so)]
    ds.append(ma_cum('vao_o'))
    ds.append(ma_o_so(o_so))
    return ds
