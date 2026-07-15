# -*- coding: utf-8 -*-
"""
Tiện ích WAV chỉ dùng THƯ VIỆN CHUẨN — không numpy, không soundfile, không torch.

MeloTTS xuất WAV 1 kênh / 16-bit PCM / 44100Hz, đúng thứ module `wave` đọc ghi được,
nên Pi 5 ghép được câu thông báo mà không cài thêm gì.

Không dùng `audioop` vì module này đã bị gỡ khỏi Python 3.13 (bản đang chạy trên Pi).
"""
import array
import math
import sys
import wave


class LoiWav(Exception):
    pass


def _lay_mau(frames, params):
    """frames bytes -> array('h') mẫu 16-bit, đã xử lý endian."""
    if params.sampwidth != 2:
        raise LoiWav(f"Chỉ hỗ trợ WAV 16-bit PCM, file này {params.sampwidth * 8}-bit")
    if params.nchannels != 1:
        raise LoiWav(f"Chỉ hỗ trợ WAV 1 kênh (mono), file này {params.nchannels} kênh")
    mau = array.array('h')
    mau.frombytes(frames)
    if sys.byteorder == 'big':
        mau.byteswap()  # WAV luôn little-endian
    return mau


def _ghi_mau(mau):
    """array('h') -> bytes."""
    if sys.byteorder == 'big':
        mau = array.array('h', mau)
        mau.byteswap()
    return mau.tobytes()


def do_rms(frames, params):
    """Độ to trung bình (RMS, thang 0..32767) của khối frames."""
    mau = _lay_mau(frames, params)
    if not mau:
        return 0.0
    return math.sqrt(sum(x * x for x in mau) / len(mau))


def chuan_hoa_am_luong(frames, params, rms_dich=2200, dinh_toi_da=0.95):
    """
    Cân mọi mẩu về cùng một độ to.

    BẮT BUỘC phải có: MeloTTS render mỗi từ ra một độ to khác nhau — đo thực tế thấy
    "hai" (RMS 638) nhỏ hơn "không" (RMS 2645) tới 12.4 dB, còn cụm "xe có biển số"
    (RMS 3961) to gấp 6 lần "hai". Ghép thẳng thì nghe rõ tiếng to tiếng nhỏ giật cục.

    Có chặn đỉnh để không vỡ tiếng: mẩu nào quá nhỏ mà khuếch đại lên sẽ chạm trần
    thì chỉ tăng tới mức an toàn.
    """
    mau = _lay_mau(frames, params)
    if not mau:
        return frames

    rms_hien = math.sqrt(sum(x * x for x in mau) / len(mau))
    if rms_hien < 1:
        return frames  # im lặng, không có gì để chuẩn hoá

    he_so = rms_dich / rms_hien

    dinh = max(abs(min(mau)), abs(max(mau)))
    tran = dinh_toi_da * 32767
    if dinh * he_so > tran:
        he_so = tran / dinh  # hạ hệ số để không clipping

    return _ghi_mau(array.array('h', (
        int(max(-32768, min(32767, round(x * he_so)))) for x in mau
    )))


def lam_min_hai_dau(frames, params, giay=0.008):
    """
    Fade in/out rất ngắn ở hai đầu mẩu.

    Sau khi cắt khoảng lặng, mẩu thường bắt đầu/kết thúc ngay giữa sóng âm; nối thẳng
    lại tạo bước nhảy biên độ đột ngột -> nghe thành tiếng "tách". Vuốt 8ms là hết.
    """
    mau = _lay_mau(frames, params)
    n_fade = min(int(params.framerate * giay), len(mau) // 2)
    if n_fade <= 0:
        return frames

    for i in range(n_fade):
        he_so = i / n_fade
        mau[i] = int(mau[i] * he_so)
        mau[-(i + 1)] = int(mau[-(i + 1)] * he_so)
    return _ghi_mau(mau)


def doc_wav(duong_dan):
    """Đọc file WAV -> (params, frames_bytes)."""
    with wave.open(duong_dan, 'rb') as w:
        return w.getparams(), w.readframes(w.getnframes())


def ghi_wav(duong_dan, params, frames):
    """Ghi frames ra file WAV theo params của nguồn."""
    with wave.open(duong_dan, 'wb') as w:
        w.setnchannels(params.nchannels)
        w.setsampwidth(params.sampwidth)
        w.setframerate(params.framerate)
        w.writeframes(frames)


def thoi_luong_giay(frames, params):
    """Độ dài (giây) của khối frames."""
    byte_moi_giay = params.framerate * params.sampwidth * params.nchannels
    return len(frames) / byte_moi_giay if byte_moi_giay else 0.0


def tao_khoang_lang(giay, params):
    """Sinh khối im lặng. Với PCM 16-bit lẫn float32, mẫu 0 đều là các byte 0."""
    so_byte = int(giay * params.framerate) * params.sampwidth * params.nchannels
    return b'\x00' * so_byte


def cat_khoang_lang(frames, params, nguong=300, dem_giay=0.02):
    """
    Cắt khoảng lặng ở ĐẦU và CUỐI khối frames (16-bit PCM, 1 kênh).

    Cần thiết vì mỗi lần MeloTTS render đều chèn sẵn im lặng hai đầu; ghép 10+ mẩu lại
    mà không cắt thì câu thông báo nghe rời rạc, ngắt quãng dài.

    nguong: biên độ (0..32767) coi là im lặng — 300 ~ -40dB.
    dem_giay: giữ lại một chút lặng hai đầu cho đỡ bị cụt âm.

    Trả về b'' nếu toàn bộ là im lặng (dấu hiệu mẩu đó render hỏng).
    """
    mau = _lay_mau(frames, params)

    dau = 0
    while dau < len(mau) and abs(mau[dau]) < nguong:
        dau += 1
    cuoi = len(mau)
    while cuoi > dau and abs(mau[cuoi - 1]) < nguong:
        cuoi -= 1

    if dau >= cuoi:
        return b''

    dem = int(params.framerate * dem_giay)
    dau = max(0, dau - dem)
    cuoi = min(len(mau), cuoi + dem)

    return _ghi_mau(mau[dau:cuoi])


def ghep_wav(duong_dans, khoang_lang_giay=0.06):
    """
    Nối nhiều file WAV thành một -> (params, frames).

    Mọi file phải cùng số kênh / độ sâu bit / tần số lấy mẫu, nếu không sẽ báo lỗi
    thay vì cho ra âm thanh méo mó.
    """
    if not duong_dans:
        raise LoiWav("Danh sách file cần ghép đang rỗng")

    params_goc = None
    cac_frames = []
    for p in duong_dans:
        params, frames = doc_wav(p)
        if params_goc is None:
            params_goc = params
        else:
            dang_nay = (params.nchannels, params.sampwidth, params.framerate)
            dang_goc = (params_goc.nchannels, params_goc.sampwidth, params_goc.framerate)
            if dang_nay != dang_goc:
                raise LoiWav(
                    f"{p} có định dạng {dang_nay} khác với {dang_goc} của các mẩu trước. "
                    f"Các mẩu phải được render cùng một lần bằng tao_chunks.py."
                )
        cac_frames.append(frames)

    lang = tao_khoang_lang(khoang_lang_giay, params_goc)
    return params_goc, lang.join(cac_frames)
