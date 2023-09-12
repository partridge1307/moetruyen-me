const ChapterUploadRules = () => {
  return (
    <section className="space-y-4 p-3 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-lg lg:text-xl font-semibold">Quy ước</h1>

      <div>
        <h2 className="text-lg font-medium">Ảnh</h2>
        <ol className="list-decimal list-inside">
          <li>
            Ảnh phải <span className="font-semibold">dưới 4MB</span>
          </li>
          <li>
            Tên ảnh đặt theo <span className="font-semibold">vị trí ảnh</span>.
            VD: <span className="font-semibold">01.jpg</span>,{' '}
            <span className="font-semibold">02.jpg</span>,...
          </li>
          <li>
            Định dạng ảnh là <span className="font-semibold">JPG</span>,{' '}
            <span className="font-semibold">JPEG</span>,{' '}
            <span className="font-semibold">PNG</span>
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Số thứ tự</h2>
        <ol className="list-decimal list-inside">
          <li>
            STT luôn phải <span className="font-semibold">lớn hơn 0</span>
          </li>
          <li>
            Nếu STT là <span className="font-semibold">0</span> mặc định hệ
            thống sẽ <span className="font-semibold">tự động tạo STT</span> sau
            Chapter mới nhất (Chưa có Chapter nào sẽ là 1)
          </li>
        </ol>
      </div>

      <div>
        <h2 className="text-lg font-medium">Tên chapter</h2>
        <ol className="list-decimal list-inside">
          <li>
            <span className="font-semibold">Không</span> được điền STT Chapter,
            Volume vào tên Chapter
          </li>
          <li>
            <span className="font-semibold">Không</span> điền nội dung không
            liên quan tới tên Chapter. VD:{' '}
            <span className="font-semibold">ABC [Mới nhất]</span>
          </li>
        </ol>
      </div>
    </section>
  );
};

export default ChapterUploadRules;
