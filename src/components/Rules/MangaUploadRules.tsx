const MangaUploadRules = () => {
  return (
    <section className="space-y-4 p-3 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-lg lg:text-xl font-semibold">Quy ước</h1>
      <div>
        <h2 className="text-lg font-medium">Ảnh</h2>
        <ol className="list-decimal list-inside">
          <li>
            Phải là định dạng ảnh <span className="font-semibold">PNG</span>,{' '}
            <span className="font-semibold">JPEG</span>,{' '}
            <span className="font-semibold">JPG</span>
          </li>
          <li>
            Kích cỡ phải dưới <span className="font-semibold">4MB</span>
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Tên</h2>
        <ol className="list-decimal list-inside">
          <li>
            Tối thiểu <span className="font-semibold">3</span> kí tự, tối đa{' '}
            <span className="font-semibold">256</span> kí tự
          </li>
          <li>
            Tên chỉ nhận <span className="font-semibold">Alphanumeric</span>. Kí
            tự <span className="font-semibold">Việt Nam</span>. Kí tự đặc biệt
            phổ thông (., !, @, ...)
          </li>
          <li>
            Không được ghi thêm từ ngữ{' '}
            <span className="font-semibold">không liên quan</span> tới tên
            truyện. Ví dụ{' '}
            <span className="font-semibold">ABC [UPDATE CHAP XX]</span>
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Slug</h2>
        <ol className="list-decimal list-inside">
          <li>
            Slug là <span className="font-semibold">đường dẫn (Link)</span>{' '}
            truyện của bạn
          </li>
          <li>
            Chỉ chấp nhận <span className="font-semibold">chữ thường</span>,{' '}
            <span className="font-semibold">số</span>,{' '}
            <span className="font-semibold">dấu gạch ngang</span>. Tối đa{' '}
            <span className="font-semibold">32</span> kí tự
          </li>
          <li>
            Hệ thống sẽ <span className="font-semibold">tự động tạo</span> slug
            nếu bạn không điền
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Tên khác</h2>
        <ol className="list-decimal list-inside">
          <li>
            Tối đa <span className="font-semibold">5</span> tên
          </li>
          <li>
            Tối đa <span className="font-semibold">512</span> kí tự
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Sơ lược</h2>
        <ol className="list-decimal list-inside">
          <li>
            Sơ lược sẽ là thông tin hiển thị ra{' '}
            <span className="font-semibold">Trang chủ</span> (Mục Mới cập nhật,
            Tiêu Điểm,...)
          </li>
          <li>
            Tối đa <span className="font-semibold">256</span> kí tự
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Liên kết MXH</h2>
        <ol className="list-decimal list-inside">
          <li>
            Facebook sẽ chỉ nhận <span className="font-semibold">Profile</span>{' '}
            hoặc <span className="font-semibold">Page</span>
          </li>
          <li>
            Discord sẽ chỉ nhận{' '}
            <span className="font-semibold">Link invite</span>. Server phải bật{' '}
            <span className="font-semibold">Widget</span>. Khuyên dùng Link
            Invite vĩnh viễn
          </li>
        </ol>
      </div>
    </section>
  );
};

export default MangaUploadRules;
